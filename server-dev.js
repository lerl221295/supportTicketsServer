import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './code/schema-dev';
import cors from 'cors';

//subscription
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const GRAPHQL_PORT = 3000;

const graphQLServer = express();

graphQLServer.use('*', cors(/*{ origin: `http://localhost:${GRAPHQL_PORT}` }*/));//subscription

const subdomains = ['directv', 'sidor'];

graphQLServer.use('/graphql', (request, res, next) => {
    if(subdomains.includes(request.headers.host.split(".")[0]))
        next();
    else res.send("no tienes aseso menol");
})

graphQLServer.use('/graphql', bodyParser.json(), 
    graphqlExpress( request => ({
            schema,
            context: { 
                subdomain: request.headers.host.split(".")[0]
            }
        }) 
    ) 
);


graphQLServer.use('/graphiql', graphiqlExpress({ 
	endpointURL: '/graphql',
  	subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}/subscriptions`//subscription
}));

// Wrap the Express server
const ws = createServer(graphQLServer);
ws.listen(GRAPHQL_PORT, () => {
    console.log(`Servidor de desarrollo corriendo en http://localhost:${GRAPHQL_PORT}/graphql`);
    // Set up the WebSocket for handling GraphQL subscriptions
    new SubscriptionServer({
        execute,
        subscribe,
        schema
    }, {
        server: ws,
        path: '/subscriptions',
    });
});

/*graphQLServer.listen(GRAPHQL_PORT, () => {
    console.log(`Servidor de desarrollo corriendo en http://localhost:${GRAPHQL_PORT}/graphql`);
});
*/