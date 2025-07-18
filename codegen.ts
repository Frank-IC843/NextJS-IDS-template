import { CodegenConfig } from '@graphql-codegen/cli';
import { GRAPHQL_URL } from './src/lib/constants';

const config: CodegenConfig = {
  schema: GRAPHQL_URL,
  documents: ['src/**/queries.ts'],
  generates: {
    './src/__generated__/graphql-types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        onlyOperationTypes: true,
        nonOptionalTypename: true,
        scalars: {
          BigInt: 'string',
          ISO8601Date: 'string',
          ISO8601DateTime: 'string',
          JSON: 'Record<string, unknown>',
        },
      },
    },
  },
  hooks: {
    afterOneFileWrite: ['prettier --write'],
  },
};

export default config;
