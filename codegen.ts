import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
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
};

export default config;
