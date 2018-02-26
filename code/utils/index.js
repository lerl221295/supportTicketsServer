import moment from "moment/moment";
import mongoose from 'mongoose';

const Policies = mongoose.model('Policies');

export const getResponseResolveTime = async ({field_values, time, type, tenant_id}) => {
    const
        client_id = field_values.find(({field: {key}}) => key === 'client').value.ent_id,
        priority = field_values.find(({field: {key}}) => key === 'priority').value.key,
        { objectives } = await Policies.findOne({tenant_id, clients: client_id}, 'objectives').sort('position'),
        clientObjective = objectives.find(({priority: objPriority}) => objPriority === priority);
    return moment(time).add(clientObjective[type].value, clientObjective[type].unity).toDate();
}