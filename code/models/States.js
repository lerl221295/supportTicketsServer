import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let StatesSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "key": {
        "type": String,
        "required": true
    },
    "label": {
        "type": String,
        "required": true
    },
    "stage": {
        "type": String,
        "enum": [
            "PREPARATION",
            "PROGRESS",
            "END"
        ]
    },
    sla_paused: {
        type: Boolean,
        default: false
    },
    "came_from": [
        {
            "type": Schema.Types.ObjectId
        }
    ]
})

export default mongoose.model('States', StatesSchema);