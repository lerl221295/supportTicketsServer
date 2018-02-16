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
    }
})

export default mongoose.model('Tenants', TenantsSchema);