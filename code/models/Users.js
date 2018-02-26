import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let UsersSchema = new Schema({
    "tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
	"password": {
        "type": String,
        "required": true
    },
    "notifications": [
        {
            "_id": {
                "type": String
            },
            "ticket_id": {
                "type": Schema.Types.ObjectId,
                "required": true
            },
            "time": {
                "type": "Date",
                default: Date.now
            },
            "text": {
                "type": String,
                "required": true
            },
            "readed": {
                "type": Boolean,
                default: false
            }
        }
    ]
})

export default mongoose.model('Users', UsersSchema);