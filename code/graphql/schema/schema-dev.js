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
    Status: () => ({
        id: casual.uuid,
        key: casual.text,
        label: casual.text,
    }),
    Category: () => ({
        id: casual.uuid,
        name: casual.name,
    }),
    Article: () => ({
        id: casual.uuid,
        name: casual.name,
        description: casual.description,
        time: faker.date.between('2017-08-01', '2017-12-31'),
    }),
    Notification: () => ({
        text: casual.text,
        time: faker.date.between('2017-08-01', '2017-12-31'),
        readed: casual.boolean,
    }),
    PolicyTime: () => ({
        value: casual.integer(1, 48),
        unity: casual.random_element(['MINUTES', 'HOURS', 'DAYS', 'MONTHS'])
    }),
    Policy: () => ({
        priority: casual.random_element(['low', 'medium', 'high', 'urgent']),
        operational_hours: casual.random_element(['CALENDAR', 'BUSINESS'])
    }),
    SLAPolicy: () => ({
        id: casual.uuid,
        default: casual.boolean,
        name: casual.text,
        description: casual.text,
        active: casual.boolean,
        position: casual.integer(1, 77777),
    }),
    Alert: () => ({
        type: casual.random_element(['REMINDER', 'SLA_VIOLATION']),
        motive: casual.random_element(['RESPONSE', 'RESOLUTION']),
        hours: casual.integer(1, 144),
        message: casual.text,
    }),
    Horary: () => ({
        start:casual.integer(7, 11),
        end: casual.integer(17, 21)
    }),
    Holiday: () => ({
        name: casual.name,
        day: casual.day_of_month,
        month: casual.month_number
    }),
    WorkingDay: () => ({
        day: casual.random_element(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    }),
    SupervisorCondition: () => ({
        hours: casual.integer(0, 24),
        conditioned_param: casual.random_element(['HOURS_SINCE_CREATED', 'HOURS_SINCE_PENDING', 'HOURS_SINCE_RESOLVED', 'HOURS_SINCE_ASSIGNED', 'HOURS_SINCE_REQUESTER_RESPONDED', 'HOURS_SINCE_AGENT_RESPONDED', 'HOURS_SINCE_TICKET_OVERDUE']),
        condition_operator: casual.random_element(['IS', 'NOT', 'CONTAINS', 'NOT_CONTAINS', 'STARTS', 'ENDS', 'TRUE', 'FALSE', 'HIGHER', 'HIGHER_OR_EQUAL', 'LESS', 'LESS_OR_EQUAL'])
    }),
    Dispatcher: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description,
        comparator: casual.random_element(['AND', 'OR'])
    }),
    Supervisor: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description,
        comparator: casual.random_element(['AND', 'OR'])
    }),
    Observer: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description,
        anyone: casual.boolean,
        comparator: casual.random_element(['AND', 'OR'])
    }),
    Scenario: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description,
        comparator: casual.random_element(['AND', 'OR'])
    }),
    Events: () => ({
        id: casual.uuid
    }),
    ActionEmail: () => ({
        subject: casual.description,
        body: casual.text,
        receiver_type: casual.random_element(['AGENT', 'CLIENT', 'GROUP'])
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
        primary: casual.rgb_hex,
        secundary: casual.rgb_hex,
        tertiary: casual.rgb_hex,
        quaternary: casual.rgb_hex
    }),
    TenantPlan: () => ({
        start_date: faker.date.between('2017-08-01', '2017-12-31'),
        end_date: null,
        annual_payment: casual.boolean,
        active: casual.boolean
    }),
    SubscriptionPlan: () => ({
        name: "El plan vergatario",
        slogan: "Chiabe bibe, la luchia zigue",
        monthly_cash_price: 2000,
        monthly_credit_price: 1900,
        multiple_SLA: casual.boolean ,
        satisfaction_survey: casual.boolean ,
        ticket_custom_fields: casual.boolean ,
        dispatcher: casual.boolean ,
        observer: casual.boolean ,
        supervisor: casual.boolean ,
        scenario: casual.boolean ,
        knowledge_base: casual.boolean ,
        multichannel_support: casual.boolean
    }),
    Indicators: () => ({
        unresolved: casual.integer(2, 30),
        overdue: casual.integer(2,30),
        due_today: casual.integer(2,30),
        open: casual.integer(2,30),
        on_hold: casual.integer(2,30),
        unassigned: casual.integer(2,30)
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