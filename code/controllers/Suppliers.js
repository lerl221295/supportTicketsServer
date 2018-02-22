import mongoose from 'mongoose';
//import _ from 'lodash';

let Suppliers = mongoose.model('Suppliers');
let Agents = mongoose.model('Agents');

class SuppliersController {
    constructor(){
        this.querys = {
            supplier: this.get,
            suppliers: this.getAll
        }

        this.mutations = {
            createSupplier: this.save,
            updateSupplier: this.update
        }

        this.propertiesAndRelationships = {
            agents: this.agents
        }
    }

    get = async (_, {id}, {jwt, tenant_id}) => {
        try {
            return await Suppliers.findById(id);
        }
        catch(e){
            return null;
        }
    }

    getAll = async (_, {search_text, limit, offset}, {jwt, tenant_id}) => {
        search_text = search_text || '';
        let nodes = await Suppliers.find({tenant_id, name: new RegExp(search_text, 'i')})
            .skip(offset).limit(limit);
        
        const count = await Suppliers.count({
            tenant_id, 
            name: new RegExp(search_text, 'i')
        });
        
        return({
            nodes,
            count
        })
    }

    save = async (_, {supplier}, {jwt, tenant_id}) => (
        await Suppliers.create({...supplier, tenant_id})
    )

    update = async (_, {supplier: {id, ...update}}, {tenant_id}) => (
        await Suppliers.findByIdAndUpdate(id, update, {new: true})
    )

    agents = async ({id}, _, {tenant_id}) => (
        await Agents.find({tenant_id, supplier_id: {$in: [id]} })
    )

}

export default new SuppliersController