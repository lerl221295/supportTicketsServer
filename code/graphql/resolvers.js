/*controllers*/
import Authenticate from '../controllers/Authenticate'
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
        ...Activities.querys,
        ...Authenticate.querys,
        ...TicketFields.querys
	},
	Mutation: {
		...Clients.mutations,
		...Organizations.mutations,
		...BusinessHours.mutations,
		...Tickets.mutations,
		...Agents.mutations,
		...Groups.mutations,
		...Suppliers.mutations,
		...Authenticate.mutations,
		...TicketFields.mutations
	},
	Client: Clients.propertiesAndRelationships,
	Organization: Organizations.propertiesAndRelationships,
	Agent: Agents.propertiesAndRelationships,
	Group: Groups.propertiesAndRelationships,
	Supplier: Suppliers.propertiesAndRelationships,
	BusinessHours: BusinessHours.propertiesAndRelationships,
	Ticket: Tickets.propertiesAndRelationships,
	Intervention: Tickets.intervention,
	Autor: Tickets.interventionAutor,
	TicketMetadata: TicketFields.ticketMetadata,
	State: TicketFields.stateProps,
	FieldValue: TicketFields.fieldValueProps,
	Field: TicketFields.fieldProps,
	FreeField: TicketFields.freeField,
	SelectField: TicketFields.selectField,
	Activity: Activities.propertiesAndRelationships,
	CreationActivity: Activities.creationActivity,
	UpgradeActivity: Activities.upgradeActivity,
	UpgradeActivityAction: Activities.upgradeActivityActions,
	UpgradeActivityActionAssignment: Activities.upgradeActivityActionAssignment,
	TicketBearer: Activities.ticketBearer,
	Notification: Authenticate.notification,
	Entity: Authenticate.entity
};

export default resolvers;