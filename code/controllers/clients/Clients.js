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

	getAll = async (_, {search_text, limit, offset}, {jwt, tenant_id}) => {
		search_text = search_text || '';
		let nodes = await Clients.find({tenant_id})
			.or([{name: new RegExp(search_text, 'i')}, {lastname: new RegExp(search_text, 'i')}])
			.skip(offset).limit(limit);
		
		const count = await Clients.count({
			$and: [
				{tenant_id}, 
				{$or: [{name: new RegExp(search_text, 'i')}, {lastname: new RegExp(search_text, 'i')}]}
			]
		});
		
		return({
			nodes: nodes,
			count
		})
	}

	save = async (_, {client}, {jwt, tenant_id}) => {
		const newClient = await Clients.create({...client, tenant_id});
		/*falta crear el usuario y asociarlo al cliente*/
		return newClient;
	}

	update = async (_, {client: {id, ...update}}, {tenant_id}) => {
		const clientUpdated = Clients.findByIdAndUpdate(id, update, {new: true});
		return clientUpdated;
	}

}

export default new ClientsController