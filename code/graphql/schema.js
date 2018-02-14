import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import resolvers from './resolvers';
import enums from './enums.graphql'
import inputs from './inputs.graphql'
import types from './types.graphql'
import esquema from './schema.graphql'

import { mocks } from './schema-dev'

const graphQLSchema = `
${enums}
${types}
${inputs}
${esquema}
`;

const schema = makeExecutableSchema({ typeDefs: graphQLSchema, resolvers });
//addMockFunctionsToSchema({ schema, mocks, preserveResolvers: true });
export default schema