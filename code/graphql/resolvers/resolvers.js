import {Cliente, Tecnico, Ticket, Interaccion, Auth, Admin} from './conectors'
import { PubSub, withFilter } from 'graphql-subscriptions';
import lodash from 'lodash';

const pubsub = new PubSub();

function formatDataUser(id, tipo, entidad) {
	const data_user = {
		'id_foraneo': id,
		'tipo': tipo,
		'password': entidad.nombre[0].toLowerCase()+entidad.apellido.toLowerCase()+entidad.identificacion.toLowerCase().substr(entidad.identificacion.length - 3)
	};
	return data_user;
}

function publicarInteraccion(interaccion) {
	pubsub.publish('interacciones', {
		newInteracciones: {
			...interaccion
		}
	});
}

function errorEnPrivilegios(tipo) {
	throw Error(`Usted es un ${tipo} y no posee los privilegios adecuados para realizar dicha operación.`)
}

const resolvers = {
	Query: {
		clientes: async (_, args, {jwt}) => {
			await Auth.validateToken(jwt);
			return Cliente.getAll();
		},
		cliente: async (_, args, {jwt}) => {
			await Auth.validateToken(jwt);
			return Cliente.get(args.id);
		},
		tecnicos: async (_, args, {jwt}) => {
			await Auth.validateToken(jwt);
			return Tecnico.getAll();
		},
		tecnico: async (_, args, {jwt}) => {
			await Auth.validateToken(jwt);
			return Tecnico.get(args.id)
		},
		tickets: async (_, {estado = null}, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			return Ticket.getAll(estado, {id: user.id_foraneo, tipo: user.tipo})
		},
		ticket: async (_, args, {jwt}) => {
			await Auth.validateToken(jwt);
			return Ticket.get(args.id)
		},
		ultimasInteracciones: async (_, {n = 10}, {jwt}) => {
			await Auth.validateToken(jwt);
			return Interaccion.getAll(n)
		},
		getMe: async (_, args, {jwt}) => {
			return Auth.validateToken(jwt);
		}
	},
	Mutation: {
		authenticate: (_, args) => {
			return Auth.authenticate(args.user)
		},
		createCliente: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'admin') {
				const cliente = await Cliente.save(args.cliente).then(result => result);
				if (!lodash.isUndefined(cliente.id)) {
					const data_user = formatDataUser(cliente.id, 'cliente', args.cliente);
					const user = await Auth.register(data_user);
					if (user.mensaje) 
						return cliente.mensaje;
					await Cliente.delete(cliente.id);
				}
				throw Error('¡Error en la creación del cliente!'); 
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		createTecnico: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'admin') {
				const tecnico = await Tecnico.save(args.tecnico).then(result => result);
				if (!lodash.isUndefined(tecnico.id)) {
					const data_user = formatDataUser(tecnico.id, 'tecnico', args.tecnico);
					const user = await Auth.register(data_user);
					if (user.mensaje) 
						return tecnico.mensaje;
					await Tecnico.delete(tecnico.id);
				}
				throw Error('¡Error en la creación del técnico!'); 	
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		updateCliente: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'admin') {
				return Cliente.update(args.cliente.id, args.cliente).then(result => result.mensaje)
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		updateTecnico: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'admin') {
				return Tecnico.update(args.tecnico.id, args.tecnico).then(result => result.mensaje)
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		createTicket: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'cliente') {
				args.ticket.id_cliente = user.id_foraneo;
				return Ticket.save(args.ticket)
					.then(async result =>  {
						let interaccion = {
							emisor: user.tipo,
							tipo: 'mensaje',
							text: args.interaccion.text
						};
						const new_interaccion = await Interaccion.save(result.ticket_id, 'interactions', interaccion);
						publicarInteraccion({
							...new_interaccion,
							tipo: 'actividad',
							text: `creó el ticket #${result.ticket_id}: ${args.ticket.titulo}`
						});
						console.log(result);
						return result;
					});
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		updateTicket: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'tecnico') {
				return Ticket.update(args.ticket._id, args.ticket)
					.then(async result => {
						let interaccion = {
							emisor: user.tipo,
							tipo: 'actividad'
						};
						for (let key in args.ticket) {
							if (key !== '_id') {
								let articulo = do {
									if (key == 'prioridad') 'la';
									else 'el';
								}
								interaccion.text = `cambió ${articulo} ${key} del ticket #${args.ticket._id} a ${args.ticket[key]}`;
								const new_interaccion = await Interaccion.save(args.ticket._id, 'interactions', interaccion);
								publicarInteraccion(new_interaccion);
							}
						}
						return result.mensaje;
					})
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		asignTecnico: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'admin') {
				return Ticket.update(args.ticket_id, {'id_tecnico': args.tecnico_id, 'estado': 'proceso'})
				.then(async result => {
					const tecnico = await Tecnico.get(args.tecnico_id);
					const interaccion = {
						emisor: user.tipo,
						tipo: 'actividad',
						text: `asignó el ticket #${args.ticket_id} al técnico: ${tecnico.nombre} ${tecnico.apellido}`
					};
					const new_interaccion = await Interaccion.save(args.ticket_id, 'interactions', interaccion);
					publicarInteraccion(new_interaccion);
					return `¡Técnico ${tecnico.nombre} agregado con éxito al ticket #${args.ticket_id}!`;
				})
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		tomarTicket: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo == 'tecnico') {
				const tecnico = await Tecnico.get(user.id_foraneo);
				return Ticket.update(args.ticket_id, {'id_tecnico': tecnico.id, 'estado': 'proceso'})
					.then(async result => {					
						const interaccion = {
							emisor: user.tipo,
							tipo: 'actividad',
							text: `tomó el ticket`
						};
						const new_interaccion = await Interaccion.save(args.ticket_id, 'interactions', interaccion);
						publicarInteraccion(new_interaccion);
						return `¡El ticket #${args.ticket_id} ahora es suyo!`;
					})
			}
			throw Error(errorEnPrivilegios(user.tipo)); 
		},
		addInteraccion: async (_, args, {jwt}) => {
			const user = await Auth.validateToken(jwt);
			if (user.tipo != 'admin') {
				const interaccion = {
					emisor: user.tipo,
					tipo: 'mensaje',
					text: args.interaccion.text
				};
				const new_interaccion = await Interaccion.save(args.interaccion.ticket_id, 'interactions', interaccion);
				publicarInteraccion(new_interaccion);
				return `¡El mensaje ha sido enviado con éxito!`;
			}
			throw Error('El usuario administrador no puede agregar interacciones al ticket'); 
		},
        addAdditionalsAttributes: async (_, args, {jwt}) => {
            const user = await Auth.validateToken(jwt);
            if (user.tipo == 'admin') {
                const interaccion = {
                    emisor: user.tipo,
                    tipo: 'mensaje',
                    text: args.interaccion.text
                };
                const new_interaccion = await Interaccion.save(args.interaccion.ticket_id, 'interactions', interaccion);
                publicarInteraccion(new_interaccion);
                return `¡El mensaje ha sido enviado con éxito!`;
            }
            throw Error('El usuario administrador no puede agregar interacciones al ticket');
        }
	},
	Subscription: {
		newInteracciones: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('interacciones'),
                ({ newInteracciones }, variables) => {
                	if (lodash.isUndefined(variables.ticket_id) || lodash.isNull(variables.ticket_id))
                		return true;
                    return variables.ticket_id === newInteracciones.ticket_id;
                }
            )
		}
	},
	Cliente: {
		tickets: cliente => Cliente.tickets(cliente.id)
	},
	Tecnico: {
		tickets: tecnico => Tecnico.tickets(tecnico.id)
	},
	Ticket: {
		cliente: ticket => Ticket.cliente(ticket.id_cliente),
		tecnico: ticket => {
			if (!lodash.isUndefined(ticket.id_tecnico))
				return Ticket.tecnico(ticket.id_tecnico);
		},
		interacciones: (ticket, {onlyFirst = false}) => Ticket.interacciones(ticket._id, onlyFirst)
	},
	Interaccion: {
		ticket: interaccion => Interaccion.ticket(interaccion.ticket_id)
	},
	User: {
		tecnico: user => {
			if (user.tipo == 'tecnico')
				return Tecnico.get(user.id_foraneo)
		},
		cliente: user => {
			if (user.tipo == 'cliente')
				return Cliente.get(user.id_foraneo)
		},
		admin: user => {
			if (user.tipo == 'admin')
				return Admin.get(user.id_foraneo)
		}
	}
};

export default resolvers;