import { LightningElement, api, track } from 'lwc';
import customLabels from './labels';
import {formatAppointmentFromHToH} from 'c/utils';

export default class CompactAppointmentInfo extends LightningElement {
    LABELS = customLabels;
    serviceAppointmentObjectFieldsList;
    _serviceAppointmentObject;
    //TODO: loader
    //Todo: performance?
    //Todo: logs
    @api showDefaultFields;
    @api showCustomFields;

    connectedCallback(){
        this.showCustomFields = false;
    }

    @api
    get appointmentNumber(){
       return this.serviceAppointmentObject && this.serviceAppointmentObject['AppointmentNumber'].value;
    }
    
    @api
    get appointmentDateTime(){
        return this.serviceAppointmentObject && formatAppointmentFromHToH(this.serviceAppointmentObject['SchedStartTime'].value);
    }

    @api
    get appointmentWorkType(){
        return this.serviceAppointmentObject && this.serviceAppointmentObject['WorkTypeId'].value;
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

    


}