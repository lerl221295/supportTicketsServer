import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { createServer } from 'http';
import cors from 'cors';
import jwt from 'jwt-simple';

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
    // const subdomain = req.headers.host.split(".")[0];
    const subdomain = 'directv';
    if(SUBDOMAINS.includes(subdomain))
        next();
    else res.status(404).json({error: "no tienes aseso menol"});
});

let Tenants = mongoose.model('Tenants');

//MIDDLEWARE PARSE BODY TO JSON, SET SCHEMA AND CONTEXT TO GRAPHQL SERVER
graphQLServer.use(GRAPHQL_URL, bodyParser.json(), bodyParser.urlencoded({ extended: true }),
    graphqlExpress( async (req) => {
        // const tenant = await Tenants.findOne({subdomain: req.headers.host.split(".")[0]});
        const tenant = await Tenants.findOne({subdomain: 'directv'});
        let requester = null;
        if(req.headers.authorization) requester = jwt.decode(req.headers.authorization.split('Bearer ')[1], '123');
        else requester = jwt.decode("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YTkxZTk5NTA0ZTljNTFjZTU2YmZiNzIiLCJuYW1lIjoiSm9yZ2UgTHVpcyIsImxhc3RuYW1lIjoiUm9qYXMgTW9udGVybyIsInNleCI6Ik1BTEUiLCJlbWFpbCI6ImpvcmdlQGdtYWlsLmNvbSIsInJvbGUiOiJBR0VOVCIsInVzZXJfaWQiOiI1YTkxZTk5NTA0ZTljNTFjZTU2YmZiNzEiLCJ0ZW5hbnRfaWQiOiI1YTgzNTdiMWZmZjJjYTIyMGYzMzJmZDgiLCJfX3YiOjAsInBob25lcyI6W10sInVzZXJfdHlwZSI6IkFHRU5UIn0.FkP1FOKJ6nqeU-UeE-TeVHDy03xpOf972wZkpm5Jbig", '123');
        /*{
            res.status(404).json({
                ok: false,
                errors: [{
                    path: "login",
                    message: "Recurso protegido, debe estar logueado para continuar."
                }]
            });
            return;
        }*/
        return({
            schema,
            //para manejar el jwt en el header : (agregarlo al context para
            //que cada resolver lo reciba en el tercer parametro.jwt
            context: {
                requester,
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
