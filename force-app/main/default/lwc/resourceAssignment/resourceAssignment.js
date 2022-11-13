import { LightningElement, api } from 'lwc';
import customLabels from './labels';

export default class ResourceAssignment extends LightningElement {
    LABELS = customLabels;
    value = 'ASSIGN_TO_ME';
    @api currentAssignmentMethod;
    @api userName="";
    resourceAssignmentTitle = this.LABELS.Appointment_ReBooking_Mobile_Worker_radio_title;
    @api selecteddate;
    @api isExcluded;
    @api excludedMsg = this.LABELS.Appointment_ReBooking_cant_select_Mobile_Worker_excluded;

    @api get showExcludedMsg(){
        return this.isExcluded;
    }

    
    

    get options() {
        return [
            { label: `${this.LABELS.Appointment_ReBooking_Mobile_Worker_radio_assignToMe_lable} (${this.userName})`, value: 'ASSIGN_TO_ME' },
            { label: this.LABELS.Appointment_ReBooking_Mobile_Worker_radio_assignToAnyAvailable_lable, value: 'ASSIGN_TO_ANY_AVIALABLE' },
        ];
    }

    handleAssignmentMethodChange(event){
        event.preventDefault();

        const assignmentMethodEvent = new CustomEvent('onassignmentmethodchanged', { 
            detail: {
                assignmentMethod: event.target.value,
                selecteddate: this.selecteddate

            },
            composed: true,
            bubbles: true
         });
        this.dispatchEvent(assignmentMethodEvent);

    }
}