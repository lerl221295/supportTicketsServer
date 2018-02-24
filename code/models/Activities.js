import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let ActivitiesSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "ticket_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    creation: {
        type: Boolean,
        default: false
    },
    "autor": {
        "id": {
            "type": Schema.Types.ObjectId
        },
        "type": {
            "type": String,
            "enum": [
                "AGENT",
                "SYSTEM"
            ],
            "required": true
        }
    },
    "time": {
        "type": Date,
        default: Date.now
    },
    "actions": [
        {
            "type": {
                "type": String,
                "enum": [
                    "ASSIGNMENT",
                    "UPDATE"
                ],
                "required": true
            },
            "prop_id": {
                "type": Schema.Types.ObjectId
            },
            "new_value": {
                "type": String,
                "required": true
            },
            "prop_name": {
                "type": String,
                "required": true
            },
            "old_value": {
                "type": String
            },
            "old_id": {
                "type": Schema.Types.ObjectId
            },
            "new_id": {
                "type": Schema.Types.ObjectId
            }
        }
    ]
});

export default mongoose.model('Activities', ActivitiesSchema);