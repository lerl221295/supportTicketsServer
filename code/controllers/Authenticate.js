import mongoose from 'mongoose';
import md5 from 'md5';
import jwt from 'jwt-simple';

let Users = mongoose.model('Users');
let Agents = mongoose.model('Agents');
let Suppliers = mongoose.model('Suppliers');
let Clients = mongoose.model('Clients');

class UsersController {
	constructor(){
		this.querys = {
			notifications: this.getNotifications
		}

		this.mutations = {
			login: this.login
		}

		this.notification = {
			ticket: this.notificationTicket
		}

		this.entity = {
			__resolveType: this.entityResolveType
		}
	}

	login = async (_, {email, password}, {tenant_id}) => {
		/*solo codificare el login del Agent*/
		const agent = await Agents.findOne({tenant_id, email});
		if(!agent) return ({
			ok: false,
			errors: [{
				path: "email",
				message: "No existe el usuario con el email indicado"
			}]
		});

		const user = await Users.findById(agent.user_id);
		if(md5(password) != user.password) return ({
			ok: false,
			errors: [{
				path: "password",
				message: "Contraseña erronea"
			}]
		});

		const {face_base64, ...agentObject} = agent.toObject();

		return ({
			ok: true,
			token: jwt.encode({...agentObject, user_type: "AGENT"}, '123'),
			user: {
				rol: "AGENT",
				entity: agent,
				notifications: user.notifications
			}
		})
	}

	getNotifications = async (_, {limit, offset}, {tenant_id, requester}) => {
		const user = Users.findOne({tenant_id, _id: requester.user_id});
		const notifications = user.notifications || [];
		let unread_count = 0;

		unread_count = notifications.reduce((total, {readed}) => do{
			if(readed) total;
			else total+1;
		}, 0);

		const nodes = do {
			if(limit && offset)
				notifications.slice(offset, offset+limit);
			else if(offset)
				notifications.slice(offset);
			else if(limit) notifications.slice(0, limit);
			else notifications;
		};
		return({nodes, unread_count})
	};

	notificationTicket = async ({ticket_id: _id}, _, {tenant_id}) => (
		await Tickets.findOne({tenant_id, _id}).populate('field_values.field')
	);

	entityResolveType = (entity) => do {
		if(entity.role) "Agent";
		else if(entity.agents) "Supplier";
		else "Client";
	}

}

export default new UsersController