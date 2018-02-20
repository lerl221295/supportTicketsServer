import mongoose from 'mongoose';

const Tickets = mongoose.model('Tickets');
const States = mongoose.model('States');
const Fields = mongoose.model('Fields');


class TicketFieldsController {
    constructor(){
        this.querys = {
            
        }

        this.mutations = {
            
        }

        this.stateProps = {
            came_from: this.cameFromStates
        }

        this.fieldValueProps = {
            __resolveType: (field) => do {
                if(true) "TextValue";
            }
        }

        this.fieldProps = {
            __resolveType: (field) => do {
                if(true) "FreeField";
            }
        }
    }

    cameFromStates = async ({came_from}, _, {tenant_id}) => (
        await States.find({tenant_id, _id: {$in: came_from}})
    );

}

export default new TicketFieldsController