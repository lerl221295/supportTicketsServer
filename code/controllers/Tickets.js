import mongoose from 'mongoose';
import lodash from 'lodash';
import { getResponseResolveTime } from '../utils';

const Tickets = mongoose.model('Tickets');
const States = mongoose.model('States');
const Fields = mongoose.model('Fields');
const Clients = mongoose.model('Clients');
const Organizations = mongoose.model('Organizations');
const Agents = mongoose.model('Agents');
const Groups = mongoose.model('Groups');
const Suppliers = mongoose.model('Suppliers');
const Activities = mongoose.model('Activities');
const Policies = mongoose.model('Policies');


const priorities = [
    {key: "LOW", label: "Baja"},
    {key: "MEDIUM", label: "Media"},
    {key: "HIGH", label: "Alta"},
    {key: "URGENT", label: "Urgente"}
]

class TicketsController {
    constructor(){
        this.querys = {
            ticket: this.get,
            tickets: this.getAll/*,
            interventions: */
        }

        this.mutations = {
            createTicket: this.save,
            updateTicket: this.update,
            addTask: this.addTask,
            checkTask: this.checkTask,
            addIntervention: this.addIntervention
        }

        /*this.subscriptions: */
        this.ticketProps =  ['title', 'description', 'source', 'priority', 'client', 'type', 'state', 'next_states', 'agent', 'supplier', 'group'/*, 'device'*/]
        this.propertiesAndRelationships = {
            custom_fields: this.customValues,
            activities: this.ticketActivities,
            response_by: this.getAttrSLATime('first_response'),
            resolve_by: this.getAttrSLATime('solved')
        };
        for(let prop of this.ticketProps){
            this.propertiesAndRelationships[prop] = this[prop];
        }

        this.intervention = {
            type_autor: ({autor}) => autor.type,
            autor: this.autor
        }

        this.interventionAutor = {
            __resolveType: this.autorInterventionResolveType
        }

        this.transporters = {};
    }
    
    //setTransporters = transporters => this.transporters = transporters;

    setTransporter = (transporter, id) => this.transporters[id] = transporter;
    
