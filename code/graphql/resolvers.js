/*controllers*/
import Clients from '../controllers/Clients'

import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const resolvers = {
	Query: {
        ...Clients.querys
	},
	Mutation: {
		...Clients.mutations
	},
	Client: Clients.propertiesAndRelationships
};

export default resolvers;