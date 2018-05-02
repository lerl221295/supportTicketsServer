import mongoose from 'mongoose';
import md5 from "md5";

const Tenants = mongoose.model('Tenants');
const Fields = mongoose.model('Fields');
const Policies = mongoose.model('Policies');
const Users = mongoose.model('Users');
const Agents = mongoose.model('Agents');
const States = mongoose.model('States');

class TenantsController {
	constructor() {
		this.mutations = {
			registerTenant: this.save
		};

		this.defaultFields = [
			{
				type: "TEXT",
				default: true,
				key: "title",
				clientVisible: true,
				label: "Titulo"
			},
			{
				type: "TEXTAREA",
				default: true,
				key: "description",
				clientVisible: true,
				label: "Descripción"
			},
			{
				type: "SELECT",
				default: true,
				key: "priority",
				clientVisible: false,
				label: "Prioridad",
				options: [
					{
						key: "LOW",
						label: "Baja"
					},
					{
						key: "MEDIUM",
						label: "Media"
					},
					{
						key: "HIGH",
						label: "Alta"
					},
					{
						key: "URGENT",
						label: "Urgente"
					}
				]
			},
			{
				type: "SELECT",
				default: true,
				key: "source",
				clientVisible: false,
				label: "Fuente",
				options: [
					{
						key: "PORTAL",
						label: "Portal"
					},
					{
						key: "EMAIL",
						label: "Email"
					},
					{
						key: "FACEBOOK",
						label: "Facebook"
					},
					{
						key: "TWITTER",
						label: "Twitter"
					},
					{
						key: "PHONE",
						label: "Telefono"
					}
				]
			},
			{
				type: "SELECT",
				default: true,
				key: "state",
				clientVisible: true,
				label: "Estado",
				ent_field: "States"
			},
			{
				type: "SELECT",
				default: true,
				key: "client",
				clientVisible: false,
				label: "Cliente",
				ent_field: "Clients"
			},
			{
				type: "SELECT",
				default: true,
				key: "agent",
				clientVisible: false,
				label: "Agente",
				ent_field: "Agents"
			},
			{
				type: "SELECT",
				default: true,
				key: "group",
				clientVisible: false,
				label: "Grupo",
				ent_field: "Groups"
			},
			{
				type: "SELECT",
				default: true,
				key: "supplier",
				clientVisible: false,
				label: "Proveedor",
				ent_field: "Suppliers"
			},
			{
				type: "SELECT",
				default: true,
				key: "device",
				clientVisible: false,
				label: "Dispositivo",
				ent_field: "Devices"
			},
			{
				type: "SELECT",
				default: true,
				key: "type",
				clientVisible: true,
				label: "Tipo",
				options: [
					{
						key: "problem",
						label: "Problema"
					},
					{
						key: "question",
						label: "Pregunta"
					},
					{
						key: "incident",
						label: "Incidencia"
					}
				]
			}
		];

		this.defaultSLA = {
			"name": "Política SLA por defecto",
			"description": "La política SLA por defecto se puede actualizar, más no eliminar, desactivar ni cambiar de orden",
			"objectives": [
				{
					"priority": "LOW",
					"operational_hours": "BUSINESS",
					"solved": {
						"value": 5,
						"unity": "DAYS"
					},
					"first_response": {
						"value": 20,
						"unity": "HOURS"
					}
				},
				{
					"priority": "MEDIUM",
					"operational_hours": "BUSINESS",
					"solved": {
						"value": 3,
						"unity": "DAYS"
					},
					"first_response": {
						"value": 15,
						"unity": "HOURS"
					}
				},
				{
					"priority": "HIGH",
					"operational_hours": "BUSINESS",
					"solved": {
						"value": 2,
						"unity": "DAYS"
					},
					"first_response": {
						"value": 10,
						"unity": "HOURS"
					}
				},
				{
					"priority": "URGENT",
					"operational_hours": "BUSINESS",
					"solved": {
						"value": 1,
						"unity": "DAYS"
					},
					"first_response": {
						"value": 5,
						"unity": "HOURS"
					}
				}
			],
			"active": true,
			"position": 0,
			"by_default": true
		};

		this.defaultStates = [
			{
				key: "new",
				label: "Nuevo",
				stage: "PREPARATION",
				sla_paused: false
			},
			{
				key: "process",
				label: "En Proceso",
				stage: "PROGRESS",
				sla_paused: false
			},
			{
				key: "waiting",
				label: "En Espera",
				stage: "PROGRESS",
				sla_paused: true
			},
			{
				key: "resolved",
				label: "Resuelto",
				stage: "END",
				sla_paused: false
			},
			{
				key: "failed",
				label: "Fallido",
				stage: "END",
				sla_paused: false
			}
		];

		this.DefaultCameFrom = [
			{
				key: "process",
				from: [ "new", "waiting" ]
			},
			{
				key: "waiting",
				from: [ "process", "new" ]
			},
			{
				key: "resolved",
				from: [ "process", "waiting" ]
			},
			{
				key: "failed",
				from: [ "process", "waiting" ]
			}
		]
	}

	save = async (_, {tenant: {admin, ...tenant}}) => {
		const newTenant = await Tenants.create({...tenant, active: true});
		const user = await Users.create({
			tenant_id: newTenant.id,
			password: md5("abc123")
		});
		await Agents.create({...admin, user_id: user.id, role: "ADMIN", tenant_id: newTenant.id});
		await Promise.all(this.defaultFields.map(async defaultField => {
			await Fields.create({...defaultField, tenant_id: newTenant.id})
		}));
		await Policies.create({...this.defaultSLA, tenant_id: newTenant.id});
		const newStates = await Promise.all(this.defaultStates.map(async defaultState =>
			await States.create({...defaultState, tenant_id: newTenant.id})
		));
		await Promise.all(this.DefaultCameFrom.map(async ({key, from}) => {
			const came_from = from.map(came => newStates.find(({key}) => key === came)._id);
			await States.findOneAndUpdate({tenant_id: newTenant.id, key}, {came_from}, {new: true});
		}));
		return newTenant;
	}
}

export default new TenantsController