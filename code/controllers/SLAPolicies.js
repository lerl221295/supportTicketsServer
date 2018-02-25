import mongoose from 'mongoose';

const Policies = mongoose.model('Policies');
const Clients = mongoose.model('Clients');
const Organizations = mongoose.model('Organizations');
const Alerts = mongoose.model('Alerts');
const Agents = mongoose.model('Agents');

class PoliciesController {
	constructor (){
		this.querys = {
			SLAPolicy: this.get,
			SLAPolicies: this.getAll
		};

		this.mutations = {
			createSLAPolicy: this.save,
            updateSLAPolicy: this.update,
            deleteSLAPolicy: this.remove,
            updateSLAPoliciesOrder: this.updateOrder
		};

		this.propertiesAndRelationships = {
			clients: this.clients,
            organizations: this.organizations,
			alerts: this.alerts
		};

		this.alertsRelationships = {
			to: this.alertsTo
		};
	}

	get = async (_, {id: _id}, {jwt, tenant_id}) => {
		try {
			return await Policies.findOne({_id, tenant_id});
		}
		catch(e){
            throw new Error('La política SLA no existe en la base de datos.')
        }
	};

	getAll = async (_, {}, {jwt, tenant_id}) => {
		return await Policies.find({tenant_id}).sort('position');
	};

    save = async (_, {slapolicy: {alerts, ...slapolicy}}, {jwt, tenant_id}) => {
        // Insert new sla policy
        const newPolicy = await Policies.create({...slapolicy, tenant_id});
        // Insert sla policy alerts
        alerts = alerts.map(alert => ({...alert, sla_policy_id: newPolicy._id, tenant_id}));
        await Alerts.create(alerts);
        // Find all sla policies, except the new one
        const policies = await Policies.find({tenant_id, _id: {$ne: newPolicy._id}}).sort('position');
        // Update sla policies position
        await Promise.all(policies.map(async ({_id}, index) => await Policies.update({_id, tenant_id}, {position: index + 1})));
        // Return sla policy created
        return newPolicy;
    };

	update = async (_, {slapolicy: {id: _id, alerts, ...update}}, {tenant_id}) => {
		// If 'id' isn't received in params, then, throw exception
		if (!_id) throw new Error('El "id" es requerido para actualizar.');
        // Find policy before update then destruct position, by default and active
        const {position, by_default, active} = await Policies.findOne({_id, tenant_id});
        // Find and update policy, overwrite previous document. That is why the before destruction, it's necessary
        const policyUpdated = await Policies.findOneAndUpdate(
        	{_id, tenant_id},
			{...update, tenant_id, position, by_default, active},
			{new: true, overwrite: true});
        // If cannot update, it's because the 'id' doesn't exist for this tenant
        if (!policyUpdated) throw new Error('La política a actualizar no existe en la base de datos.');
        // Remove old sla policy alerts
        await Alerts.deleteMany({sla_policy_id: _id, tenant_id});
        // Insert new sla policy alerts
        alerts = alerts.map(alert => ({...alert, sla_policy_id: _id, tenant_id}));
        await Alerts.create(alerts);
        // Return the updated policy
        return policyUpdated;
	};

    remove = async(_, {id: _id}, {tenant_id}) => {
    	// Find and remove sla policy
    	const policy = await Policies.findOneAndRemove({tenant_id, _id, by_default: false});
    	// If cannot remove, it's because the 'id' doesn't exist, or is trying to remove default sla policy
    	if (!policy) throw new Error('La política a eliminar no se pudo eliminar porque no existe o es la política por defecto.');
        // Remove sla policy alerts
    	await Alerts.deleteMany({sla_policy_id: _id, tenant_id});
    	// Find all sla policies
    	const policies = await Policies.find({tenant_id}).sort('position');
        // Update sla policies position
    	await Promise.all(policies.map(async ({_id}, index) => await Policies.update({_id, tenant_id}, {position: index})));
        // Return sla policy removed
    	return policy;
    };

    updateOrder = async (_, {slapolicies}, {tenant_id}) => {
        // Update all policies position
        await Promise.all(
        	slapolicies.map(
        		async ({id: _id, position}) =>
					await Policies.update({_id, tenant_id}, {position})
			)
		);
        // Return ordered policies
        return await Policies.find({tenant_id}).sort('position');
	};

	clients = async ({clients}) => await Clients.find({_id: {$in: clients}});

	organizations = async ({organizations}) => await Organizations.find({_id: {$in: organizations}});

	alerts = async ({_id}) => await Alerts.find({sla_policy_id: _id});

    alertsTo = async ({to: AgentsIds}) => await Agents.find({_id: {$in: AgentsIds} })
}

export default new PoliciesController