import mongoose from 'mongoose';
//import _ from 'lodash';

let Agents = mongoose.model('Agents');
let Groups = mongoose.model('Groups');
let Suppliers = mongoose.model('Suppliers');

class AgentsController {
	constructor(){
		this.properties = {
			fullName : ({name, lastname}) => `${name} ${lastname}`
		}

		this.querys = {
			agent: this.get,
			agents: this.getAll
		}

		this.mutations = {
			createAgent: this.save,
			updateAgent: this.update
		}

		this.propertiesAndRelationships = {
			...this.properties,
			groups: this.groups,
			supplier: this.supplier
		}
	}

	get = async (_, {id}, {jwt, tenant_id}) => {
		try {
			return await Agents.findById(id);
		}
		catch(e){
			return null;
		}
	}

	getAll = async (_, {search_text, limit, offset, groups, suppliers}, {jwt, tenant_id}) => {
		search_text = search_text || '';
		let nodes = await Agents.find({tenant_id})
			.or([{name: new RegExp(search_text, 'i')}, {lastname: new RegExp(search_text, 'i')}])
			.skip(offset).limit(limit);
		
		const count = await Agents.count({
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

	save = async (_, {agent}, {jwt, tenant_id}) => {
		if(!agent.role) agent.role = "AGENT";
		const newAgent = await Agents.create({...agent, tenant_id});
		/*falta crear el usuario y asociarlo al agente*/
		return newAgent;
	}

	update = async (_, {agent: {id, ...update}}, {tenant_id}) => (
		await Agents.findByIdAndUpdate(id, update, {new: true})
	)

	groups = async ({id}, _, {tenant_id}) => (
		await Groups.find({tenant_id, agents: {$in: [id]} })
	)

	supplier = async ({supplier_id}) => {
		if(!supplier_id) return null;
		const supplier = await Suppliers.findById(supplier_id);
        return supplier;
	}

}

export default new AgentsController