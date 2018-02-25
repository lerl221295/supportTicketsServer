/* index all mongo models */

import TenantsModel from './Tenants'
import ClientsModel from './Clients'
import OrganizationsModel from './Organizations'
import AgentsModel from './Agents'
import GroupsModel from './Groups'
import SuppliersModel from './Suppliers'
import BusinessHoursModel from './BusinessHours'
import TicketsModel from './Tickets'
import StatesModel from './States'
import ActivitiesModel from './Activities'
import FieldsModel from './Fields'
import SLAPoliciesModel from './SLAPolicies'
import AlertsModel from './Alerts'

export default {
	ClientsModel,
	OrganizationsModel,
	TenantsModel,
	BusinessHoursModel,
	TicketsModel,
	ActivitiesModel,
	FieldsModel,
	StatesModel,
	AgentsModel,
	GroupsModel,
	SuppliersModel,
    SLAPoliciesModel,
    AlertsModel
}

