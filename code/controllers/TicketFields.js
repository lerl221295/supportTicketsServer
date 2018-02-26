import mongoose from 'mongoose';

const Tickets = mongoose.model('Tickets');
const States = mongoose.model('States');
const Fields = mongoose.model('Fields');


class TicketFieldsController {
    constructor(){
        this.querys = {
            ticketMetadata: () => ({})
        }

        this.ticketMetadata = {
            types: this.types,
            states: this.states,
            custom_fields: this.customFields/*,
            default_fields: this.defaultFields*/
        }

        this.mutations = {
            updateTicketTypes: this.updateTicketTypes,
            updateCustomFields: this.updateCustomFields,
            updateTicketStates: this.updateTicketStates
        }

        this.stateProps = {
            came_from: this.cameFromStates
        }

        this.fieldValueProps = {
            __resolveType: ({metadata: {type}}) => do {
                if(["TEXT", "TEXTAREA", "DATE"].includes(type)) "TextValue";
                else if(type === "NUMBER") "NumberValue";
                else if(type === "CHECKBOX") "CheckValue";
                else if(type === "SELECT") "SelectValue";
            }
        }

        this.fieldProps = {
            __resolveType: ({type}) => do {
                if(type === "SELECT") "SelectField";
                else "FreeField";
            }
        }

        this.freeField = {
            value: this.valueFromTicket
        }

        this.selectField = {
            value: this.valueFromTicket
        }
    }

    cameFromStates = async ({came_from}, _, {tenant_id}) => (
        await States.find({tenant_id, _id: {$in: came_from}})
    );

    types = async (_, args, {tenant_id}) => {
        const typeField = await Fields.findOne({tenant_id, key: 'type'});
        return typeField.options;
    };

    states = async (_, args, {tenant_id}) => (
        await States.find({tenant_id})
    );

    customFields = async (_, args, {tenant_id}) => (
        await Fields.find({tenant_id, default: false})
    );

    valueFromTicket = async ({key}, {ticket_number: number}, {tenant_id}) => {
        const ticket = await Tickets.findOne({tenant_id, number}).populate('field_values.field');
        if(!ticket) return null;
        const fieldValue = ticket.field_values.find(({field}) => field.key == key);
        if(!fieldValue) return null;

        const value = do {
            if(["TEXT", "TEXTAREA", "DATE"].includes(fieldValue.field.type)) 
                ({text: fieldValue.value.text || fieldValue.value.date})
            else if(fieldValue.field.type === "NUMBER") ({number: fieldValue.value.num});
            else if(fieldValue.field.type === "CHECKBOX") ({check: fieldValue.value.check});
            else if(fieldValue.field.type === "SELECT") ({key: fieldValue.value.key});
            /*OJO, ACA FALTA INDICAR EL LABEL DEL SELECT VALUE*/
        }

        return({
            metadata: fieldValue.field,
            ...value
        })
    }

    updateTicketTypes = async (_, {types}, {tenant_id}) => {
        const typeField = await Fields.findOne({tenant_id, key: 'type'});
        typeField.options = types;
        await typeField.save();
        return typeField.options;
    }

    updateTicketStates = async (_, {states}, {tenant_id}) => {
        /*eliminar los estados que ya no existen*/
        const keys = states.map(({key}) => key);
        await States.remove({tenant_id, key: {$nin: keys}});
        
        /*si existe, se actualiza, sino, se crea*/
        const newStates = {};
        for(const {came_from, ...state} of states) {
            let currentState = await States.findOneAndUpdate({tenant_id, key: state.key}, state, {new: true});
            if(!currentState)
                currentState = await States.create({tenant_id, ...state});
            newStates[currentState.key] = currentState;
        }

        /*actualizar los came_from*/
        for(const {came_from: came_from_keys, key} of states) {
            if(came_from_keys){
                const came_from = came_from_keys.map(keyCameFrom => newStates[keyCameFrom]._id);
                const stateUpdated = await States.findOneAndUpdate({tenant_id, key}, {came_from}, {new: true});
            }
        }

        return await States.find({tenant_id});
    }

    updateCustomFields = async (_, {custom_fields}, {tenant_id}) => {
        /*eliminar los fields que ya no existen*/
        const keys = custom_fields.map(({key}) => key);
        await Fields.remove({tenant_id, default: false, key: {$nin: keys}});

        /*si no existe, se crea*/
        for(const field of custom_fields) {
            let currentField = await Fields.findOneAndUpdate({tenant_id, key: field.key},
                {
                   label: field.label,
                   position: field.position 
                }, {new: true});
            if(!currentField)
                await Fields.create({tenant_id, default: false, ...field});
        }

        return await Fields.find({tenant_id, default: false});
    }

}

export default new TicketFieldsController