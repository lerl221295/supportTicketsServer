import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './code/schema';

//subscription
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import cors from 'cors';

const GRAPHQL_PORT = 3000;

const graphQLServer = express();

// graphQLServer.use('*', cors({ origin: `http://localhost:${GRAPHQL_PORT}` }));//subscription
graphQLServer.use(cors());
graphQLServer.use('/graphql', bodyParser.json(), 
    graphqlExpress( request => ({
            schema,
            //para manejar el jwt en el header : (agregarlo al context para
            //que cada resolver lo reciba en el tercerparametro.jwt
            context: {
                // Cliente nmsflove@gmail.com nsuarez219
                // jwt: request.headers.authorization || "Bearer YUFxZzFWMG9NbzBlM2tMQnRqQ0cxUVFpa2FiZGlHSzlwQkVsSXY3UA=="
                // Cliente raelyx@gmail.com rcordero777
                // jwt: request.headers.authorization || "Bearer eGt1amxHdWtZazhhUHRFeUJMV2RJNDVMRXhiNlJ0TlRoTXBzVWJkNA=="
                // Tecnico jesus@gmail.com jbriceño456
                // jwt: request.headers.authorization || "Bearer VUF1UVU0aXJjVG1tVVphbVVHRDA4OTJGOUgwQjRFSnIwbThiWTd5Rg=="
                // Tecnico luis@gmail.com lrojas932
                // jwt: request.headers.authorization || "Bearer Z3FJVlZpeGdpQlBBNVBDM0EyWnN5RTdYTkRwU3FVVnpYb0lkaVhwNA=="
                // Admin admin@kernel.com root123
                jwt: request.headers.authorization || "Bearer UmdFNzluYk8wcndKY0NDMWN4WXBjSnZiZmh0TFlOMFFzdjAxUzFhcg=="
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
    console.log(`Apollo Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`);
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
