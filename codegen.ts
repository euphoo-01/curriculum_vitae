import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'graphql/schema.graphql',
  documents: ['app/**/*.vue', 'graphql/**/*.gql'],
  ignoreNoDocuments: true,
  generates: {
    './graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;