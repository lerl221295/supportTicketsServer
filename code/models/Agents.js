import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let AgentsSchema = new Schema({
	"tenant_id": {
		"type": Schema.Types.ObjectId,
		"required": true
	},
	"email": {
		"type": String,
		"required": true
	},
	"face_base64": {
		type: String
	},
	"role": {
		"type": String,
		"enum": [
			"ADMIN",
			"AGENT",
			"SUPERVISOR"
		],
		"required": true
	},
	"sex": {
		"type": String,
		"enum": [
			"FEMALE",
			"MALE"
		],
		"default": "MALE",
		"required": true
	},
	"user_id": {
		"type": Schema.Types.ObjectId/*,
        "required": true*/
	},
	"name": {
		"type": String,
		"required": true
	},
	"lastname": {
		type: String,
		required: true
	},
	"phones": [
		{
			"type": String
		}
	],
	"about": {
		"type": String
	},
	"profession": {
		"type": String
	},
	"supplier_id": {
		"type": Schema.Types.ObjectId
	}
});

export default mongoose.model('Agents', AgentsSchema);
