import { makeExecutableSchema, addMockFunctionsToSchema, MockList } from 'graphql-tools';
import enums from './enums.graphql'
import inputs from './inputs.graphql'
import types from './types.graphql'
import esquema from './schema.graphql'
import casual from 'casual'
import faker from 'faker'
import { PubSub, withFilter } from 'graphql-subscriptions';
import images from './base64'

const pubsub = new PubSub();

let dateRange = (start = '2017-08-01', end = '2017-12-31') => (faker.date.between(start, end));

const generateClient = () => ({
	id: casual.uuid,
	name: casual.first_name,
	lastname: casual.last_name,
	fullName: ({name, lastname}) => `${name} ${lastname}`,
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
});

const generateAgent = () => {
	let {name, lastname} = {name: casual.first_name, lastname: casual.last_name};
	return({
		id: casual.uuid,
		name,
		lastname,
		fullName: `${name} ${lastname}`,
		email: casual.email,
		phones: [casual.phone, casual.phone, casual.phone],
		about: casual.text,
		profession:  casual.random_element(['Tecnico de soporte', 'Tecnico electronico']),
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
};

const generateOrganization = () => ({
	id: casual.uuid,
	name: casual.company_name,
	about: casual.text,
	domains: [casual.domain, casual.domain, casual.domain]
});

const generateSupplier = () => ({
	id: casual.uuid,
	name: casual.company_name,
	about: casual.text,
	domains: [casual.domain, casual.domain, casual.domain]
});

const generateGroup = () => ({
	id: casual.uuid,
	name: casual.first_name,
	about: casual.text,
	notification_hours: casual.integer(0, 72),
	notification_text: casual.text
});

const generateTicket = () => {
	const date = new Date();
	return({
		id: casual.uuid,
		time: faker.date.recent(),
		number: casual.integer(1, 7777),
		title: casual.short_description,
		description: casual.description,
		response_by: faker.date.between(date, new Date(date.setHours(date.getHours() + casual.integer(1, 3)))),
		resolve_by: faker.date.between(date, new Date(date.setHours(date.getHours() + casual.integer(2, 6)))),
		satisfaction_level: casual.integer(1, 5),
		interventions: () => new MockList(6, generateIntervention)
	})
};

const generateActivityActionUpdate = () => {
	const props = ['tipo', 'prioridad', 'estado'];
	const values = {
		tipo: [
			'Incidencia',
			'Problema',
			'Pregunta'
		],
		prioridad: [
			'baja',
			'media',
			'alta',
			'urgente'
		],
		estado: [
			'abierto',
			'proceso',
			'solucionado',
			'cerrado'
		]
	};
	const randomProp = casual.integer(0, 2),
		randomPropValue = values[props[randomProp]],
		randomPropValueLength = randomPropValue.length - 1,
		randomValue = casual.integer(0, randomPropValueLength),
		oldRandomValue = do {
			if (randomPropValueLength == randomValue) randomValue - 1;
			else
			if (randomPropValueLength == 0) 1;
			else randomValue + 1
		}
	
	return ({
		__typename: "UpgradeActivityActionUpdate",
		type: 'UPDATE',
		prop_name: props[randomProp],
		old_value: randomPropValue[oldRandomValue],
		new_value: randomPropValue[randomValue]
	})
};

const generateActivityActionAssignment = () => {
	const bearer =  casual.random_element(['AGENT', 'SUPPLIER', 'GROUP']);
	// console.log("bearer---", bearer)
	return ({
		__typename: "UpgradeActivityActionAssignment",
		type: 'ASSIGNMENT',
		bearer: do {
			if (bearer == 'AGENT') ({__typename: 'Agent', ...generateAgent()});
			else
				if (bearer == 'SUPPLIER') ({__typename: 'Supplier', ...generateSupplier()});
				else ({__typename: 'Group', ...generateGroup()});
		}
	});
}

// const generateActivity = (first = false) => () => {
const generateActivity = () => generateCreationUpgradeActivity();

// El atributo first, indica si es la primera actividad
// si no lo trae definido se le setea true o false al azar
const generateCreationUpgradeActivity = (first = casual.boolean) => {
	const
		type_autor = casual.random_element(['AGENT', 'SYSTEM']),
		upgradeType = casual.random_element(['UPDATE', 'ASSIGNMENT']),
		type = do {
			if (first) 'CREATION';
			else 'UPGRADE';
		},
		// type = casual.random_element(['CREATION', 'UPGRADE']),
		activity = {
			id: casual.uuid,
			type
		}
	
	return do {
		if (type == 'CREATION') ({
			__typename: "CreationActivity",
			...activity
		});
		else ({
			__typename: "UpgradeActivity",
			...activity,
			time: faker.date.recent(),
			type_autor,
			autor: do {
				if (type_autor == 'AGENT') generateAgent();
				else null;
			},
			actions: generateNActivitiesActions()
		});
	}
};

const generateTicketByDay = (day) => {
	return ({
		day: day,
		tickets: casual.integer(0, 500)
	})
};

const generateNTicketActivities = (n = casual.integer(1, 6)) => {
	let generatedMocks = [];
	for (let i = 0; i < n; i++) generatedMocks.push(generateCreationUpgradeActivity(i == 0));
	return generatedMocks;
};

const generateNActivitiesActions = (n = casual.integer(1, 4)) => {
	let generatedMocks = [];
	for (let i = 0; i < n; i++)
		generatedMocks[i] =do {
			if (casual.boolean && i == 0) generateActivityActionAssignment();
			else generateActivityActionUpdate();
		}
	return generatedMocks;
};

const generateIntervention = () => ({
	id: casual.uuid,
	text: casual.text,
	time: faker.date.recent(),
	type_autor: casual.random_element(["AGENT", "CLIENT"]),
	autor: ({type_autor}) => {
		if(type_autor === "AGENT") return({__typename: 'Agent', ...generateAgent()});
		else return({__typename: 'Client', ...generateClient()});
	}
});

const generateSLAPolicy = (position, by_default) => ({
	id: casual.uuid,
	by_default: by_default || false,
	name: do {
		if (by_default) "Política SLA por defecto";
		else casual.title;
	},
	description: do {
		if (by_default) "Política SLA por defecto del sistema. No se puede desactivar ni eliminar.";
		else casual.short_description;
	},
	active: do {
		if (by_default) true;
		else casual.boolean;
	},
	position: do {
		if (position === undefined) casual.integer(1, 10)
		else position
	},
	policies: [generatePolicy('LOW'), generatePolicy('MEDIUM'), generatePolicy('HIGH'), generatePolicy('URGENT')],
	clients: () => new MockList([1,7]),
	organizations: () => new MockList([1, 7]),
	alerts: () => [
		generateAlert('REMINDER', 'RESPONSE'),
		generateAlert('REMINDER', 'RESOLUTION'),
		generateAlert('SLA_VIOLATION', 'RESPONSE'),
		generateAlert('SLA_VIOLATION', 'RESOLUTION'),
	]
});

const generatePolicy = (priority = casual.random_element(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])) => {
	return ({
		priority,
		first_response: { value: casual.integer(1, 12) },
		solved: { value: casual.integer(1, 12) }
	})
}

const generateSLAPolicies = () => {
	const random_number = casual.integer(4, 10);
	let slaPolices = [];
	for (let i = 0; i < random_number; i++) {
		if (i === random_number - 1)
			slaPolices.push(generateSLAPolicy(i, true))
		else
			slaPolices.push(generateSLAPolicy(i, false))
	}
	return slaPolices;
};

const generateAlert = (type, motive) => ({
	time: do {
		if (type === 'REMINDER') casual.random_element([8, 4, 2, 1, 0.5])
		else casual.random_element([0, 0.5, 1, 2, 4, 8, 12, 24, 48, 72, 168])
	},
	message: casual.text,
	to: () => new MockList([1,7]),
	type,
	motive
})

const paginatedMocks = (entityGenerator) => (_, {limit}) => ({
	nodes: () => {
		if(limit) return new MockList(limit, entityGenerator);
		return new MockList(46, entityGenerator)
	},
	count: 46
});

const mocks = {
	Client : generateClient,
	ClientsResponse : paginatedMocks(generateClient),
	Organization: generateOrganization,
	OrganizationsResponse: paginatedMocks(generateOrganization),
	Agent : generateAgent,
	AgentsResponse : paginatedMocks(generateAgent),
	Supplier: generateSupplier,
	SuppliersResponse: paginatedMocks(generateSupplier),
	Group: generateGroup,
	GroupsResponse: paginatedMocks(generateGroup),
	TwentyFourSeven: () => ({mode: "TWENTYFOUR_SEVEN"}),
	Customized: () => ({mode: "CUSTOMIZED"}),
	SameForDays: () => ({mode: "SAME_FOR_DAYS"}),
	Device: () => ({
		id: casual.uuid,
		name: casual.first_name,
		code: casual.uuid
	}),
	Task: () => ({
		text: casual.string,
		done: casual.boolean
	}),
	Message: () => ({
		text: casual.text,
		time: faker.date.recent(),
	}),
	Discussion: () => ({
		id: casual.uuid,
	}),
	Intervention: generateIntervention,
	Ticket: generateTicket,
	TicketsResponse: paginatedMocks(generateTicket),
	Activity: generateActivity,
	ActivitiesResponse: paginatedMocks(generateActivity),
	Change: () => ({
		prop_name: casual.short_description,
		old_value: casual.short_description,
		new_value: casual.short_description
	}),
	Status: () => {
		const random = casual.integer(0, 4);
		const keys = ['new', 'process', 'pending', 'resolved', 'falied'];
		const labels = ['Nuevo', 'Proceso', 'Esperando', 'Solucionado', 'Fallido'];
		return(({key: keys[random], label: labels[random]}));
	},
	TicketType: () =>{
		const random = casual.integer(0, 2);
		const keys = ['incident', 'problem', 'question'];
		const labels = ['Incidente', 'Problema', 'Pregunta'];
		return(({key: keys[random], label: labels[random]}));
	},
	Category: () => ({
		id: casual.uuid,
		name: casual.name,
	}),
	Article: () => ({
		id: casual.uuid,
		name: casual.name,
		description: casual.description,
		time: faker.date.recent(),
	}),
	Notification: () => ({
		text: casual.short_description,
		time: faker.date.recent(),
		readed: casual.boolean,
	}),
	PolicyTime: () => ({
		value: casual.integer(1, 48)
	}),
	SLAPolicy: () => {
		const position = casual.integer(1, 10);
		return generateSLAPolicy(position, false)
	},
	HourAndMinutes: () => ({
		hour:casual.integer(7, 11),
		minutes: casual.integer(17, 21)
	}),
	Horary: () => ({
		start: () => ({
			hour: casual.integer(7, 11),
			minutes: casual.integer(0, 59)
		}),
		end: () => ({
			hour: casual.integer(14, 16),
			minutes: casual.integer(0, 59)
		})
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
		subscription_time: faker.date.recent(),
		icon: faker.image.avatar()
	}),
	TenantColors: () => ({
		primary: casual.rgb_hex,
		secundary: casual.rgb_hex,
		tertiary: casual.rgb_hex,
		quaternary: casual.rgb_hex
	}),
	TenantPlan: () => ({
		start_date: faker.date.past(2),
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
		unresolved: casual.integer(2, 50),
		overdue: casual.integer(2, 50),
		due_today: casual.integer(2, 50),
		open: casual.integer(2, 50),
		on_hold: casual.integer(2, 50),
		unassigned: casual.integer(2, 50)
	}),
	Query: () => ({
		/*tickets: (root, args, { subdomain }) => {
			//console.log(jwt);
			//if(!jwt) throw Error("Mamate un pipe, sapo");
			console.log("retornare los tickets de ",subdomain);
			() => return new MockList([40, 50]);
		},*/
		devices: (_, { cliente_id }) => new MockList([40, 50]),
		
		//tickets: () => new MockList([40, 50]),
		ticket: () => ({
			// ...generateClient(),
			custom_fields: [
				{
					__typename: "TextValue",
					text: "Un comentario fino",
					metadata: {
						__typename: "FreeField",
						key: "comment",
						label: "Comentario",
						position: 3,
						type: "TEXT"
					}
				},
				{
					__typename: "TextValue",
					text: "Sun Nov 26 2017 22:22:26 GMT-0400 (VET)",
					metadata: {
						__typename: "FreeField",
						key: "DATE",
						label: "Fecha de Atencion",
						position: 1,
						type: "DATE"
					}
				},
				{
					__typename: "SelectValue",
					key: "white",
					metadata: {
						__typename: "SelectField",
						key: "color",
						label: "Color",
						position: 2,
						type: "SELECT"
					}
				}
			],
			activities: generateNTicketActivities()
		}),
		ticketMetadata: () => ({
			types: [
				{key: "incident", label: "Incidente"},
				{key: "problem", label: "Problema"},
				{key: "question", label: "Pregunta"}
			],
			states: [
				{key: "new", label: "Nuevo", stage: "PREPARATION", sla_paused: false, came_from: null},
				{key: "process", label: "En Proceso", stage: "PROGRESS", sla_paused: false, came_from: [
					{key: "new", label: "Nuevo", stage: "PREPARATION"},
					{key: "pending", label: "En Espera", stage: "PROGRESS"}
				]},
				{key: "pending", label: "En Espera", stage: "PROGRESS", sla_paused: true, came_from: [
					{key: "new", label: "Nuevo", stage: "PREPARATION"},
					{key: "process", label: "En Proceso", stage: "PROGRESS"}
				]},
				{key: "resolved", label: "Resuelto", stage: "END", sla_paused: false, came_from: [
					{key: "process", label: "En Proceso", stage: "PROGRESS"},
					{key: "pending", label: "En Espera", stage: "PROGRESS"}
				]},
				{key: "falied", label: "Fallido", stage: "END", sla_paused: false, came_from: [
					{key: "process", label: "En Proceso", stage: "PROGRESS"},
					{key: "pending", label: "En Espera", stage: "PROGRESS"}
				]}
			],
			custom_fields: [
				{
					__typename: "FreeField",
					position: 1,
					key: "date",
					label: "Fecha de Atencion",
					clientVisible: true,
					type: "DATE",
					value: {
						__typename: "TextValue",
						text: "Sun Nov 26 2017 22:22:26 GMT-0400 (VET)"
					}
				},
				{
					__typename: "FreeField",
					position: 3,
					key: "comment",
					label: "Comentario",
					clientVisible: true,
					type: "TEXTAREA",
					value: {
						__typename: "TextValue",
						text: "Un comentario fino"
					}
				},
				{
					__typename: "SelectField",
					position: 2,
					key: "color",
					label: "Color",
					clientVisible: true,
					type: "SELECT",
					value: {
						__typename: "SelectValue",
						key: "white"
					},
					options: [
						{label: "Blanco", key: "white", position: 2},
						{label: "Negro", key: "black", position: 1}
					]
				},
				{
					__typename: "FreeField",
					position: 5,
					key: "numero",
					label: "Numero",
					clientVisible: true,
					type: "NUMBER",
					value: {
						__typename: "NumberValue",
						number: 12345
					}
				},
				{
					__typename: "FreeField",
					position: 4,
					key: "pato",
					label: "Pargolete",
					clientVisible: true,
					type: "CHECKBOX",
					value: {
						__typename: "CheckValue",
						check: false
					}
				}
			]
		}),
		interventions: (_, { ticket_id, last}) => new MockList([40, 50], generateIntervention),
		
		solutions: () => new MockList([40, 50]),
		notifications: (_, { last }) => new MockList([40, 50]),
		SLAPolicies: generateSLAPolicies(),
		ticketsCountByDay: (_, { last = 7 }) => {
			let ticketsByDay = [];
			for (let i = 0; i < last; i++) {
				let date = new Date();
				date.setDate(date.getDate() - (last - i));
				ticketsByDay.push(generateTicketByDay(date));
			}
			return ticketsByDay;
		},

		businessHours: (_, {days}) => {
			let working_days = [
				{day: "MONDAY", workeable: true, horary: {start: {hour: 7, minutes: 30}, end: {hour: 17, minutes: 0} }},
				{day: "TUESDAY", workeable: true, horary: {start: {hour: 7, minutes: 30}, end: {hour: 17, minutes: 0} }},
				{day: "WEDNESDAY", workeable: true, horary: {start: {hour: 7, minutes: 30}, end: {hour: 17, minutes: 0} }},
				{day: "THURSDAY", workeable: true, horary: {start: {hour: 7, minutes: 30}, end: {hour: 17, minutes: 0} }},
				{day: "FRIDAY", workeable: true, horary: {start: {hour: 7, minutes: 30}, end: {hour: 17, minutes: 0} }},
				{day: "SATURDAY", workeable: true, horary: {start: {hour: 13, minutes: 30}, end: {hour: 17, minutes: 0} }},
				{day: "SUNDAY", workeable: true, horary: {start: {hour: 13, minutes: 30}, end: {hour: 17, minutes: 0} }},
			];
			const holidays = [
				{name: "Navidad", day: 25, month: 12},
				{name: "Carnaval", day: 25, month: 2}
			]

			if(days)
				working_days = working_days.filter(weekday => days.includes(weekday.day));
			
			return {
				__typename: "Customized",
				mode: "CUSTOMIZED",
				working_days,
				holidays
			}
		}
	}),
	Mutation: () => ({
		updateClient: (_, {client}) => {
			let generated = generateClient();
			return {
				...generated,
				...client
			}
		},
		updateOrganization: (_, {organization}) => {
			let generated = generateOrganization();
			return {
				...generated,
				...organization
			}
		},
		updateAgent: (_, {agent}) => {
			let generated = generateAgent();
			return {
				...generated,
				fullName: `${agent.name} ${agent.lastname}`,
        		...agent
			}
		},
		updateSupplier: (_, {supplier}) => {
			return {
				...supplier
			}
		},
		createSLAPolicy: (_, {slapolicy}) => {
			return {
				...generateSLAPolicy(0, false),
				...slapolicy,
				active: true
			}
		},
		updateSLAPolicy: (_, {slapolicy}) => {
			return {
				...generateSLAPolicy(),
				...slapolicy
			}
		},
		updateSLAPoliciesOrder: (_, { slapolicies }) => {
			return slapolicies.map(slapolicy => ({
				...generateSLAPolicy(),
				...slapolicy
			}));
		},
		deleteSLAPolicy: (_, {id}) => ({
			...generateSLAPolicy(),
			id
		}),
		updateGroup: (_, {group}) => {
			return {
				...group
			}
		},
		prueba: (_, args, { subdomain }) => {
			const newTicket = {
				...generateTicket(),
				subdomain
			}
			pubsub.publish('tickets', { newTicket });
			return "Fino!";
		},
		addActivity: (_, args, { subdomain }) => {
			const newActivity = {
				...generateActivity(),
				subdomain
			}
			// console.log('-------activity', newActivity);
			pubsub.publish('activities', { newActivity });
			return "Fino!";
		}
	})
};

const resolvers = {
	Subscription: {
		newTicket: {
			subscribe: withFilter(
				() => pubsub.asyncIterator('tickets'),
				({ newTicket }, variables, context) => {
					// console.log(`${newTicket.subdomain} === ${context.subdomain}`)
					return newTicket.subdomain === context.subdomain;
				}
			)
		},
		notifications: {
			subscribe: withFilter(
				() => pubsub.asyncIterator('notifications'),
				({ notification }, variables, context) => {
					return notification.subdomain === context.subdomain;
				}
			)
		},
		newActivity: {
			subscribe: withFilter(
				() => pubsub.asyncIterator('activities'),
				({ newActivity }, variables, context) => {
					// console.log(`${newActivity.subdomain} === ${context.subdomain}`)
					return newActivity.subdomain === context.subdomain;
				}
			)
		},
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