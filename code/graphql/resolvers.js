/*controllers*/
import Clients from '../controllers/clients'

import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const resolvers = {
	Query: {
        ...Clients.querys
	},
	Mutation: {
		...Clients.mutations
	},
	Client: Clients.relationships.clients
};

export default resolvers;