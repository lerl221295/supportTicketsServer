import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let OrganizationsSchema = new Schema({
	"_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "tenant_id": {
        "type": Schema.Types.ObjectId
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