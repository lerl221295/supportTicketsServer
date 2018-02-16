import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let ClientsSchema = new Schema({
	/*"_id": {
        type: Schema.Types.ObjectId
    },
    */"email": {
        type: String,
        required: true
    },
    "tenant_id": {
        type: Schema.Types.ObjectId,
        required: true
    },
    "user_id": {
        type: Schema.Types.ObjectId/*,
        required: true*/
    },
    "name": {
        type: String,
        required: true
    },
    "face_base64": {
        type: String
    },
    "phones": [
        {
            type: String
        }
    ],
    "about": {
        type: String,
        default: null
    },
    "lastname": {
        type: String,
        required: true
    },
    "twitter_id": {
        type: String,
        default: null
    },
    "facebook_id": {
        type: String,
        default: null
    },
    "address": {
        type: String,
        default: null
    },
    "organization_id": {
        type: Schema.Types.ObjectId
    }
})

export default mongoose.model('Clients', ClientsSchema);