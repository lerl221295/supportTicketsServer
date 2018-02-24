/*controllers*/
import Clients from '../controllers/Clients'
import Organizations from '../controllers/Organizations'
import Agents from '../controllers/Agents'
import Groups from '../controllers/Groups'
import Suppliers from '../controllers/Suppliers'
import BusinessHours from '../controllers/BusinessHours'
import Tickets from '../controllers/Tickets'
import Activities from '../controllers/Activities'
import TicketFields from '../controllers/TicketFields'

import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const resolvers = {
	Query: {
        ...Clients.querys,
        ...Organizations.querys,
        ...BusinessHours.querys,
        ...Tickets.querys,
        ...Agents.querys,
        ...Groups.querys,
        ...Suppliers.querys,
        ...Activities.querys
	},
	Mutation: {
		...Clients.mutations,
		...Organizations.mutations,
		...BusinessHours.mutations,
		...Tickets.mutations,
		...Agents.mutations,
		...Groups.mutations,
		...Suppliers.mutations
	},
	Client: Clients.propertiesAndRelationships,
	Organization: Organizations.propertiesAndRelationships,
	Agent: Agents.propertiesAndRelationships,
	Group: Groups.propertiesAndRelationships,
	Supplier: Suppliers.propertiesAndRelationships,
	BusinessHours: BusinessHours.propertiesAndRelationships,
	Ticket: Tickets.propertiesAndRelationships,
	State: TicketFields.stateProps,
	FieldValue: TicketFields.fieldValueProps,
	Field: TicketFields.fieldProps,
	Activity: Activities.propertiesAndRelationships,
	CreationActivity: Activities.creationActivity,
	UpgradeActivity: Activities.upgradeActivity,
	UpgradeActivityAction: Activities.upgradeActivityActions,
	UpgradeActivityActionAssignment: Activities.upgradeActivityActionAssignment,
	TicketBearer: Activities.ticketBearer
};

export default resolvers;