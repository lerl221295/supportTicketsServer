import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let FieldsSchema = new Schema({
	"tenant_id": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "type": {
        "type": String,
        "enum": [
            "TEXT",
            "TEXTAREA",
            "NUMBER",
            "DATE",
            "SELECT",
            "CHECKBOX"
        ],
        "required": true
    },
    "default": {
        "type": Boolean
    },
    "key": {
        "type": String,
        "required": true
    },
    "label": {
        type: String
    },
    "position": {
        "type": Number
    },
    "ent_field": {
        "type": String
    },
    "clientVisible": {
        "type": Boolean,
        default: false
    },
    "options": [
        {
            "key": {
                "type": String,
                "required": true
            },
            "label": {
                "type": String,
                "required": true
            }
        }
    ]
})

export default mongoose.model('Fields', FieldsSchema);