import moment from "moment/moment";
import mongoose from 'mongoose';

const Policies = mongoose.model('Policies');
const Clients = mongoose.model('Clients');

export const getResponseResolveTime = async ({field_values, time, type, tenant_id}) => {
    const
        client_id = field_values.find(({field: {key}}) => key === 'client').value.ent_id,
        { organization_id } = await Clients.findOne({tenant_id, _id: client_id}),
        priority = field_values.find(({field: {key}}) => key === 'priority').value.key,
        { objectives } = await Policies.findOne({$or: [{tenant_id, clients: client_id}, {organizations: organization_id}, {by_default: true}]}, 'objectives').sort('position'),
        clientObjective = objectives.find(({priority: objPriority}) => objPriority === priority);
    return moment(time).add(clientObjective[type].value, clientObjective[type].unity).toDate();
}