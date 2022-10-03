import { LightningElement, api, track } from 'lwc';
import customLabels from './labels';
import {formatAppointmentDateandHourRange} from 'c/utils';

export default class CompactAppointmentInfo extends LightningElement {
    LABELS = customLabels;
    serviceAppointmentObjectFieldsList;
    _serviceAppointmentObject;
    //TODO: loader
    //Todo: performance?
    //Todo: logs
    @api showDefaultFields;
    @api showCustomFields;
    @api showModal;


   
        
    
    connectedCallback(){
        this.showCustomFields = false;

    }

    @api
    get appointmentNumber(){
       return this.serviceAppointmentObject && this.serviceAppointmentObject['AppointmentNumber'];
    }
    
    @api
    get appointmentDateTime(){
        let dateTimeStr;

        if(this.serviceAppointmentObject && this.serviceAppointmentObject['ArrivalWindowStartTime'] && this.serviceAppointmentObject['ArrivalWindowEndTime']){
            dateTimeStr = formatAppointmentDateandHourRange(this.serviceAppointmentObject['ArrivalWindowStartTime'], this.serviceAppointmentObject['ArrivalWindowEndTime']);
        }
        else if (this.serviceAppointmentObject && this.serviceAppointmentObject['SchedStartTime'] && this.serviceAppointmentObject['SchedEndTime']){
            dateTimeStr = formatAppointmentDateandHourRange(this.serviceAppointmentObject['SchedStartTime'], this.serviceAppointmentObject['SchedEndTime']);
        }

        else{
            dateTimeStr = "";
        }
        return dateTimeStr; 
    }

    @api
    get appointmentWorkType(){
        return this.serviceAppointmentObject && this.serviceAppointmentObject['WorkTypeName'];
    }

    @api 
    get appointmentArrivalStart(){
        return this.serviceAppointmentObject && this.serviceAppointmentObject['ArrivalWindowStartTime'];
    }

    @api 
    get appointmentArrivalEnd(){
        return this.serviceAppointmentObject && this.serviceAppointmentObject['ArrivalWindowEndTime'];
    }

    @api 
    get appointmentSchedStart(){
        return this.serviceAppointmentObject && this.serviceAppointmentObject['SchedStartTime'];
    }

    @api 
    get appointmentSchedEnd(){
        return this.serviceAppointmentObject && this.serviceAppointmentObject['SchedEndTime'];
    }


    @api
    get serviceAppointmentObject() {
        return this._serviceAppointmentObject;
    }

    set serviceAppointmentObject(value) {
        let updatedValue = value ? Object.values(value) : [];

        if (updatedValue && (updatedValue.length > 0) && (JSON.stringify(this.serviceAppointmentObjectFieldsList) !== JSON.stringify(updatedValue))) {
            this.serviceAppointmentObjectFieldsList = updatedValue;
            this._serviceAppointmentObject = value;
        }
    }

    openModal(event){
        event.preventDefault();

        console.log("dispatching open modal::: " + this.showModal);
        this.dispatchEvent(new CustomEvent('openmodal', {
            composed: true,
            bubbles: true
        }));

    }

  

    


}