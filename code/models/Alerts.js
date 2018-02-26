import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let AlertsSchema = new Schema({
    "tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "sla_policy_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "type": {
        "type": String,
        "enum": [
            "REMINDER",
            "SLA_VIOLATION"
        ],
        "required": true
    },
    "motive": {
        "type": String,
        "enum": [
            "RESPONSE",
            "RESOLUTION"
        ],
        "required": true
    },
    "time": {
        "type": Number,
        "required": true
    },
    "to": [
        {
            "type": Schema.Types.ObjectId
        }
    ],
    "message": {
        "type": String,
        "required": true
    }
});

export default mongoose.model('Alerts', AlertsSchema);