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
    "autor": {
        "id": {
            "type": Schema.Types.ObjectId,
            "required": true
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
        "required": true
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
                "type": String,
                "required": true
            },
            "old_id": {
                "type": Schema.Types.ObjectId,
                "required": true
            },
            "new_id": {
                "type": Schema.Types.ObjectId
            }
        }
    ]
});

export default mongoose.model('Activities', ActivitiesSchema);