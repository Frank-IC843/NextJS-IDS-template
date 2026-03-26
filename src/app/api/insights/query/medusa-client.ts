import { createHmac } from 'node:crypto';
import mysql from 'mysql2/promise';
import { executeSnowflakeSql, hasSnowflakeExecutionConfig } from '@/app/api/insights/query/snowflake-client';

const DEFAULT_MEDUSA_RPC_URL = 'https://rpc-medusa-data-eng.dev.icprivate.com';
const DEFAULT_MEDUSA_SQL_HOST = 'medusa-sql.dev.instacart.tools';
const DEFAULT_MEDUSA_SQL_PORT = 3306;
const DEFAULT_MEDUSA_SQL_USER = 'admin';
const DEFAULT_MEDUSA_SQL_DATABASE = 'magic';

const MEDUSA_COMPILE_PATH = '/rpc/instacart.medusa.v1.MedusaService/CompileMedusaQuery';

type InsightExecutionMode = 'auto' | 'compiled_snowflake' | 'medusa_sql';

export type MedusaExecutionResult = {
  compiledSql: string | null;
  rows: Record<string, unknown>[];
};

export async function compileMedusaQuery(medusaSql: string) {
  const bearerToken = buildMedusaRpcBearerToken();
  const rpcUrl = process.env.MEDUSA_RPC_URL ?? DEFAULT_MEDUSA_RPC_URL;

  if (!bearerToken) {
    return null;
  }

  const response = await fetch(`${rpcUrl.replace(/\/$/, '')}${MEDUSA_COMPILE_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: medusaSql,
    }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractMedusaErrorMessage(payload) ?? 'Unable to compile the Medusa query.');
  }

  return extractCompiledSql(payload);
}

export async function executeMedusaQuery(medusaSql: string): Promise<Record<string, unknown>[]> {
  const password = process.env.MEDUSA_SQL_PASSWORD;

  if (!password) {
    throw new Error('Missing `MEDUSA_SQL_PASSWORD`. Configure the Medusa SQL server credentials before running this route.');
  }

  const connection = await mysql.createConnection({
    host: process.env.MEDUSA_SQL_HOST ?? DEFAULT_MEDUSA_SQL_HOST,
    port: Number(process.env.MEDUSA_SQL_PORT ?? DEFAULT_MEDUSA_SQL_PORT),
    user: process.env.MEDUSA_SQL_USER ?? DEFAULT_MEDUSA_SQL_USER,
    password,
    database: process.env.MEDUSA_SQL_DATABASE ?? DEFAULT_MEDUSA_SQL_DATABASE,
    connectTimeout: Number(process.env.MEDUSA_SQL_CONNECT_TIMEOUT_MS ?? 10_000),
    decimalNumbers: true,
  });

  try {
    const [rows] = await connection.query(medusaSql);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(row => normalizeRow(row as Record<string, unknown>));
  } finally {
    await connection.end();
  }
}

export async function runMedusaQuery(medusaSql: string): Promise<MedusaExecutionResult> {
  const executionMode = resolveExecutionMode();
  let compiledSql: string | null = null;

  try {
    compiledSql = await compileMedusaQuery(medusaSql);
  } catch (error) {
    if (executionMode !== 'compiled_snowflake') {
      throw error;
    }

    throw new Error(error instanceof Error ? error.message : 'Unable to compile the Medusa query.');
  }

  if (executionMode === 'compiled_snowflake' || (executionMode === 'auto' && compiledSql && (await hasSnowflakeExecutionConfig()))) {
    if (!compiledSql) {
      throw new Error(
        'Medusa did not return compiled Snowflake SQL. Confirm `MEDUSA_RPC_BEARER_TOKEN` is valid before enabling Snowflake execution.',
      );
    }

    return {
      compiledSql,
      rows: await executeSnowflakeSql(compiledSql),
    };
  }

  const rows = await executeMedusaQuery(medusaSql);

  return {
    compiledSql,
    rows,
  };
}

function resolveExecutionMode(): InsightExecutionMode {
  const configuredMode = process.env.INSIGHTS_QUERY_EXECUTION_MODE?.trim();

  if (!configuredMode) {
    return 'auto';
  }

  if (configuredMode === 'auto' || configuredMode === 'compiled_snowflake' || configuredMode === 'medusa_sql') {
    return configuredMode;
  }

  throw new Error(
    `Unsupported \`INSIGHTS_QUERY_EXECUTION_MODE\` value "${configuredMode}". Use "auto", "compiled_snowflake", or "medusa_sql".`,
  );
}

function buildMedusaRpcBearerToken() {
  const explicitToken = process.env.MEDUSA_RPC_BEARER_TOKEN;

  if (explicitToken) {
    return explicitToken;
  }

  const jwtSecret = process.env.MEDUSA_RPC_JWT_SECRET ?? process.env.CORA_JWT_SECRET;

  if (!jwtSecret) {
    return null;
  }

  const subject = process.env.MEDUSA_RPC_SUBJECT ?? 'instacart-business-insights@instacart.com';
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = encodeJwtSegment({
    alg: 'HS256',
    typ: 'JWT',
  });
  const payload = encodeJwtSegment({
    sub: subject,
    iat: nowInSeconds,
    exp: nowInSeconds + 60 * 5,
  });
  const unsignedToken = `${header}.${payload}`;
  const signature = createHmac('sha256', jwtSecret).update(unsignedToken).digest('base64url');

  return `${unsignedToken}.${signature}`;
}

function encodeJwtSegment(value: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function extractCompiledSql(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidateKeys = ['compiledSql', 'compiled_sql', 'compiledQuery', 'compiled_query', 'query', 'sql'];

  for (const key of candidateKeys) {
    const candidateValue = (payload as Record<string, unknown>)[key];

    if (typeof candidateValue === 'string' && candidateValue.trim().length > 0) {
      return candidateValue;
    }

    if (candidateValue && typeof candidateValue === 'object') {
      const nestedValue = extractCompiledSql(candidateValue);

      if (nestedValue) {
        return nestedValue;
      }
    }
  }

  return null;
}

function extractMedusaErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidateKeys = ['error', 'msg', 'message', 'detail'];

  for (const key of candidateKeys) {
    const candidateValue = (payload as Record<string, unknown>)[key];

    if (typeof candidateValue === 'string' && candidateValue.trim().length > 0) {
      return candidateValue;
    }
  }

  return null;
}

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const normalizedKey = key.toLowerCase();

      if (typeof value === 'bigint') {
        return [normalizedKey, Number(value)];
      }

      return [normalizedKey, value];
    }),
  );
}
