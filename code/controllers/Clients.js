import mongoose from 'mongoose';
//import _ from 'lodash';

let Clients = mongoose.model('Clients');
let Organizations = mongoose.model('Organizations');

class ClientsController {
	constructor(){
		this.properties = {
			fullName : ({name, lastname}) => `${name} ${lastname}`
		}

		this.querys = {
			client: this.get,
			clients: this.getAll
		}

		this.mutations = {
			createClient: this.save,
			updateClient: this.update
		}

		this.propertiesAndRelationships = {
			...this.properties,
			organization: this.organization
			//organizations, tickets, devices .....
		}
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
			nodes,
			count
		})
	}

	save = async (_, {client}, {jwt, tenant_id}) => {
		if(!client.organization_id){
			const organizationWithSubdomain = 
				await Organizations.findOne({domains: client.email.split('@')[1]});
			if(organizationWithSubdomain) client.organization_id = organizationWithSubdomain._id;
		}
		const newClient = await Clients.create({...client, tenant_id});
		/*falta crear el usuario y asociarlo al cliente*/
		return newClient;
	}

	update = async (_, {client: {id, ...update}}, {tenant_id}) => (
		await Clients.findByIdAndUpdate(id, update, {new: true})
	)

	organization = async ({organization_id}) => {
		if(!organization_id) return null;
		const organization = await Organizations.findById(organization_id);
        return organization;
	}

}

export default new ClientsController