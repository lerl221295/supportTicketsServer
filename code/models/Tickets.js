import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

let Schema = mongoose.Schema;

let TicketsSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    email_reference: String,/*identificador del email, si el ticket fue creado por esta via*/
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
            "field": {
                "type": Schema.Types.ObjectId,
                ref: 'Fields',
                "required": true
            },
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
    last_client_intervention: {
        messageId: String,
        subject: String
    },
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
                "type": Date,
                default: Date.now
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
                "type": Boolean,
                default: false
            }
        }
    ]
}, { usePushEach: true })

TicketsSchema.plugin(AutoIncrement, {
    id: 'tickets_seq',
    inc_field: "number",
    reference_fields: ["tenant_id"]
});

export default mongoose.model('Tickets', TicketsSchema);