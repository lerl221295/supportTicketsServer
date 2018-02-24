import mongoose from 'mongoose';
//import _ from 'lodash';

let Activities = mongoose.model('Activities');
let Tickets = mongoose.model('Tickets');
let Agents = mongoose.model('Agents');
let Fields = mongoose.model('Fields');

class ActivitiesController {
    constructor(){
        this.querys = {
            activities: this.getAll
        }

        this.propertiesAndRelationships = {
            __resolveType: this.resolveType,
        }

        this.creationActivity = {
            type: () => "CREATION",
            ticket: this.ticket
        }

        this.upgradeActivity = {
            type: () => "UPGRADE",
            ticket: this.ticket,
            type_autor: this.typeAutor,
            autor: this.autor
        }

        this.upgradeActivityActions = {
            __resolveType: this.resolveTypeActivityActions
        }

        this.upgradeActivityActionAssignment = {
            bearer: this.ticketBearer
        }

        this.ticketBearer = {
            __resolveType: this.resolveTypeTicketBearer
        }
    }

    resolveType = ({creation}) => do {
        if(creation) "CreationActivity";
        else "UpgradeActivity";
    }

    resolveTypeActivityActions = ({type}) => do {
        if(type === "ASSIGNMENT") "UpgradeActivityActionAssignment";
        else if(type === "UPDATE") "UpgradeActivityActionUpdate";
    }

    resolveTypeTicketBearer = async (model, _, {tenant_id}) => do {
        if(model.role && model.role === "AGENT") "Agent";
        else if(model.agents) "Group";
        else "Supplier";
    }

    ticket = async ({ticket_id}, _, {tenant_id}) => (
        await Tickets.findOne({_id: ticket_id, tenant_id}).populate('field_values.field')
    )

    typeAutor = ({autor: {type}}) => type;

    autor = async ({autor}, _, {tenant_id}) => do {
        if(autor.type === "SYSTEM") null;
        else await Agents.findOne({tenant_id, _id: autor.id});
    }

    ticketBearer = async ({prop_id, new_id}, _, {tenant_id}) => {
        const ticketProp = await Fields.findOne({tenant_id, _id: prop_id});
        if(ticketProp.key === "agent")
            return await Agents.findOne({tenant_id, _id: new_id});
        if(ticketProp.key === "supplier")
            return await Suppliers.findOne({tenant_id, _id: new_id});
        if(ticketProp.key === "group")
            return await Groups.findOne({tenant_id, _id: new_id});
    }

    getAll = async (_, {ticket_number, limit, offset}, {jwt, tenant_id}) => {
        if(ticket_number){
            const ticket = await Tickets.find({tenant_id, number: ticket_number});
            if(!ticket) return null;
            
            const nodes = await Activities.find({tenant_id, ticket_id: ticket.id})
                .sort({time: -1})
                .skip(offset).limit(limit);

            const count = await Activities.count({
                tenant_id, ticket_id: ticket.id
            });
            
            return({
                nodes,
                count
            })
        }
        /*si ticket_number no se provee, se obtiene para todos los tickets*/
        const nodes = await Activities.find({tenant_id})
            .sort({time: -1})
            .skip(offset).limit(limit);

        const count = await Activities.count({
            tenant_id
        });
        
        return({
            nodes,
            count
        })
    }

}

export default new ActivitiesController