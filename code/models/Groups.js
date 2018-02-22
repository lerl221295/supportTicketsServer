import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let GroupsSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "name": {
        "type": String,
        "required": true
    },
    "about": {
        "type": String
    },
    "agents": [
        {
            "type": Schema.Types.ObjectId
        }
    ],
    "scaling_group_id": {
        "type": Schema.Types.ObjectId
    },
    "notification": {
        "text": {
            "type": String,
            "required": true
        },
        "agent_id": {
            "type": Schema.Types.ObjectId,
            "required": true
        },
        "hours": {
            "type": Number,
            "required": true
        }
    }
})

export default mongoose.model('Groups', GroupsSchema);