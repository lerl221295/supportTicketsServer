import mongoose from 'mongoose';
//import _ from 'lodash';

let Organizations = mongoose.model('Organizations');

class OrganizationsController {
    constructor(){
        this.properties = {
            id : ({_id}) => _id
        }

        this.querys = {
            organization: this.get,
            organizations: this.getAll
        }

        this.mutations = {
            createOrganization: this.save,
            updateOrganization: this.update
        }

        this.propertiesAndRelationships = {
            ...this.properties
            //clients, tickets .....
        }
    }

    get = async (_, {id}, {jwt, tenant_id}) => {
        try {
            const organization = await Organizations.findById(id);
            return organization;
        }
        catch(e){
            return null;
        }
    }

    getAll = async (_, {search_text, limit, offset}, {jwt, tenant_id}) => {
        search_text = search_text || '';
        let nodes = await Organizations.find({tenant_id, name: new RegExp(search_text, 'i')})
            .skip(offset).limit(limit);
        
        const count = await Organizations.count({
            tenant_id, 
            name: new RegExp(search_text, 'i')
        });
        
        return({
            nodes: nodes,
            count
        })
    }

    save = async (_, {organization}, {jwt, tenant_id}) => {
        const newOrganization = await Organizations.create({...organization, tenant_id});
        return newOrganization;
    }

    update = async (_, {organization: {id, ...update}}, {tenant_id}) => {
        const organizationUpdated = Organizations.findByIdAndUpdate(id, update, {new: true});
        return organizationUpdated;
    }

}

export default new OrganizationsController