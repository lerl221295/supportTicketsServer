/*controllers*/
import Clients from '../controllers/Clients'
import Organizations from '../controllers/Organizations'
import BusinessHours from '../controllers/BusinessHours'

import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const resolvers = {
	Query: {
        ...Clients.querys,
        ...Organizations.querys,
        ...BusinessHours.querys
	},
	Mutation: {
		...Clients.mutations,
		...Organizations.mutations,
		...BusinessHours.mutations
	},
	Client: Clients.propertiesAndRelationships,
	Organization: Organizations.propertiesAndRelationships,
	BusinessHours: BusinessHours.propertiesAndRelationships
};

export default resolvers;