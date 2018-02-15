import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let OrganizationsSchema = new Schema({
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
    "domains": [
        {
            type: String
        }
    ]
})

export default mongoose.model('Organizations', OrganizationsSchema);