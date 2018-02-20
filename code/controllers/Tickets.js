import mongoose from 'mongoose';
//import _ from 'lodash';

const Tickets = mongoose.model('Tickets');
const States = mongoose.model('States');
const Fields = mongoose.model('Fields');
const Clients = mongoose.model('Clients');
//const Agent = mongoose.model('Agents');
const Activities = mongoose.model('Activities');


const priorities = [
    {key: "LOW", label: "Baja"},
    {key: "MEDIUM", label: "Media"},
    {key: "HIGH", label: "Alta"},
    {key: "URGENT", label: "Urgente"}
]

class TicketsController {
    constructor(){
        this.querys = {
            ticket: this.get/*,
            tickets: this.getAll,
            ticketMetadata: this.metadata*//*,
            activities: ,
            interventions: */
        }

        this.mutations = {
            createTicket: this.save,
            updateTicket: this.update/*,
            addIntervention: this.addIntervention,
            addTask: this.addTask,
            checkTask: this.checkTask*/
        }

        /*this.subscriptions: */
        this.ticketProps =  ['title', 'description', 'source', 'priority', 'client', 'type', 'state', 'next_states'/*, 'agent', 'device', 'supplier', 'group'*/]
        this.propertiesAndRelationships = {
            custom_fields: this.customValues
        };
        for(let prop of this.ticketProps){
            this.propertiesAndRelationships[prop] = this[prop];
        }
    }

