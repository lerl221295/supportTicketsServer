import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let TenantsSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	subdomain: {
		type: String,
		required: true,
		unique : true,
		dropDups: true
	},
	active: {
		type: Boolean
	},
	phones: [
		{
			type: String
		}
	],
	subscription_time: {
		type: Date,
		default: Date.now
	},
	emailSupport: {
		address: {
			type: String,
		},
		password: {
			type: String,
		}
	}
});

export default mongoose.model('Tenants', TenantsSchema);
