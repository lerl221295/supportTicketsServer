import mongoose from 'mongoose';
import moment from 'moment';
import { getResponseResolveTime } from '../utils';

const Policies = mongoose.model('Policies');
const Clients = mongoose.model('Clients');
const Organizations = mongoose.model('Organizations');
const Alerts = mongoose.model('Alerts');
const Agents = mongoose.model('Agents');
const Tickets = mongoose.model('Tickets');
const States = mongoose.model('States');

class DashboardController {
    constructor (){
        this.querys = {
            ticketsCountByDay: this.ticketsCountByDay,
            indicators: this.indicators
        };
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

    indicators = async (_, {last}, {jwt, tenant_id}) => {
        // Instance of indicators
        let indicators = {
            unresolved: 0,
            overdue: 0,
            due_today: 0,
            open: 0,
            on_hold: 0,
            unassigned: 0
        };
        // Find tickets, sorts asc by time, with field_values.field populate
        const allTickets = await Tickets
            .find({tenant_id}).sort('time')
            .populate({
                path: 'field_values.field',
                match: { key: {$in: ['state', 'agent', 'client', 'priority']}},
                select: 'key ent_field'
            })
            .select('field_values time')
            .exec((err, tickets) => {
                if (!err) {
                    tickets = tickets.map(ticket => {
                        ticket.field_values = ticket.field_values.filter(({field}) => field);
                        return ticket;
                    });
                    return tickets;
                }
            });
        // Count the amount of the open, on hold, unresolved and unassigned tickets
        await Promise.all(allTickets.map(async ({_id, field_values, time}) => {
            await Promise.all(field_values.map(async ({field: {key}, value: {ent_id}}) => {
                if (key === 'state') {
                    // Open tickets
                    const open = await States.findOne({tenant_id, _id: ent_id, key: 'new'}).select('key');
                    if (open) indicators.open++;
                    // Tickets on hold
                    const on_hold = await States.findOne({tenant_id, _id: ent_id, sla_paused: true}).select('key');
                    if (on_hold) indicators.on_hold++;
                    // Unresolved tickets
                    const unresolved = await States.findOne({tenant_id, _id: ent_id, stage: {$ne: 'END'}}).select('key');
                    if (unresolved) {
                        indicators.unresolved++;
                        const resolve_by = await getResponseResolveTime({field_values, time, tenant_id, type: 'solved'});
                        if (moment().isSame(resolve_by, 'day')) indicators.due_today++;
                        if (moment().isAfter(resolve_by, 'day')) indicators.overdue++;
                    }
                }
                else
                    if (key === 'agent')
                        if (!ent_id) indicators.unassigned++;

            }))
        }));
        // This is used for mock overdue and due_today
        /*indicators = {
            ...indicators,
            overdue: Math.round(indicators.unresolved * 0.2),
            due_today: Math.round(indicators.unresolved * 0.1)
        };*/
        // Return calculated indicators
        return indicators;
    }
}

export default new DashboardController