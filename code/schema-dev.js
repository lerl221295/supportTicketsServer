import { makeExecutableSchema, addMockFunctionsToSchema, MockList } from 'graphql-tools';
import {Cliente, Tecnico, Ticket, Interaccion} from './conectors'
import esquema from './schema.graphql'
import casual from 'casual'
import { PubSub, withFilter } from 'graphql-subscriptions';

const mocks = {
	Cliente : () => ({
		id: casual.integer(1, 1000),
		nombre: casual.first_name,
		apellido: casual.last_name,
		identificacion: casual.uuid,
		email: casual.email,
		telefono: casual.phone,
		ubicacion: casual.address
	}),
	Tecnico : () => ({
		id: casual.integer(1, 1000),
		nombre: casual.first_name,
		apellido: casual.last_name,
		identificacion: casual.uuid,
		email: casual.email,
		telefono: casual.phone,
		profesion:  casual.random_element(['Tecnico de soporte', 'Tecnico electronico']),
		departamento: casual.random_element(['Soporte', 'Electronica', 'Desarrollo']),
		fecha_nac: new Date(casual.integer(590352078814, 1503520188143)).toString()
	}),
	Admin: () => ({
		id: casual.integer(1, 1000),
		nombre: casual.first_name,
		apellido: casual.last_name,
		email: casual.email,
	}),
	User : () => ({
		id: casual.integer(1, 1000),
		token: casual.uuid
	}),
	Interaccion: () => ({
		_id: casual.uuid,
		timestamp: new Date(casual.integer(1003520188143, 1503520188143)).toString(),
		text: casual.text,
		emisor: casual.random_element(['cliente', 'tecnico', 'admin']),
		tipo: casual.random_element(['actividad', 'mensaje'])
	}),
	Ticket: () => ({
		_id: casual.integer(1, 1000),
		titulo: casual.title,
		estado: casual.random_element(['abierto'/*, 'proceso', 'esperando', 'cerrado.ok', 'cerrado.bad'*/]),
		prioridad: casual.random_element(['baja', 'media', 'alta', 'urgente']),
		tipo: casual.random_element(['pregunta', 'solicitud', 'problema']),
		interacciones: (_, {onlyFirst}) => {
			let numbers = [6, 6];
			if(onlyFirst) numbers = [1, 1]
			return new MockList(numbers)
		}/*,
		cliente: null,
		tecnico: null*/
	}),
	Consultas: () => ({
		tickets: (root, args, { subdomain }) => {
			//console.log(jwt);
			//if(!jwt) throw Error("Mamate un pipe, sapo");
			console.log("retornare los tickets de ",subdomain);
			return new MockList([40, 50]);
		},
		clientes: () => new MockList([40, 50]),
		tecnicos: () => new MockList([40, 50]),
		ultimasInteracciones: (_, {n = 10}) => new MockList([n, n])/*,
		ticket: () => ({
			tecnico: null
		})*/
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
				timestamp: new Date().toString(),
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