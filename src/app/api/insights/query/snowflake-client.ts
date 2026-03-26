import 'server-only';

import { constants as fsConstants } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import type { Connection, ConnectionOptions } from 'snowflake-sdk';

const DEFAULT_SNOWFLAKE_ACCOUNT = 'INSTACART-INSTACART';
const DEFAULT_SNOWFLAKE_DATABASE = 'INSTADATA';
const DEFAULT_SNOWFLAKE_PRIVATE_KEY_PATH = path.join(homedir(), '.ssh', 'rsa_key.pem');
const DEFAULT_SNOWFLAKE_ROLE = 'IC_ENG_ROLE';
const DEFAULT_SNOWFLAKE_WAREHOUSE = 'DEVELOPER_WH';
const SNOWFLAKE_APPLICATION_NAME = 'ids-nextjs-medusa-insights';
const SNOWFLAKE_SESSION_SETUP_SQL = "ALTER SESSION SET QUOTED_IDENTIFIERS_IGNORE_CASE = TRUE";
const SNOWFLAKE_QUERY_TAG = JSON.stringify({
  app: 'ids-nextjs',
  feature: 'insights',
  source: 'medusa_compiled_sql',
});

export async function hasSnowflakeExecutionConfig() {
  const username = process.env.SNOWFLAKE_USERNAME?.trim();

  if (!username) {
    return false;
  }

  if (process.env.SNOWFLAKE_PRIVATE_KEY?.trim()) {
    return true;
  }

  try {
    await access(resolvePrivateKeyPath(), fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function executeSnowflakeSql(sqlText: string): Promise<Record<string, unknown>[]> {
  const snowflake = await import('snowflake-sdk');
  const connection = snowflake.createConnection(await buildConnectionOptions());

  try {
    await connectSnowflake(connection);
    await executeStatement(connection, SNOWFLAKE_SESSION_SETUP_SQL);
    const rows = await executeStatement(connection, sqlText);
    return rows.map(normalizeRow);
  } finally {
    await destroySnowflakeConnection(connection);
  }
}

async function buildConnectionOptions(): Promise<ConnectionOptions> {
  const username = process.env.SNOWFLAKE_USERNAME?.trim();

  if (!username) {
    throw new Error(
      'Missing `SNOWFLAKE_USERNAME`. Set it to your Snowflake profile username before enabling compiled Snowflake execution.',
    );
  }

  return {
    account: process.env.SNOWFLAKE_ACCOUNT?.trim() || DEFAULT_SNOWFLAKE_ACCOUNT,
    username,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE?.trim() || DEFAULT_SNOWFLAKE_WAREHOUSE,
    role: process.env.SNOWFLAKE_ROLE?.trim() || DEFAULT_SNOWFLAKE_ROLE,
    database: process.env.SNOWFLAKE_DATABASE?.trim() || DEFAULT_SNOWFLAKE_DATABASE,
    privateKey: await readPrivateKeyText(),
    authenticator: 'SNOWFLAKE_JWT',
    clientSessionKeepAlive: false,
    application: SNOWFLAKE_APPLICATION_NAME,
    timeout: Number(process.env.SNOWFLAKE_QUERY_TIMEOUT_MS ?? 30_000),
    streamResult: false,
    jsTreatIntegerAsBigInt: true,
  };
}

async function readPrivateKeyText() {
  const explicitPrivateKey = process.env.SNOWFLAKE_PRIVATE_KEY?.trim();

  if (explicitPrivateKey) {
    return explicitPrivateKey.includes('BEGIN ') ? explicitPrivateKey : wrapPemBody(explicitPrivateKey);
  }

  try {
    return (await readFile(resolvePrivateKeyPath(), 'utf8')).trim();
  } catch (error) {
    throw new Error(
      `Unable to read \`SNOWFLAKE_PRIVATE_KEY_PATH\` at "${resolvePrivateKeyPath()}". ${
        error instanceof Error ? error.message : 'Unknown file error.'
      }`,
    );
  }
}

function resolvePrivateKeyPath() {
  const configuredPath = process.env.SNOWFLAKE_PRIVATE_KEY_PATH?.trim();

  if (!configuredPath) {
    return DEFAULT_SNOWFLAKE_PRIVATE_KEY_PATH;
  }

  return configuredPath.startsWith('~/') ? path.join(homedir(), configuredPath.slice(2)) : configuredPath;
}

function wrapPemBody(value: string) {
  const normalizedValue = value.replace(/\s+/g, '');
  const wrappedValue = normalizedValue.match(/.{1,64}/g)?.join('\n') ?? normalizedValue;
  return `-----BEGIN PRIVATE KEY-----\n${wrappedValue}\n-----END PRIVATE KEY-----`;
}

function connectSnowflake(connection: Connection) {
  return new Promise<Connection>((resolve, reject) => {
    connection.connect((error, nextConnection) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(nextConnection);
    });
  });
}

function executeStatement(connection: Connection, sqlText: string) {
  return new Promise<Record<string, unknown>[]>((resolve, reject) => {
    connection.execute({
      sqlText,
      parameters: {
        QUERY_TAG: SNOWFLAKE_QUERY_TAG,
      },
      complete: (error, _statement, rows) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(Array.isArray(rows) ? (rows as Record<string, unknown>[]) : []);
      },
    });
  });
}

function destroySnowflakeConnection(connection: Connection) {
  return new Promise<void>(resolve => {
    connection.destroy(() => resolve());
  });
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
