import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let SuppliersSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId
    },
    "user_id": {
        "type": Schema.Types.ObjectId/*,
        "required": true*/
    },
    "name": {
        "type": String,
        "required": true
    },
    "about": {
        "type": String
    }
})

export default mongoose.model('Suppliers', SuppliersSchema);