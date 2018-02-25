import mongoose from 'mongoose';
import moment from 'moment';

const Policies = mongoose.model('Policies');
const Clients = mongoose.model('Clients');
const Organizations = mongoose.model('Organizations');
const Alerts = mongoose.model('Alerts');
const Agents = mongoose.model('Agents');
const Tickets = mongoose.model('Tickets');

class DashboardController {
    constructor (){
        this.querys = {
            ticketsCountByDay: this.ticketsCountByDay,
        };

        /*this.propertiesAndRelationships = {
            clients: this.clients,
            organizations: this.organizations,
            alerts: this.alerts
        };

        this.alertsRelationships = {
            to: this.alertsTo
        };*/
    }

    ticketsCountByDay = async (_, {last}, {jwt, tenant_id}) => {
        const
            // Start day of interval, defined by 'last' parameter
            startDate = moment().subtract(last, "days").set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}),
            // End day of interval, it's current day at 00:00:00
            endDate = moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0}),
            // Find tickets corresponding to the indicated interval
            ticketsLastDays = await Tickets.find({tenant_id, time: { $gte : startDate.toDate(), $lt: endDate.toDate()} }).sort('time').select('time -_id'),
            // Variable that will contain the number of tickets per day
            ticketsByDays = [];
        // Loop corresponding at number of days indicated at 'last' parameter
        for (let i = 0, j = 0; i < last; i++) {
            // Current day of the loop
            const currentDay = moment(startDate).add(i, 'days');
            // Add one element to ticketsByDays array
            ticketsByDays.push({
                day: currentDay.toDate(),
                tickets: 0
            });
            // Loop to go through the ticketsLastDays array and evaluate if the ticket date corresponds to the date of the loop (currentDay).
            while (j < ticketsLastDays.length) {
                if (moment(currentDay).isSame(ticketsLastDays[j].time, 'day')) {
                    ticketsByDays[i].tickets++;
                    j++;
                }
                else break;
            }
        }
        return ticketsByDays;
    };

    /*clients = async ({clients}) => await Clients.find({_id: {$in: clients}});

    organizations = async ({organizations}) => await Organizations.find({_id: {$in: organizations}});

    alerts = async ({_id}) => await Alerts.find({sla_policy_id: _id});

    alertsTo = async ({to: AgentsIds}) => await Agents.find({_id: {$in: AgentsIds} })*/
}

export default new DashboardController