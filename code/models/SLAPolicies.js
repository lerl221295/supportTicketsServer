import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let SLAPoliciesSchema = new Schema({
	"tenant_id": {
		"type": Schema.Types.ObjectId,
		"required": true
	},
	"name": {
		"type": String,
		"required": true
	},
	"description": {
		"type": String
	},
	"organizations": [
		{
			"type": Schema.Types.ObjectId
		}
	],
	"clients": [
		{
			"type": Schema.Types.ObjectId
		}
	],
	"by_default": {
		"type": Boolean,
		"default": false
	},
	"position": {
		"type": Number,
		"min": 0,
		"default": 0,
		"required": true
	},
	"active": {
		"type": Boolean,
		"default": true
	},
	"objectives": [
		{
			"priority": {
				"type": String,
				"enum": [
					"LOW",
					"MEDIUM",
					"HIGH",
					"URGENT"
				],
				"required": true
			},
			"operational_hours": {
				"type": String,
				"enum": [
					"CALENDAR",
					"BUSINESS"
				],
				"required": true
			},
			"first_response": {
				"value": {
					"type": Number
				},
				"unity": {
					"type": String,
					"enum": [
						"MINUTES",
						"HOURS",
						"DAYS",
						"MONTHS"
					]
				}
			},
			"solved": {
				"value": {
					"type": Number
				},
				"unity": {
					"type": String,
					"enum": [
						"MINUTES",
						"HOURS",
						"DAYS",
						"MONTHS"
					]
				}
			}
		}
	]
});

export default mongoose.model('Policies', SLAPoliciesSchema);