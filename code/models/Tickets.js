import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

let Schema = mongoose.Schema;

let TicketsSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "time": {
        "type": Date,
        default: Date.now
    },
    "number": {
        "type": Number
    },
    "satisfaction_level": {
        "type": Number
    },
    "field_values": [
        {
            "field_id": {
                "type": Schema.Types.ObjectId,
                "required": true
            },
            /*a pesar de que ya se referencia el Field con field_id, almacenar el key ayuda
            a obtener mas rapido a partir del ticket, el valor de campo requerido*/
            "key": String,
            "value": {
                "text": {
                    "type": String
                },
                "key": {
                    "type": String
                },
                "ent_id": {
                    "type": Schema.Types.ObjectId
                },
                date: {
                    "type": Date
                },
                "num": {
                    "type": Number
                },
                check: Boolean
            }
        }
    ],
    "interventions": [
        {
            "autor": {
                "id": {
                    "type": Schema.Types.ObjectId
                },
                "type": {
                    "type": String
                }
            },
            "time": {
                "type": Date
            },
            "text": {
                "type": String
            },
            "private": {
                "type": Boolean
            }
        }
    ],
    "tasks": [
        {
            "text": {
                "type": String
            },
            "done": {
                "type": Boolean
            }
        }
    ]
}, { usePushEach: true })

TicketsSchema.plugin(AutoIncrement, {
    id: 'tickets_seq',
    inc_field: "number",
    reference_fields: ["tenant_id"]
})

export default mongoose.model('Tickets', TicketsSchema);