import { LightningElement, api } from 'lwc';

export default class SettingsContainer extends LightningElement {
    title="Hello Settings LWC"

    //@api serviceAppointmentId;
    @api operatingHoursId = "0OH630000000aTkGAI";
    @api schedulingPolicyId ="a0Z63000003rPoXEAU";
    @api arrivalWindowMethod = "Arrival Windows";
    @api schedulingHorizonUnit = "Days";
    @api sechedulingHorizonValue = "20";
    @api enableAssignToMe;
    @api enableAssignToEveryone;

    _serviceAppointmentId;

    @api set recordId(recordId) {
        if (recordId !== this._serviceAppointmentId) {
            this._serviceAppointmentId = recordId;
        }
    }

    get recordId() {
        return this._serviceAppointmentId;
    }
}