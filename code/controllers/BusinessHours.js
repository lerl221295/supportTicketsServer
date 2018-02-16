import mongoose from 'mongoose';
//import _ from 'lodash';

let BusinessHours = mongoose.model('BusinessHours');

class BusinessHoursController {
    constructor(){
        this.querys = {
            businessHours: this.get
        }

        this.mutations = {
            updateBusinessHours: this.update
        }

        this.propertiesAndRelationships = {
            __resolveType: this.resolveType
        }
    }

    resolveType = ({mode}) => do {
        if(mode === "TWENTYFOUR_SEVEN") "TwentyFourSeven";
        else if(mode === "SAME_FOR_DAYS") "SameForDays";
        else if(mode === "CUSTOMIZED") "Customized";
    }

    get = async (_, {days}, {jwt, tenant_id}) => {
        const businessHours = await BusinessHours.findOne({tenant_id});
        if(days){
            if(businessHours.mode === "CUSTOMIZED"){
                businessHours.working_days = businessHours.working_days
                    .filter(({day}) => days.includes(day))
            }
            else if(businessHours.mode === "SAME_FOR_DAYS"){
                businessHours.week_days = businessHours.week_days
                    .filter(day => days.includes(day))
            }
        }
        return businessHours;
    }
    
    update = async (_, {business_hours: {mode, ...newBusinessHours}}, {tenant_id}) => {
        const businessHours = await BusinessHours.findOne({tenant_id});
        businessHours.mode = mode;
        if(newBusinessHours.holidays)
            businessHours.holidays = newBusinessHours.holidays;
        if(mode === "TWENTYFOUR_SEVEN"){
            businessHours.working_days = undefined;
            businessHours.week_days = undefined;
            businessHours.horary = undefined;
        }
        else if(mode === "SAME_FOR_DAYS"){
            businessHours.week_days = newBusinessHours.week_days;
            businessHours.horary = newBusinessHours.horary;
            businessHours.working_days = undefined;
        }
        else if(mode === "CUSTOMIZED"){
            businessHours.working_days = newBusinessHours.working_days;
            businessHours.week_days = undefined;
            businessHours.horary = undefined;
        }

        businessHours.save();        
        return businessHours;
    }

}

export default new BusinessHoursController