    title = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({key}) => key === 'title').value.text
    )

    description = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({key}) => key === 'description').value.text
    )

    priority = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({key}) => key === 'priority').value.key
    )

    type = async ({field_values}, _, {tenant_id}) => {
        const {value: {key}} = field_values.find(({key}) => key === 'type');
        const {options: types} = await Fields.findOne({tenant_id, key: 'type'});
        return types.find(type => type.key === key);
    }

    source = async ({field_values}, _, {tenant_id}) => (
        field_values.find(({key}) => key === 'source').value.key
    )

    state = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id}} = field_values.find(({key}) => key === 'state');
        return await States.findOne({tenant_id, _id: ent_id});
    }

    next_states = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id}} = field_values.find(({key}) => key === 'state');
        return await States.find({tenant_id, came_from: {$in: [ent_id]}});
    }

    client = async ({field_values}, _, {tenant_id}) => {
        const {value: {ent_id: client_id}} = field_values.find(({key}) => key === 'client');
        return await Clients.findOne({tenant_id, _id: client_id});
    }

    customValues = async ({field_values}, _, {tenant_id}) => {
        const onlyCustomizedFields = await Fields.find({tenant_id, default: false});
        
        const onlyCustomizedValues = field_values.reduce( (result, field) => {
            const customizedField = onlyCustomizedFields.find(({id}) => id == field.field_id);
            if(customizedField){
                const value = do {
                    if(["TEXT", "TEXTAREA", "DATE"].includes(customizedField.type)) 
                        ({text: field.value.text || field.value.date})
                    else if(customizedField.type === "NUMBER") ({number: field.value.num});
                    else if(customizedField.type === "CHECKBOX") ({check: field.value.check});
                    else if(customizedField.type === "SELECT") ({key: field.value.key});//falta el label
                }

                result.push({
                    metadata: customizedField,
                    ...value
                })
            }   
            return result;
        }, []);

        return onlyCustomizedValues;
    }

    get = async (_, {number}, {jwt, tenant_id}) => (
        await Tickets.findOne({tenant_id, number})
    )

    getAll = async (_, {filter, order, limit, offset}, {tenant_id}) => {
       
    }

    getCustomValue = (customizedField, customizedValue) => ({
        field_id: customizedField.id,
        key: customizedField.key,
        value: do {
            if(customizedField.type === 'TEXT' || customizedField.type === 'TEXTAREA') 
                ({text: customizedValue.text});
            else if(customizedField.type === 'DATE') new Date({date: customizedValue.text});
            else if(customizedField.type === 'NUMBER') ({num: customizedValue.num});
            else if(customizedField.type === 'CHECKBOX') ({check: customizedValue.check});
            else if(customizedField.type === 'SELECT') ({key: customizedValue.key});
        }
    })

    save = async (_, {ticket}, {jwt, tenant_id}) => {
        const ticketBuilded = { tenant_id };

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
                field_id: ticketProps.state.id,
                key: 'state',
                value: { ent_id: initialState.id }
            },
            {
                field_id: ticketProps.client.id,
                key: 'client',
                value: { ent_id: ticket.client_id }
            },
            {
                field_id: ticketProps.device.id,
                key: 'device',
                value: { ent_id: ticket.device_id || null }
            },
            {
                field_id: ticketProps.agent.id,
                key: 'agent',
                value: { ent_id: ticket.agent_id || null }
            },
            {
                field_id: ticketProps.group.id,
                key: 'group',
                value: { ent_id: null }
            },
            {
                field_id: ticketProps.supplier.id,
                key: 'supplier',
                value: { ent_id: null }
            },
            {
                field_id: ticketProps.title.id,
                key: 'title',
                value: { text: ticket.title }
            },
            {
                field_id: ticketProps.description.id,
                key: 'description',
                value: { text: ticket.description }
            },
            {
                field_id: ticketProps.priority.id,
                key: 'priority',
                value: { key: ticket.priority || 'LOW' }
            },
            {
                field_id: ticketProps.source.id,
                key: 'source',
                value: { key: 'PORTAL' }
            },
            {
                field_id: ticketProps.type.id,
                key: 'type',
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

        return await Tickets.create(ticketBuilded);
    }

    update = async (_, {ticket: {ticket_number: number, ...ticket}}, {tenant_id}) => {
        const ticketUpdated = await Tickets.findOne({tenant_id, number});
        if(!ticketUpdated) return null;
        ticketUpdated.field_values = await Promise.all(ticketUpdated.field_values.map(async (val) => {
            const field_value = val.toObject();
            switch(field_value.key){
                case 'agent':
                    if(ticket.agent_id)
                        return {...field_value, value: {ent_id: ticket.agent_id}};
                    return field_value;
                case 'group':
                    if(ticket.group_id)
                        return {...field_value, value: {ent_id: ticket.group_id}};
                    return field_value;
                case 'supplier':
                    if(ticket.supplier_id)
                        return {...field_value, value: {ent_id: ticket.supplier_id}};
                    return field_value;
                case 'device':
                    if(ticket.device_id)
                        return {...field_value, value: {ent_id: ticket.device_id}};
                    return field_value;
                case 'state':
                    if(ticket.state_key){
                        const next_states = await this.next_states(ticketUpdated, {}, {tenant_id});
                        const newState = next_states.find(({key}) => key === ticket.state_key);
                        if(newState)
                            return {...field_value, value: {ent_id: newState.id}};
                    }
                    return field_value;
                case 'type':
                    if(ticket.type_key){
                        const {options: types} = await Fields.findOne({tenant_id, key: 'type'});
                        const newType = types.find(type => type.key === ticket.type_key);
                        if(newType)
                            return {...field_value, value: {key: newType.key}};
                    }
                    return field_value;
                case 'priority':
                    if(ticket.priority)
                        return {...field_value, value: {key: ticket.priority}};
                    return field_value;
                case 'source':
                    if(ticket.source)
                        return {...field_value, value: {key: ticket.source}};
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
                    const indexOfField = ticketUpdated.field_values.findIndex(
                        ({key}) => key === customizedField.key
                    )
                    /*si ya existe el campo dentro del ticket*/
                    if(indexOfField >= 0){
                        ticketUpdated.field_values[indexOfField] = 
                            this.getCustomValue(customizedField, customizedValue);
                    }
                    /*si no, significa que el custom value aun no existe dentro del ticket*/
                    else ticketUpdated.field_values.push(
                        this.getCustomValue(customizedField, customizedValue)
                    );
                    
                }
            }
        }

        return await ticketUpdated.save();
    }

}

export default new TicketsController