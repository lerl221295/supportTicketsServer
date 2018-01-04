import express from 'express';
import compression from 'compression';
import { Engine } from 'apollo-engine';
import { express as Voyager } from 'graphql-voyager/middleware';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './code/graphql/schema/schema-dev';
import cors from 'cors';
import MailListener from 'mail-listener2';

//subscription
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const GRAPHQL_PORT = 3000;

const graphQLServer = express();

graphQLServer.use('*', cors());

const subdomains = ['directv', 'sidor'];

/*graphQLServer.use(compression());

const engine = new Engine({
    engineConfig: {
        apiKey: 'service:lerl221295-6173:tdPmMP1_YVNGavfPlCZhfg'
    },
    graphqlPort: GRAPHQL_PORT
});

engine.start();

graphQLServer.use(engine.expressMiddleware());*/

graphQLServer.use('/voyager', Voyager({ endpointUrl: '/graphql' }));

graphQLServer.use('/graphql', (request, res, next) => {
	// const subdomain = request.headers.host.split(".")[0];
	const subdomain = 'directv';
	if(subdomains.includes(subdomain))
		next();
	else res.send("no tienes aseso menol");
});

graphQLServer.use('/graphql', bodyParser.json({limit: '8mb'}),
	graphqlExpress( request => ({
			schema,
			//tracing: true,
  			//cacheControl: true,
			context: {
				subdomain: 'directv'
				// subdomain: request.headers.host.split(".")[0]
				/*subdomain: do {
					if (request.headers.host[0] === '1' ) {'directv'}
					else {request.headers.host.split(".")[0]}
				}*/
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
	new SubscriptionServer({
		execute,
		subscribe,
		schema,
		onConnect: ({subdomain}, webSocket) => {
			// console.log(webSocket.upgradeReq.headers.origin.split(".")[0].split("//")[1])
			return({
				// subdomain: webSocket.upgradeReq.headers.origin.split(".")[0].split("//")[1]
				subdomain: 'directv'
				//falta validar el connectionParams.token
				//subdomain
			})
		},
	}, {
		server: ws,
		path: '/subscriptions',
	});
});

var mailListener = new MailListener({
	username: "lrojas932@e.uneg.edu.ve",
	password: "25696932e.luis",
	host: "imap.gmail.com",
	port: 993, // imap port
	tls: true,
	//connTimeout: 10000, // Default by node-imap
	//authTimeout: 5000, // Default by node-imap,
	//debug: console.log, // Or your custom function with only one incoming argument. Default: null
	//tlsOptions: { rejectUnauthorized: false },
	//mailbox: "INBOX", // mailbox to monitor
	//searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
	markSeen: true, // all fetched email willbe marked as seen and not fetched next time
	fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
	//mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
	//attachments: true, // download attachments as they are encountered to the project directory
	//attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function() {
	console.log("imapConnected");
});

mailListener.on("server:disconnected", function() {
	console.log("imapDisconnected");
});

mailListener.on("error", function(err) {
	console.log("error", err);
});

mailListener.on("mail", function(mail, seqno, attributes) {
	const ticketMail = {
		/*debe almacenarse en la bd el id de los tickets que se creen via mail*/
		messageId: mail.messageId,
		title: mail.subject,
		client: mail.from[0].address,
		time: mail.date,
		text: mail.text,
		reference: do {
			if(mail.references && mail.references.length)
				mail.references[0]
			else null
		}/*,
        body: mail.html //html del cuerpo del mensaje */
	};
	/*si ticketMail.reference, en lugar de crear el ticket, se busca el ticket
	que coincida con la referencia y se agrega una intervencion*/
	console.log("emailParsed", ticketMail);
});

/*mailListener.on("attachment", function(attachment) {
    console.log(attachment.path);
});*/