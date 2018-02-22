import mongoose from 'mongoose';
//import _ from 'lodash';

let Groups = mongoose.model('Groups');
let Agents = mongoose.model('Agents');

class GroupsController {
    constructor(){
        this.querys = {
            group: this.get,
            groups: this.getAll
        }

        this.mutations = {
            createGroup: this.save,
            updateGroup: this.update/*,
            disolveGroup: this.disolve*/

        }

        this.propertiesAndRelationships = {
            agents: this.agents,
            group_scale: this.groupScale,
            notification_agent: this.notificationAgent
        }
    }

    mapToStore = group => {
        const keys = {
            name: 'name',
            about: 'about',
            group_scale_id: 'scaling_group_id',
            agents_id: 'agents',
            notification_text: 'notification.text',
            notification_hours: 'notification.hours',
            notification_agent_id: 'notification.agent_id'
        }

        const groupMaped = {}
        for(let prop in group){
            groupMaped[keys[prop]] = group[prop];
        }
        return groupMaped;
    }


    mapToReturn = ({id, name, about, agents, scaling_group_id, notification}) => ({
        id,
        name,
        about,
        agents,
        scaling_group_id,
        notification,
        notification_text: notification.text,
        notification_hours: notification.hours
    });

    get = async (_, {id}, {jwt, tenant_id}) => {
        try {
            const group = await Groups.findById(id);
            return this.mapToReturn(group);
        }
        catch(e){
            return null;
        }
    }

    getAll = async (_, {search_text, limit, offset}, {jwt, tenant_id}) => {
        search_text = search_text || '';
        let nodes = await Groups.find({tenant_id, name: new RegExp(search_text, 'i')})
            .skip(offset).limit(limit);
        
        const count = await Groups.count({
            tenant_id, 
            name: new RegExp(search_text, 'i')
        });
        
        return({
            nodes: nodes.map(this.mapToReturn),
            count
        })
    }

    save = async (_, {group}, {jwt, tenant_id}) => {
        const newGroup = await Groups.create({...this.mapToStore(group), tenant_id});
        return this.mapToReturn(newGroup);
    }

    update = async (_, {group: {id, ...update}}, {tenant_id, jwt}) => {
        const groupUpdated = await Groups.findByIdAndUpdate(id, {$set: this.mapToStore(update)}, {new: true});
        return this.mapToReturn(groupUpdated);
    }

    /*disolve = async (_, {group: {id, ...update}}, {tenant_id}) => {
        const groupUpdated = Groups.findByIdAndUpdate(id, update, {new: true});
        return groupUpdated;
    }*/

    agents = async ({agents}, _, {tenant_id}) => (
        await Agents.find({tenant_id, _id: {$in: agents} })
    )

    groupScale = async ({scaling_group_id}, _, {tenant_id}) => {
        if(!scaling_group_id) return null;
        const group = await Groups.findOne({tenant_id, _id: scaling_group_id });
        return group;
    }

    notificationAgent = async ({notification}, _, {tenant_id}) => {
        if(!notification || !notification.agent_id) return null;
        const agent = await Agents.findOne({tenant_id, _id: notification.agent_id });
        return agent;
    }

}

export default new GroupsController