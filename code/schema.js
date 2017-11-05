import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';
import esquema from './schema.graphql';

const schema = makeExecutableSchema({ typeDefs: esquema, resolvers });
export default schema
