import Resource from './resource';
import fetch from 'node-fetch';
import _ from 'lodash';
import {
    URL_AUTH,
    URL_CLIENTES,
    URL_TECNICOS,
    URL_TICKETS
} from './apiUrl'
// La autenticación no es un recurso

var tecnicosApi = new Resource(URL_TECNICOS+'/tecnicos');
export const Tecnico = {
    get : id => tecnicosApi.get(id),
    getAll: () => tecnicosApi.all(),
    save: tecnicosApi.save,
    update: tecnicosApi.update,
    delete: tecnicosApi.delete,
    tickets: id => fetch(URL_TICKETS+'/tecnicos/'+id+'/tickets').then(res => res.json())
};

var clientesApi = new Resource(URL_CLIENTES+'/clientes');
export const Cliente = {
    get : id => clientesApi.get(id),
    getAll: () => clientesApi.all(),
    save: clientesApi.save,
    update: clientesApi.update,
    delete: clientesApi.delete,
    tickets: id => fetch(URL_TICKETS+'/clientes/'+id+'/tickets').then(res => res.json())    
};

var ticketsApi = new Resource(URL_TICKETS+'/tickets');
export const Ticket = {
    get : id => ticketsApi.get(id),
    getAll: (estado, user) => {
        let query = "";
        if (!_.isNull(estado)) {
            query += `estado=${estado}&`;
        }
        query += `${user.tipo}=${user.id}`;
        return ticketsApi.all(query);
    },
    save: ticketsApi.save,
    update: ticketsApi.update,
    cliente: id => clientesApi.get(id),
    tecnico: id => tecnicosApi.get(id),
    interacciones: (id, onlyFirst) => {
    	let q = '';
    	if (onlyFirst) q = '?limit=1';
    	return ticketsApi.subResource(id, 'interactions', q);
    }
};

var interaccionesApi = new Resource(URL_TICKETS+'/interactions');
export const Interaccion = {
    save: ticketsApi.saveSubResource,
    getAll: n => interaccionesApi.all(`limit=${n}`),
    ticket: ticket_id => ticketsApi.get(ticket_id)
};

export const Auth = {
    register: user => (
        fetch(`${URL_AUTH}/register`, {
            method: 'POST',
            body:    JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
    ),
    authenticate: credentials => (
        fetch(`${URL_AUTH}/authenticate`, {
            method: 'POST',
            body:    JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(res => {
            if (res.error) throw Error(res.error);
            return res;         
        })
    ),
    validateToken: jwt => (
        fetch(URL_AUTH+"/validar", {
            method: 'GET',
            headers: { 'Authorization': jwt }
        })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw Error(res.error);
                return res;
            })
            .catch((err) => {
                if (err.code == 'ECONNREFUSED') {
                    throw Error('Lo sentimos, estamos teniendo problemas en nuestro servidor, intente de nuevo más tarde');
                }
                throw Error(err);
            })
    )
};

var adminsApi = new Resource(URL_AUTH+'/admins');
export const Admin = {
    get : id => adminsApi.get(id)
}



