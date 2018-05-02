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
	"clientVisible": {
		"type": Boolean,
		default: false
	},
	"label": {
		type: String
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
	],
	"ent_field": {
		"type": String
	},
	"position": {
		"type": Number
	}
});

export default mongoose.model('Fields', FieldsSchema);