import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { createServer } from 'http';
import cors from 'cors';
import jwt from 'jwt-simple';

import * as models from './code/models'
import EmailSupportController from './code/controllers/EmailSupport'
import TicketsController from './code/controllers/Tickets'

//GraphQL y Apollo
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import schema from './code/graphql/schema';

//CONSTANTS
const
	GRAPHQL_PORT = 3001,
	GRAPHQL_HOST = 'localhost',
	GRAPHQL_URL = '/graphql',
	SUBSCRIPTIONS_URL = '/subscriptions';

//EXPRESS SERVER
const graphQLServer = express();

//CONECTING MONGODB
mongoose.Promise = Promise;
mongoose.connect(`mongodb://${GRAPHQL_HOST}/tickets`);
let Tenants = mongoose.model('Tenants');

//MIDDLEWARE CORS FOR ALLOW EXTERNAL ORIGINS
// graphQLServer.use('*', cors({ origin: `http://localhost:${GRAPHQL_PORT}` }));//subscription
graphQLServer.use(cors());

//MIDDLEWARE VALIDATE SUBDOMAIN
graphQLServer.use(GRAPHQL_URL, bodyParser.json({limit: '8mb'}), bodyParser.urlencoded({ extended: true }), async (req, res, next) => {
	if (req.headers.host === `${GRAPHQL_HOST}:${GRAPHQL_PORT}`) {
		const query = req.body.query;
		if (query && query.includes("mutation") && query.includes("registerTenant"))
			next();
	}
	else {
		req.context = {};
		const tenant = await Tenants.findOne({subdomain: req.headers.host.split(".")[0]});
		if(tenant) {
			req.context.tenant_id = tenant.id;
			next();
		}
		else res.status(402).json({
			ok: false,
			errors: [{
				path: "/",
				message: "Usted no es un cliente del sistema, registrese adquiriendo una suscripción para continuar."
			}]
		});
	}
});

//MIDDLEWARE VALIDATE TENANT EXISTS
graphQLServer.use(GRAPHQL_URL, bodyParser.json({limit: '8mb'}), bodyParser.urlencoded({ extended: true }), async (req, res, next) => {
	if (req.headers.host !== `${GRAPHQL_HOST}:${GRAPHQL_PORT}`) {
		if(req.headers.authorization) {
			// Validate that the token is valid
			req.context.requester = jwt.decode(req.headers.authorization.split('Bearer ')[1], '123');
			req.context.jwt = req.headers.authorization;
			next();
		}
		else {
			const query = req.body.query;
			if (!(query.includes("mutation") && query.includes("login") && query.includes("email") && query.includes("password"))) {
				res.status(402).json({
					ok: false,
					errors: [{
						path: "login",
						message: "Recurso protegido, debe estar logueado para continuar."
					}]
				});
			}
			else next();
		}
	}
	else next();
});

// MIDDLEWARE SET SCHEMA AND CONTEXT TO GRAPHQL SERVER
graphQLServer.use(GRAPHQL_URL, bodyParser.json({limit: '8mb'}), bodyParser.urlencoded({ extended: true }),
	graphqlExpress( async (req, res) => {
		return({
			schema,
			context: { ...req.context }
		})
	})
);

//MIDDLEWARE RUN GRAPHIQL
graphQLServer.use('/graphiql', graphiqlExpress({
	endpointURL: GRAPHQL_URL,
	subscriptionsEndpoint: `ws://${GRAPHQL_HOST}:${GRAPHQL_PORT}${SUBSCRIPTIONS_URL}`//subscription
}));

// WRAP THE EXPRESS SERVER WITH SUBSCRIPTIONS
const ws = createServer(graphQLServer);
ws.listen(GRAPHQL_PORT, async () => {
	await EmailSupportController.listenAll();
	console.log(`Apollo Server is now running on http://${GRAPHQL_HOST}:${GRAPHQL_PORT}${GRAPHQL_URL}`);
	new SubscriptionServer({
		execute,
		subscribe,
		schema,
		onConnect: (connectionParams, webSocket) => ({
			subdomain: webSocket.upgradeReq.headers.host.split(".")[0]
		})
	}, {
		server: ws,
		path: SUBSCRIPTIONS_URL,
	});
});
