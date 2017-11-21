import { makeExecutableSchema, addMockFunctionsToSchema, MockList } from 'graphql-tools';
import enums from './enums.graphql'
import inputs from './inputs.graphql'
import types from './types.graphql'
import esquema from './schema.graphql'
import casual from 'casual'
import faker from 'faker'
import { PubSub, withFilter } from 'graphql-subscriptions';
import images from './base64'

const generateClient = () => ({
    id: casual.uuid,
    name: casual.first_name,
    lastname: casual.last_name,
    email: casual.email,
    phones: [casual.phone, casual.phone, casual.phone],
    address: casual.address,
    about: casual.text,
    twitter_id: casual.uuid,
    facebook_id: casual.uuid,
    face_base64: () =>  {
        //console.log('calculando el base64 de la imagen');
        return images.emma;
    },
    count_tickets: () => {
        //console.log("calculo la cantidad de tickets en una funcion");
        return 12;
    },
    tickets: () => new MockList([12,12])
})

const generateOrganization = () => ({
    id: casual.uuid,
    name: casual.company_name,
    about: casual.text,
    domains: [casual.domain, casual.domain, casual.domain]
});

const paginatedMocks = (entityGenerator) => (_, {limit}) => ({
    nodes: () => {
        if(limit) return new MockList(limit, entityGenerator);
        return new MockList(46, entityGenerator)
    },
    count: 46
})

const mocks = {
	Client : generateClient,
    ClientsResponse : paginatedMocks(generateClient),
	Agent : () => ({
        id: casual.uuid,
        name: casual.first_name,
        lastname: casual.last_name,
        email: casual.email,
        phones: [casual.phone, casual.phone, casual.phone],
        about: casual.text,
		profession:  casual.random_element(['Tecnico de soporte', 'Tecnico electronico']),
        count_tickets: () => {
            //console.log("calculo la cantidad de tickets en una funcion");
            return 12;
        },
        tickets: () => new MockList([12,12])
	}),
	Organization: generateOrganization,
    OrganizationsResponse: paginatedMocks(generateOrganization),
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
    }),
    Ticket: () => ({
        id: casual.uuid,
        time: faker.date.between('2017-08-01', '2017-12-31'),
        number: casual.integer(1, 7777),
        title: casual.short_description,
        description: casual.description,
        response_by: faker.date.between('2017-08-01', '2017-12-31'),
        resolve_by: faker.date.between('2017-08-01', '2017-12-31'),
        satisfaction_level: casual.integer(1, 5),
    }),
    Activity: () => ({
        id: casual.uuid,
        time: faker.date.between('2017-08-01', '2017-12-31'),
    }),
    Change: () => ({
        prop_name: casual.short_description,
        old_value: casual.short_description,
        new_value: casual.short_description
    }),
    Stage: () => ({
        id: casual.uuid,
        key: casual.description,
        name: casual.random_element(['preparation', 'progress', 'final']),
    }),
    Status: () => ({
        id: casual.uuid,
        key: casual.random_element(['new', 'process', 'pending', 'resolved', 'failed']),
        label: casual.random_element(['Nuevo', 'Proceso', 'Esperando', 'Solucionado', 'Fallido']),
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
        text: casual.short_description,
        time: faker.date.between('2017-08-01', '2017-12-31'),
        readed: casual.boolean,
    }),
    PolicyTime: () => ({
        value: casual.integer(1, 48)
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
    SupervisorCondition: () => ({
        hours: casual.integer(0, 24),
    }),
    Dispatcher: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description
    }),
    Supervisor: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description,
    }),
    Observer: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description,
        anyone: casual.boolean,
    }),
    Scenario: () => ({
        id: casual.uuid,
        name: casual.short_description,
        description: casual.description
    }),
    Events: () => ({
        id: casual.uuid
    }),
    ActionEmail: () => ({
        subject: casual.description,
        body: casual.text
    }),
    Tenant: () => ({
		id: casual.uuid,
		name: casual.company_name,
		subdomain: casual.domain,
		phones: [ casual.phone, casual.phone ],
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
        name: "Full great plan",
        slogan: "Perfect to custom your own workflow",
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
		/*tickets: (root, args, { subdomain }) => {
			//console.log(jwt);
			//if(!jwt) throw Error("Mamate un pipe, sapo");
			console.log("retornare los tickets de ",subdomain);
			() => return new MockList([40, 50]);
		},*/
        devices: (_, { cliente_id }) => new MockList([40, 50]),

        agents: () => new MockList([40, 50]),
        groups: () => new MockList([40, 50]),
        suppliers: () => new MockList([40, 50]),

        tickets: () => new MockList([40, 50]),
        activities: (_, { ticket_id, last}) => new MockList([40, 50]),
        interventions: (_, { ticket_id, last}) => new MockList([40, 50]),

        solutions: () => new MockList([40, 50]),
        notifications: (_, { last }) => new MockList([40, 50]),
        SLAPolicies: () => new MockList([40, 50])
	}),
    Mutation: () => ({
        updateClient: (_, {client}) => {
            let generated = generateClient();
            return {
                ...generated,
                id: client.id,
                name: client.name,
                lastname: client.lastname,
                face_base64: client.face_base64
            }
        }
    })
}

const pubsub = new PubSub();

const resolvers = {
    Subscription: {
        notifications: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('notifications'),
                ({ notification }, variables, context) => {
                	return notification.subdomain === context.subdomain;
                }
            )
		}
    }
}

const graphQLSchema = `
${enums}
${types}
${inputs}
${esquema}
`;

const schema = makeExecutableSchema({ typeDefs: graphQLSchema, resolvers });

addMockFunctionsToSchema({ schema, mocks });

export default schema