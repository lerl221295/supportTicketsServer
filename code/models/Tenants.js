import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let TenantsSchema = new Schema({
	"name": {
        type: String,
        required: true
    },
    "subdomain": {
        type: String,
        required: true
    },
    "active": {
        type: Boolean
    },
    "emailSupport": {
        address: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    }
})

export default mongoose.model('Tenants', TenantsSchema);