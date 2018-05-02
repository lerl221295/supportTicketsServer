import mongoose from 'mongoose';
import nodemailer from 'nodemailer'
import MailListener from 'mail-listener2';
import TicketsController from './Tickets'

const Tenants = mongoose.model('Tenants');
const Clients = mongoose.model('Clients');


class EmailSupport {
	constructor(){
		this.querys = {
			emailSupport: this.getEmailSupport
		};

		this.mutations = {
			updateEmailSupport: this.setEmailSupport
		}
	}

	processEmail = (tenant_id, transporter) => async (mail, seqno, attributes) => {
		const client = await Clients.findOne({email: mail.from[0].address, tenant_id});
		if(!client) {
			/*enviar correo de respuesta indicando que no es un cliente registrado*/
			const mailResponse = {
			  	from: 'youremail@gmail.com',
			  	to: mail.from[0].address,
			  	subject: `Re: ${mail.subject}`,
			  	text: 'Tu email no esta registrado como un cliente de la plataforma de soporte, contacta un supervisor',
			  	inReplyTo: mail.messageId
			};
			transporter.sendMail(mailResponse, (error, info) => {
				if (error) {
				    console.log(error);
				}
			});
			return;
		}
		
		const email_reference = do {
			if(mail.references && mail.references.length)
				mail.references[0]
			else null
		};

		const requester = {
			_id: client.id,
			user_type: "CLIENT"
		}

		if(email_reference){
			/*no es un nuevo ticket, sino un mensaje en un ticket*/
			const intervention = {
				email_reference,
				text: mail.html,
				time: mail.date,
				messageId: mail.messageId,
				messageSubject: mail.subject
			}
			await TicketsController.addIntervention({}, {intervention}, {tenant_id, requester})
		}
		else{
			const ticketMail = {
				/*debe almacenarse en la bd el id de los tickets que se creen via mail*/
				//messageId: mail.messageId,
				title: mail.subject,
				client_id: client.id,
				time: mail.date,
				description: mail.html,//mail.text,
				source: 'EMAIL',
				email_reference: mail.messageId
			};
			await TicketsController.save({}, {ticket: ticketMail}, {requester, tenant_id});
			const mailResponse = {
			  	from: 'youremail@gmail.com',
			  	to: mail.from[0].address,
			  	subject: `Re: ${mail.subject}`,
			  	text: 'Tu ticket fue creado exitosamente, te contactaremos en breve',
			  	inReplyTo: mail.messageId
			};
			transporter.sendMail(mailResponse, (error, info) => {
				if (error) {
				    console.log(error);
				}
			});
		}
	}

	listen = (tenant) => {
		let mailListener = new MailListener({
			username: tenant.emailSupport.address,
			password: tenant.emailSupport.password,
			host: "imap.gmail.com",
			port: 993, // imap port
			tls: true,
			markSeen: true, // all fetched email willbe marked as seen and not fetched next time
			fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
		});

		mailListener.start(); // start listening

		// stop listening
		//mailListener.stop();

		mailListener.on("error", function(err) {
			console.log("error", err, tenant);
		});

		const transporter = nodemailer.createTransport({
		    service: 'gmail',
		    auth: {
		        user: tenant.emailSupport.address,
		        pass: tenant.emailSupport.password
		    }
		});

		mailListener.on("mail", this.processEmail(tenant._id, transporter));

		TicketsController.setTransporter(transporter, tenant._id);

		return transporter;
	}

	listenAll = async () => {
		const tenants = await Tenants.find();
		let transporters = {};
		for(let tenant of tenants){
			tenant = tenant.toObject();
			if(tenant.emailSupport){
				transporters[tenant._id] = this.listen(tenant);
			}
		}
		return transporters;
	}

	getEmailSupport = async (_, args, {tenant_id}) => {
		const tenant = await Tenants.findById(tenant_id);
		if(tenant.emailSupport) return tenant.emailSupport.address;
		return null;
	}

	setEmailSupport = async (_, {config}, {tenant_id}) => {
		const tenant = await Tenants.findById(tenant_id);
		tenant.emailSupport = {
			address: config.email,
			password: config.password
		}
		this.listen(tenant);
		await tenant.save();
		return config.email;
	}
}

export default new EmailSupport