import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { createServer } from 'http';
import cors from 'cors';

import * as models from './code/models'

//GraphQL y Apollo
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import schema from './code/graphql/schema';

//CONSTANTS
const GRAPHQL_PORT = 3001,
    GRAPHQL_URL = '/graphql',
    SUBSCRIPTIONS_URL = '/subscriptions';

let SUBDOMAINS = ['directv', 'sidor'];

//EXPRESS SERVER
const graphQLServer = express();

//CONECTING MONGODB
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/tickets');
//mongoose.connect('mongodb://username:password@host:port/database?options...');

//MIDDLEWARE CORS FOR ALLOW EXTERNAL ORIGINS
// graphQLServer.use('*', cors({ origin: `http://localhost:${GRAPHQL_PORT}` }));//subscription
graphQLServer.use(cors());

//MIDDLEWARE VALIDATE SUBDOMAIN
graphQLServer.use(GRAPHQL_URL, (req, res, next) => {
    const subdomain = req.headers.host.split(".")[0];
    if(SUBDOMAINS.includes(subdomain))
        next();
    else res.status(404).json({error: "no tienes aseso menol"});
});

let Tenants = mongoose.model('Tenants');

//MIDDLEWARE PARSE BODY TO JSON, SET SCHEMA AND CONTEXT TO GRAPHQL SERVER
graphQLServer.use(GRAPHQL_URL, bodyParser.json(), bodyParser.urlencoded({ extended: true }),
    graphqlExpress( async (req) => {
        const tenant = await Tenants.findOne({subdomain: req.headers.host.split(".")[0]});
        return({
            schema,
            //para manejar el jwt en el header : (agregarlo al context para
            //que cada resolver lo reciba en el tercer parametro.jwt
            context: {
                jwt: req.headers.authorization ,
                tenant_id: tenant.id
            }
        })
    })
);

//MIDDLEWARE RUN GRAPHIQL
graphQLServer.use('/graphiql', graphiqlExpress({ 
	endpointURL: GRAPHQL_URL,
  	subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_URL}`//subscription
}));

// WRAP THE EXPRESS SERVER WITH SUBSCRIPTIONS
const ws = createServer(graphQLServer);
ws.listen(GRAPHQL_PORT, () => {
    console.log(`Apollo Server is now running on http://localhost:${GRAPHQL_PORT}${GRAPHQL_URL}`);
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
