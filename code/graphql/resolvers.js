/*controllers*/
import Clients from '../controllers/Clients'
import Organizations from '../controllers/Organizations'

import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const resolvers = {
	Query: {
        ...Clients.querys,
        ...Organizations.querys
	},
	Mutation: {
		...Clients.mutations,
		...Organizations.mutations
	},
	Client: Clients.propertiesAndRelationships,
	Organization: Organizations.propertiesAndRelationships
};

export default resolvers;