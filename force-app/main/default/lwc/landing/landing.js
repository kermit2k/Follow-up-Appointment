import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getServiceAppointmentByFieldsList from '@salesforce/apex/AppointmentController.getServiceAppointmentByFieldsList';
import customLabels from './labels';
import { CloseActionScreenEvent } from 'lightning/actions';

//SA Field names
//WorkTypeId.	Name
//dates SchedStartTime, SchedEndTime, 	
//	AppointmentNumber



export default class Landing extends LightningElement {
    LABELS = customLabels;
    title = this.LABELS.Reschedule_Appointment_page_title;
    @api serviceAppointmentId;
    @track currentAppointmentData;
    @api appointmentFields;
    @api useDefaultFields;

    getFieldsFromApex(){
        
        let fields = this.appointmentFields.map((fieldObj)=>{
            return fieldObj.fieldApiName;
        });
        console.log("getFields:::: " + JSON.stringify(fields));

        getServiceAppointmentByFieldsList({serviceAppointmentId: this.serviceAppointmentId, serviceAppointmnetFields: JSON.stringify(fields)})
        .then((data)=> {
            console.log("results from apex::: " + data);
        })
    }

    @wire(getRecord, { recordId: '$serviceAppointmentId', fields: '$appointmentFields' })
    wiredSa({ error, data }) {
        if (data) {
            this.currentAppointmentData = this.createSAObject(data);
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    //Add types??
    createSAObject(data){
        let appointmentFields = {}
        data.fields && Object.keys(data.fields).forEach((appointmentField)=> {
            appointmentFields[appointmentField] = {
                name: appointmentField,
                value: data.fields[appointmentField] && data.fields[appointmentField].value
            }
        })

        console.log('createSAObject::: '+ JSON.stringify(appointmentFields));
        return appointmentFields;
    }

}