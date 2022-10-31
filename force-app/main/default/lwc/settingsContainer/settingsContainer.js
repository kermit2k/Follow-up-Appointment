import { LightningElement, api, wire } from 'lwc';
import ID_FIELD from '@salesforce/schema/ServiceAppointment.Id';
import WORK_TYPE_FIELD from '@salesforce/schema/ServiceAppointment.WorkTypeId';
import SCHED_END_FIELD from '@salesforce/schema/ServiceAppointment.SchedEndTime';
import SCHED_START_FIELD from '@salesforce/schema/ServiceAppointment.SchedStartTime';
import APPOINTMENT_NUMBER_FIELD from '@salesforce/schema/ServiceAppointment.AppointmentNumber';
import DURATION from '@salesforce/schema/ServiceAppointment.Duration';
//import getUserInfo from '@salesforce/apex/UserDetails.getUserInfo';
import Id from '@salesforce/user/Id';

export default class SettingsContainer extends LightningElement {
    title="Hello Settings LWC"

    //@api serviceAppointmentId;
    userId = Id;
    @api operatingHoursId = "0OH7e000000Cj5iGAC";
    @api schedulingPolicyId ="a0Z7e00000MImdzEAD";
    @api arrivalWindowMethod = "Arrival Windows";
    @api schedulingHorizonUnit = "Days";
    @api sechedulingHorizonValue = "20";
    enableAssignTo;
    @api enableAssignToMe;
    @api enableAssignToEveryAvailable;
    @api showExactArrivalTime =  false;
    recommendedScore = 80;
    useDefaultFields = true;
    currentAppointmentDefaultFieldNames = [
        ID_FIELD,
        WORK_TYPE_FIELD,
        SCHED_END_FIELD,
        SCHED_START_FIELD,
        APPOINTMENT_NUMBER_FIELD,
        DURATION
        ];

    _serviceAppointmentId;

    @api set recordId(recordId) {
        if (recordId !== this._serviceAppointmentId) {
            this._serviceAppointmentId = recordId;
        }
    }

    get recordId() {
        return this._serviceAppointmentId;
    }

    connectedCallback(){
        
        this.enableAssignToMe = true;
        this.enableAssignToEveryAvailable = false;
    }


    /*@wire(getUserInfo, { userId: Id }) 
    userDetails({error, data}) {
        if (data) {
            console.log("USer Id:::" + JSON.stringify(data));
        } else if (error) {
            this.error = error ;
        }
    }*/

    
}