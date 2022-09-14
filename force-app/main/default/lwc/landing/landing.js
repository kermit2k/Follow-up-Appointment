import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import customLabels from './labels';
import { CloseActionScreenEvent } from 'lightning/actions';
import NAME_FIELD from '@salesforce/schema/ServiceAppointment.Subject';


export default class Landing extends LightningElement {
    LABELS = customLabels;
    title = this.LABELS.Reschedule_Appointment_page_title;
    @api serviceAppointmentId;
    @api currentAppointmentData;
    @api fieldNames =[NAME_FIELD];
    fields=[NAME_FIELD];

    @wire(getRecord, { recordId: '$serviceAppointmentId', fields: '$this.fieldNames' })
    wiredSa({ error, data }) {
        if (data) {
            this.currentAppointmentData = data[0];
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
     }
}