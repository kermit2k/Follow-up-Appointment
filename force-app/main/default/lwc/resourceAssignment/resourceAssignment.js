import { LightningElement, api } from 'lwc';

export default class ResourceAssignment extends LightningElement {
    value = 'ASSIGN_TO_ME';
    @api currentAssignmentMethod;
    @api userName="";
    resourceAssignmentTitle ="Mobile Worker";
    @api selecteddate;

    get options() {
        return [
            { label: `You (${this.userName})`, value: 'ASSIGN_TO_ME' },
            { label: 'Any available worker', value: 'ASSIGN_TO_ANY_AVIALABLE' },
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