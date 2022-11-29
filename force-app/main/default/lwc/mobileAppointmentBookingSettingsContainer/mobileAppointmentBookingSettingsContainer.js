import { LightningElement, api, wire } from 'lwc';
import ID_FIELD from '@salesforce/schema/ServiceAppointment.Id';
import WORK_TYPE_FIELD from '@salesforce/schema/ServiceAppointment.WorkTypeId';
import SCHED_END_FIELD from '@salesforce/schema/ServiceAppointment.SchedEndTime';
import SCHED_START_FIELD from '@salesforce/schema/ServiceAppointment.SchedStartTime';
import APPOINTMENT_NUMBER_FIELD from '@salesforce/schema/ServiceAppointment.AppointmentNumber';
import DURATION from '@salesforce/schema/ServiceAppointment.Duration';
//import getUserInfo from '@salesforce/apex/UserDetails.getUserInfo';
import Id from '@salesforce/user/Id';
import overrideCSS from './overrideCSS';

export default class MobileAppointmentBookingSettingsContainer extends LightningElement {
    userId = Id;
    enableAssignToMe = true;
    enableAssignToEveryAvailable = true;
    recommendedScore = 80;
    useDefaultFields = true;
    _serviceAppointmentId;

    @api operatingHoursId = "0OH8N0000005w1VWAQ";
    @api schedulingPolicyId ="a0Z8N00000029fZUAQ"; 
    @api arrivalWindowMethod = "Arrival Windows";
    @api schedulingHorizonUnit = "Months";
    @api sechedulingHorizonValue = "3"; 
    @api showExactArrivalTime =  false;   
    currentAppointmentDefaultFieldNames = [
        ID_FIELD,
        WORK_TYPE_FIELD,
        SCHED_END_FIELD,
        SCHED_START_FIELD,
        APPOINTMENT_NUMBER_FIELD,
        DURATION
        ]; 

    @api set recordId(recordId) {
        if (recordId !== this._serviceAppointmentId) {
            this._serviceAppointmentId = recordId;
        }
    }

    get recordId() {
        return this._serviceAppointmentId;
    }

    connectedCallback(){
        
        const myStyle = document.createElement('style');
        myStyle.innerHTML = overrideCSS;
        document.head.appendChild(myStyle);
    }
    
}