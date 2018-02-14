import mongoose from 'mongoose';
//import _ from 'lodash';

let Clients = mongoose.model('Clients');

class ClientsController {
	properties = {
		id : client => client._id,
		fullName : ({name, lastname}) => `${name} ${lastname}`
	}

	get = async (_, {id}, {jwt, tenant_id}) => {
		try {
			const client = await Clients.findById(id);
			return client;
		}
		catch(e){
			return null;
		}
	}

	getAll = async (_, args, {jwt, tenant_id}) => {
		const nodes = await Clients.find({tenant_id});
		return({
			nodes: nodes,
			count: nodes.length || 0
		})
	}

	save = async (_, {client}, {jwt, tenant_id}) => {
		const newClient = await Clients.create({...client, tenant_id});
		return newClient;
	}

	update = async (_, {client: {id, ...update}}, {tenant_id}) => {
		const clientUpdated = Clients.findOneAndUpdate(id, update, {new: true});
		return clientUpdated;
	}

}

export default new ClientsController