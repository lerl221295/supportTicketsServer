// import {Cliente, Tecnico, Ticket, Interaccion, Auth, Admin} from './conectors'
import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const resolvers = {
	Query: {
        customFields: async (_, args, {jwt}) => {
			return [];
		}
	}
};

export default resolvers;