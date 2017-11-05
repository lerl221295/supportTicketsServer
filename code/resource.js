import fetch from 'node-fetch';

class Resource {
	/*Clase para consumir cualquier API RESTUL*/
	constructor(url){
		this.url = url;// https://www.elapi.com/recurso/
		this.serverOut = 'El servidor no se encuentra disponible en estos momentos, por favor, contáctese con un administrador';
	}

	get = id => (
		fetch(this.url+'/'+id)
			.then(res => res.json())
			.then(res => {
				if (res.error) throw Error(res.error);
				return res;
			})
            .catch(() => {})
	)

	all = (query) => (
		fetch(this.url+'?'+query)
			.then(res => res.json())
            .catch(() => {
                throw Error(this.serverOut);
            })
	);

	subResource = (id, sub, q) => (
		fetch(this.url+'/'+id+'/'+sub+q)
			.then(res => res.json())
            .catch(() => {})
	)

	saveSubResource = (id, sub, resource) => (
		fetch(this.url+'/'+id+'/'+sub, {
        	method: 'POST',
			body:    JSON.stringify(resource),
			headers: { 'Content-Type': 'application/json' }
        })
			.then(res => res.json())
            .catch(() => {
                throw Error(this.serverOut);
			})
	)

	save = resource => {
		return fetch(this.url, {
        	method: 'POST',
			body:    JSON.stringify(resource),
			headers: { 'Content-Type': 'application/json' }
        })
			.then(res => res.json())
            .catch(() => {
                throw Error(this.serverOut);
			});
	}

	update = (id, resource) => (
		fetch(this.url+'/'+id, {
        	method: 'PUT',
			body:    JSON.stringify(resource),
			headers: { 'Content-Type': 'application/json' }
        })
			.then(res => res.json())
            .catch(() => {
                throw Error(this.serverOut);
			})
	)

	delete = id => (
		fetch(this.url+'/'+id, {
        	method: 'DELETE',
			headers: { 'Content-Type': 'application/json' }
        })
			.then(res => res.json())
            .catch(() => {
                throw Error(this.serverOut);
			})
	)
}

export default Resource