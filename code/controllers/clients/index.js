/*exportar todos los metodos que le corresponden a este modulo*/
import Clients from './Clients'

export default {
	querys: {
		client: Clients.get,
		clients: Clients.getAll
	},
	mutations: {
		createClient: Clients.save,
		updateClient: Clients.update
	},
	relationships: {
		clients: {
			...Clients.properties
			//tickets, devices .....
		}
	}
}