    title = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({field}) => field.key === 'title').value.text
    )

    description = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({field}) => field.key === 'description').value.text
    )

    priority = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({field}) => field.key === 'priority').value.key
    )

    type = async ({field_values}, _, {tenant_id}) => {
        const {value: {key}, field: {options: types}} = 
            field_values.find(({field}) => field.key === 'type');
        return types.find(type => type.key === key);
    }

    source = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({field}) => field.key === 'source').value.key
    )

    state = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id}} = field_values.find(({field}) => field.key === 'state');
        return await States.findOne({tenant_id, _id: ent_id});
    }

    next_states = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id}} = field_values.find(({field}) => field.key === 'state');
        return await States.find({tenant_id, came_from: {$in: [ent_id]}});
    }

    client = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id: client_id}} = field_values.find(({field}) => field.key === 'client');
        return await Clients.findOne({tenant_id, _id: client_id});
    }

    agent = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id: agent_id}} = field_values.find(({field}) => field.key === 'agent');
        return await Agents.findOne({tenant_id, _id: agent_id});
    }

    group = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id: group_id}} = field_values.find(({field}) => field.key === 'group');
        return await Groups.findOne({tenant_id, _id: group_id});
    }

    supplier = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id: supplier_id}} = field_values.find(({field}) => field.key === 'supplier');
        return await Suppliers.findOne({tenant_id, _id: supplier_id});
    }

    ticketActivities = async ({id: ticket_id}, _, {tenant_id}) => (
        await Activities.find({tenant_id, ticket_id}).sort({time: 1})
    );

    customValues = async ({field_values}, _, {tenant_id}) => {
        const onlyCustomizedValues = field_values.reduce( (result, prop) => {
            if(prop.field && !prop.field.default){
                const value = do {
                    if(["TEXT", "TEXTAREA", "DATE"].includes(prop.field.type)) 
                        ({text: prop.value.text || prop.value.date})
                    else if(prop.field.type === "NUMBER") ({number: prop.value.num});
                    else if(prop.field.type === "CHECKBOX") ({check: prop.value.check});
                    else if(prop.field.type === "SELECT") ({key: prop.value.key});
                    /*OJO, ACA FALTA INDICAR EL LABEL DEL SELECT VALUE*/
                }

                result.push({
                    metadata: prop.field,
                    ...value
                })
            }   
            return result;
        }, []);

        return onlyCustomizedValues;
    }

    getAttrSLATime = (type) => async ({field_values, time}, _, {tenant_id}) => {
        return await getResponseResolveTime({type, field_values, time, tenant_id});
    }

    get = async (_, {number}, {jwt, tenant_id}) => (
        await Tickets.findOne({tenant_id, number}).populate('field_values.field')
    )

    filterTicket = async (ticket, filter, tenant_id) => {
        const agentId = ticket.field_values.find(({field}) => field.key == 'agent').value.ent_id;
        if(filter.unassigned){ 
            if(agentId) return false;
        }
        else if(filter.agents && filter.agents.length){
            if(!agentId || !filter.agents.includes(String(agentId))) return false;
        }

        if(filter.groups && filter.groups.length){
            const groupId = ticket.field_values.find(({field}) => field.key == 'group').value.ent_id;
            if(!filter.groups.includes(groupId)) return false;
        }

        if(filter.suppliers && filter.suppliers.length){
            const supplierId = ticket.field_values.find(({field}) => field.key == 'supplier').value.ent_id;
            if(!filter.suppliers.includes(String(supplierId))) return false;
        }
        
        const clientId = ticket.field_values.find(({field}) => field.key == 'client').value.ent_id;
        if(filter.clients && filter.clients.length)
            if(!filter.clients.includes(String(clientId))) return false;
        

        if(filter.organizations && filter.organizations.length){
            const client = await Clients.findOne({tenant_id, _id: clientId});
            if(!client.organization_id || !filter.organizations.includes(String(client.organization_id))) 
                return false;
        }

        if(filter.priorities && filter.priorities.length){
            const priority = ticket.field_values.find(({field}) => field.key == 'priority').value.key;
            if(!filter.priorities.includes(priority)) return false;
        }

        if(filter.types_keys && filter.types_keys.length){
            const type = ticket.field_values.find(({field}) => field.key == 'type').value.key;
            if(!filter.types_keys.includes(type)) return false;
        }

        if(filter.states_keys && filter.states_keys.length){
            const stateId = ticket.field_values.find(({field}) => field.key == 'state').value.ent_id;
            const state = await States.findOne({tenant_id, _id: stateId});
            if(!filter.states_keys.includes(state.key)) return false;
        }

        return true; 
    }

    getAll = async (_, {filter, order, limit, offset}, {tenant_id}) => {
        if(filter && filter.number){
            const ticket = await Tickets.find({tenant_id, number: filter.number}).populate('field_values.field');
            return({
                nodes: ticket,
                count: do {
                    if(ticket.length) 1;
                    else 0;
                }
            })
        }


        const queryConditions = {tenant_id}, orderMethod = {time: -1};
        
        if(filter && !lodash.isEmpty(filter)){
            const timeCondition = {};
            if(filter.date_from) timeCondition['$gte'] = new Date(filter.date_from);
            if(filter.date_from) timeCondition['$lte'] = new Date(filter.date_to);
            if(filter.date_to || filter.date_from) queryConditions.time = timeCondition;       
        }

        if(order == "UPWARD") orderMethod.time = 1;

        /*tickets ordenados, dentro de la fecha indicada si se indico*/
        const tickets = await Tickets.find(queryConditions).sort(orderMethod).populate('field_values.field');

        let ticketsFiltered = [];
        if(filter && !lodash.isEmpty(filter)){
            for(let ticket of tickets){
                if(await this.filterTicket(ticket, filter, tenant_id)) 
                    ticketsFiltered.push(ticket)
            }
        }else ticketsFiltered = tickets;

        const count = ticketsFiltered.length;
        const nodes = do {
            if(limit && offset)
                ticketsFiltered.slice(offset, offset+limit);
            else if(offset)
                ticketsFiltered.slice(offset);
            else if(limit) ticketsFiltered.slice(0, limit);
            else ticketsFiltered;
        }

        return {
            nodes,
            count
        };
        
    }

    getCustomValue = (customizedField, customizedValue) => ({
        field: customizedField.id,
        value: do {
            if(customizedField.type === 'TEXT' || customizedField.type === 'TEXTAREA') 
                ({text: customizedValue.text});
            else if(customizedField.type === 'DATE') new Date({date: customizedValue.text});
            else if(customizedField.type === 'NUMBER') ({num: customizedValue.num});
            else if(customizedField.type === 'CHECKBOX') ({check: customizedValue.check});
            else if(customizedField.type === 'SELECT') ({key: customizedValue.key});
        }
    })

    save = async (_, {ticket}, {requester, tenant_id}) => {
        const ticketBuilded = { tenant_id };
        if(ticket.email_reference) ticketBuilded.email_reference = ticket.email_reference;

        const ticketProps = {};
        
        const ticketDefaultProps = await Fields.find({tenant_id, default: true}, 'key id options');
        for(let {key, id, options} of ticketDefaultProps){
            ticketProps[key] = {id, options};
        }
        
        const initialState = await States.findOne({tenant_id, key: 'new'});
        
        const {options: types} = ticketProps.type;
        let currentType = types.find(type => type.key === ticket.type_key);
        if(!currentType) currentType = types[0];//el primero xD

        ticketBuilded.field_values = [
            {
                field: ticketProps.state.id,
                value: { ent_id: initialState.id }
            },
            {
                field: ticketProps.client.id,
                value: { ent_id: ticket.client_id }
            },
            {
                field: ticketProps.device.id,
                value: { ent_id: ticket.device_id || null }
            },
            {
                field: ticketProps.agent.id,
                value: { ent_id: ticket.agent_id || null }
            },
            {
                field: ticketProps.group.id,
                value: { ent_id: null }
            },
            {
                field: ticketProps.supplier.id,
                value: { ent_id: null }
            },
            {
                field: ticketProps.title.id,
                value: { text: ticket.title }
            },
            {
                field: ticketProps.description.id,
                value: { text: ticket.description }
            },
            {
                field: ticketProps.priority.id,
                value: { key: ticket.priority || 'LOW' }
            },
            {
                field: ticketProps.source.id,
                value: { key: ticket.source || 'PORTAL' }
            },
            {
                field: ticketProps.type.id,
                value: { key: currentType.key }
            },
        ]

        if(ticket.custom_fields && ticket.custom_fields.length){
            const ticketCustomizedProps = await Fields.find({tenant_id, default: false});
            for(const customizedValue of ticket.custom_fields){
                const customizedField = ticketCustomizedProps.find(
                    ({key}) => key === customizedValue.field_key
                );
                if(customizedField)
                    ticketBuilded.field_values.push(
                        this.getCustomValue(customizedField, customizedValue)
                    );
            }
        }

        if(ticket.source == "EMAIL"){
            ticketBuilded.last_client_intervention = {
                messageId: ticket.email_reference,
                subject: ticket.title
            }
        }

        const newTicket = await Tickets.create(ticketBuilded);

        await Activities.create({
            tenant_id,
            ticket_id: newTicket.id,
            autor: {
                id: requester._id,
                type: do {
                    if(ticket.source === "EMAIL") "SYSTEM";
                    else 'AGENT';
                }
            },
            creation: true,
            time: newTicket.time
        })

        return await newTicket.populate('field_values.field').execPopulate();
    }

    update = async (_, {ticket: {ticket_number: number, ...ticket}}, {tenant_id, requester}) => {
        const ticketUpdated = await Tickets.findOne({tenant_id, number}).populate('field_values.field');
        if(!ticketUpdated) return null;
        const actions = [];
        ticketUpdated.field_values = await Promise.all(ticketUpdated.field_values.map(async (val) => {
            const field_value = val.toObject();
            field_value.field.id = field_value.field._id;
            switch(field_value.field.key){
                case 'agent':
                    if('agent_id' in ticket){
                        const newAgent = await Agents.findById(ticket.agent_id);
                        const oldAgent = await Agents.findById(field_value.value.ent_id);
                        actions.push({
                            type: 'ASSIGNMENT',
                            prop_id: field_value.field.id,
                            prop_name: field_value.field.label,
                            old_id: field_value.value.ent_id,
                            old_value: do {
                                if(oldAgent) oldAgent.name;
                                else null;
                            },
                            new_id: ticket.agent_id,
                            new_value: do {
                                if(newAgent) newAgent.name;
                                else null;
                            }
                        });

                        /*asignacion de agente. falta validar, si el ticket pertenece a 
                        un grupo o proveedor, que el agente pertenece a estos*/
                        return {...field_value, value: {ent_id: ticket.agent_id}};
                    }
                    return field_value;
                case 'group':
                    if('group_id' in ticket){
                        const newGroup = await Groups.findById(ticket.group_id);
                        const oldGroup = await Groups.findById(field_value.value.ent_id);
                        actions.push({
                            type: 'ASSIGNMENT',
                            prop_id: field_value.field.id,
                            prop_name: field_value.field.label,
                            old_id: field_value.value.ent_id,
                            old_value: do {
                                if(oldGroup) oldGroup.name;
                                else null;
                            },
                            new_id: ticket.group_id,
                            new_value: do {
                                if(newGroup) newGroup.name;
                                else null;
                            }
                        });

                        /*falta validar el caso en el que ya esta asignado a un agente*/
                        return {...field_value, value: {ent_id: ticket.group_id}};
                    }
                    return field_value;
                case 'supplier':
                    if('supplier_id' in ticket){
                        const newSupplier = await Suppliers.findById(ticket.supplier_id);
                        const oldSupplier = await Suppliers.findById(field_value.value.ent_id);
                        actions.push({
                            type: 'ASSIGNMENT',
                            prop_id: field_value.field.id,
                            prop_name: field_value.field.label,
                            old_id: field_value.value.ent_id,
                            old_value: do {
                                if(oldSupplier) oldSupplier.name;
                                else null;
                            },
                            new_id: ticket.supplier_id,
                            new_value: do {
                                if(newSupplier) newSupplier.name;
                                else null;
                            }
                        });

                        /*falta validar el caso en el que ya esta asignado a un agente*/
                        return {...field_value, value: {ent_id: ticket.supplier_id}};
                    }
                    return field_value;
                case 'device':
                    if('device_id' in ticket){
                        return {...field_value, value: {ent_id: ticket.device_id}};
                    }
                    return field_value;
                case 'state':
                    if('state_key' in ticket){
                        const next_states = await this.next_states(ticketUpdated, {}, {tenant_id});
                        const newState = next_states.find(({key}) => key === ticket.state_key);
                        if(newState){
                            const oldState = await States.findById(field_value.value.ent_id);
                            actions.push({
                                type: 'UPDATE',
                                prop_id: field_value.field.id,
                                prop_name: field_value.field.label,
                                old_id: field_value.value.ent_id,
                                old_value: oldState.label,
                                new_id: newState.id,
                                new_value: newState.label
                            });

                            return {...field_value, value: {ent_id: newState.id}};
                        }
                        else throw Error("Imposible cambiar al estado indicado");
                    }
                    return field_value;
                case 'type':
                    if('type_key' in ticket){
                        const {options: types} = await Fields.findOne({tenant_id, key: 'type'});
                        const newType = types.find(type => type.key === ticket.type_key);
                        if(newType){
                            const oldType = types.find(type => type.key === field_value.value.key);
                            actions.push({
                                type: 'UPDATE',
                                prop_id: field_value.field.id,
                                prop_name: field_value.field.label,
                                old_value: oldType.label,
                                new_value: newType.label
                            });

                            return {...field_value, value: {key: newType.key}};
                        }
                    }
                    return field_value;
                case 'priority':
                    if('priority' in ticket){
                        actions.push({
                            type: 'UPDATE',
                            prop_id: field_value.field.id,
                            prop_name: field_value.field.label,
                            old_value: priorities.find(({key}) => key == field_value.value.key).label,
                            new_value: priorities.find(({key}) => key == ticket.priority).label
                        });
                        return {...field_value, value: {key: ticket.priority}};
                    }
                    return field_value;
                case 'source':
                    if('source' in ticket){
                        actions.push({
                            type: 'UPDATE',
                            prop_id: field_value.field.id,
                            prop_name: field_value.field.label,
                            old_value: field_value.value.key,
                            new_value: ticket.source
                        });
                        return {...field_value, value: {key: ticket.source}};
                    }
                    return field_value;
                default: return field_value;
            }
        }));

        if(ticket.custom_fields && ticket.custom_fields.length){
            const ticketCustomizedProps = await Fields.find({tenant_id, default: false});
            for(const customizedValue of ticket.custom_fields){
                const customizedField = ticketCustomizedProps.find(
                    ({key}) => key === customizedValue.field_key
                );

                /*se actualiza el custom field, solo si existe el field del ticket en la bd*/
                if(customizedField){
                    const action = {
                        type: 'UPDATE',
                        prop_id: customizedField.id,
                        prop_name: customizedField.label,
                        new_value: do {
                            if(["TEXT", "TEXTAREA", "DATE"].includes(customizedField.type))
                                customizedValue.text;
                            else if(customizedField.type === "NUMBER")
                                customizedValue.number;
                            else if(customizedField.type === "SELECT")
                                customizedField.options.find(
                                    ({key}) => key == customizedValue.key
                                ).label;
                            else if(customizedField.type === "CHECKBOX")
                                customizedValue.check;
                        },
                        old_value: null
                    }

                    const indexOfField = ticketUpdated.field_values.findIndex(
                        ({field}) => field.key === customizedField.key
                    )
                    /*si ya existe el campo dentro del ticket*/
                    if(indexOfField >= 0){
                        const currentValue = ticketUpdated.field_values[indexOfField].value;
                        action.old_value = do {
                            if(["TEXT", "TEXTAREA"].includes(customizedField.type))
                                currentValue.text;
                            else if(customizedField.type === "DATE")
                                currentValue.date;
                            else if(customizedField.type === "NUMBER")
                                currentValue.num;
                            else if(customizedField.type === "SELECT")
                                customizedField.options.find(
                                    ({key}) => key == currentValue.key
                                ).label;
                            else if(customizedField.type === "CHECKBOX")
                                currentValue.check;
                        }
                        ticketUpdated.field_values[indexOfField] = 
                            this.getCustomValue(customizedField, customizedValue);
                    }
                    /*si no, significa que el custom value aun no existe dentro del ticket*/
                    else ticketUpdated.field_values.push(
                        this.getCustomValue(customizedField, customizedValue)
                    );

                    actions.push(action);
                }
            }
        }
        await ticketUpdated.save();

        await Activities.create({
            tenant_id,
            ticket_id: ticketUpdated.id,
            autor: {
                id: requester._id,
                type: 'AGENT'
            },
            actions
        })

        return await ticketUpdated.populate('field_values.field').execPopulate();
    }

    addTask = async (_, {ticket_number, text}, {tenant_id}) => {
        const ticket = await Tickets.findOne({tenant_id, number: ticket_number});
        if(ticket){
            ticket.tasks.push({text})
            await ticket.save();
            return {text, done: false};
        }
        else return null;
    }

    checkTask = async (_, {ticket_number, text}, {tenant_id}) => {
        const ticket = await Tickets.findOne({tenant_id, number: ticket_number});
        if(ticket){
            ticket.tasks.map(task => {
                if(task.text == text) return {text, done: !task.done};
                return task;
            })
            const indexTask = ticket.tasks.findIndex(task => task.text == text);
            if(indexTask >= 0){
                const oldTask = ticket.tasks[indexTask];
                const newTask = {
                    text: oldTask.text,
                    done: !oldTask.done
                };
                ticket.tasks[indexTask] = newTask;
                await ticket.save();
                return newTask;
            }
        }
        return null;
    }

    addIntervention = async (_, {intervention: {ticket_number, text, private: note, email_reference, messageId, time, messageSubject}}, {tenant_id, requester}) => {
        let ticket = null;
        if(email_reference) ticket = await Tickets.findOne({tenant_id, email_reference}).populate('field_values.field');
        else ticket = await Tickets.findOne({tenant_id, number: ticket_number}).populate('field_values.field');
        
        if(ticket){
            ticket.interventions.push({
                autor: {
                    id: requester._id,
                    type: requester.user_type
                },
                text,
                private: note || false,
                time: time || undefined
            })
            await ticket.save();
            
            if(requester.user_type === "AGENT"){
                //enviar correo al receptor de la intervencion
                const client = await this.client(ticket, {}, {tenant_id});
                const mailResponse = {
                    from: 'youremail@gmail.com',
                    to: client.email,
                    subject: `Re: ${ticket.last_client_intervention.subject}`,
                    html: `El agente ${requester.name} te ha respondido: \n 
                    ${text}`,
                    inReplyTo: ticket.last_client_intervention.messageId
                };

                this.transporters[tenant_id].sendMail(mailResponse, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                });
            }
            else{
                ticket.last_client_intervention = {
                    messageId: messageId,
                    subject: messageSubject
                }
                await ticket.save();
            }

            return {
                autor: {
                    id: requester._id,
                    type: requester.user_type
                },
                text,
                private: note || false,
                time: new Date()
            };
        }
        else return null;
    }

    autorInterventionResolveType = ({role}) => do {
        if(role) "Agent";
        else "Client";
    }

    autor = async ({autor}, _, {tenant_id}) => (
        await Agents.findOne({tenant_id, _id: autor.id})
    )
}

export default new TicketsController