import { makeExecutableSchema, addMockFunctionsToSchema, MockList } from 'graphql-tools';
import esquema from './schema.graphql'
import casual from 'casual'
import faker from 'faker'
import { PubSub, withFilter } from 'graphql-subscriptions';

const mocks = {
	Client : () => ({
		id: casual.uuid,
		name: casual.first_name,
		lastname: casual.last_name,
		email: casual.email,
		phones: [casual.phone, casual.phone, casual.phone],
		address: casual.address,
		about: casual.text,
        twitter_id: casual.uuid,
        facebook_id: casual.uuid
	}),
	Agent : () => ({
		id: casual.uuid,
        role: casual.random_element(['AGENT', 'SUPERVISOR', 'ADMIN', 'ADMIN_ACCOUNT']),
        name: casual.first_name,
        lastname: casual.last_name,
        email: casual.email,
        phones: [casual.phone, casual.phone, casual.phone],
        about: casual.text,
		profession:  casual.random_element(['Tecnico de soporte', 'Tecnico electronico']),
	}),
	Organization: () => ({
        id: casual.uuid,
        name: casual.first_name,
        about: casual.text,
        domains: [casual.domain, casual.domain, casual.domain]
	}),
	Supplier : () => ({
        id: casual.uuid,
        name: casual.first_name,
        about: casual.text
	}),
	Device: () => ({
        id: casual.uuid,
        name: casual.first_name,
        code: casual.uuid
	}),
	Task: () => ({
		text: casual.string,
        done: casual.boolean
	}),
    Group: () => ({
        id: casual.uuid,
        name: casual.first_name,
        about: casual.text,
        notification_hours: casual.integer(0, 72),
        notification_text: casual.text
    }),
    Message: () => ({
        text: casual.text,
        time: faker.date.between('2017-08-01', '2017-12-31'),
    }),
    Discussion: () => ({
        id: casual.uuid,
    }),
    Intervention: () => ({
        id: casual.uuid,
        text: casual.text,
        time: faker.date.between('2017-08-01', '2017-12-31'),
        type_autor: casual.random_element(['AGENT', 'CLIENT']),
    }),
    Ticket: () => ({
        id: casual.uuid,
        time: faker.date.between('2017-08-01', '2017-12-31'),
        number: casual.integer(1, 7777777777),
        title: casual.text,
        description: casual.description,
        priority: casual.random_element(['low', 'medium', 'high', 'urgent']),
        source: casual.random_element(['PORTAL', 'EMAIL', 'FACEBOOK', 'TWITTER']),
        response_by: casual.text,
        resolve_by: casual.text,
        satisfaction_level: integer(1, 5),
    }),
    Activity: () => ({
        id: casual.uuid,
        time: faker.date.between('2017-08-01', '2017-12-31'),
        type_autor: casual.random_element(['AGENT', 'CLIENT', 'SYSTEM']),
    }),
    Stage: () => ({
        id: casual.uuid,
        key: casual.text,
        name: casual.name,
    }),
    Tenant: () => ({
		id: casual.uuid,
		name: casual.company_name,
		subdomain: casual.domain,
		phones: casual.phone,
		active: casual.boolean,
		subscription_time: faker.date.between('2017-08-01', '2017-12-31'),
        icon: faker.image.avatar()
    }),
    TenantColors: () => ({
    }),
    TenantPlan: () => ({
    }),
    SubscriptionPlan: () => ({
    }),
    Indicators: () => ({
    }),
    Query: () => ({
		tickets: (root, args, { subdomain }) => {
			//console.log(jwt);
			//if(!jwt) throw Error("Mamate un pipe, sapo");
			console.log("retornare los tickets de ",subdomain);
			return new MockList([40, 50]);
		}
	}),
	Mutation: () => ({
		/*authenticate : (_, {user}) => {
			if(user.email == "luis@gmail.com") return({
				id: casual.integer(1, 1000),
				token: casual.uuid
			});
			throw Error("Mamate un pipe, sapo");
		},*/
		addInteraccion: (_, {interaccion}, { subdomain }) => {
			pubsub.publish('interacciones', {newInteracciones: {
				...interaccion,
				timestamp: faker.date.between('2017-08-01', '2017-12-31'),
				_id: casual.uuid,
				subdomain
			}});
			return "Interaccion agregada con exito";
		},
		updateTicket: (_, {ticket}) => {
			console.log(JSON.stringify(ticket));
			return "Ticket actualizado con exito!";
		},
		tomarTicket: (_, {ticket_id}) => {
			console.log(`han tomado el ticket ${ticket_id}`);
			return "Agarra tu ticket sapo!";
		}
	}),
	String: () => 'Operacion realizada con exito!'
}

const pubsub = new PubSub();

const resolvers = {
	Subscription: {
        newInteracciones: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('interacciones'),
                ({ newInteracciones }, variables, context) => {
                	return newInteracciones.subdomain === context.subdomain;
                }
            )
		}
    }
}

const schema = makeExecutableSchema({ typeDefs: esquema, resolvers });

addMockFunctionsToSchema({ schema, mocks });

export default schema