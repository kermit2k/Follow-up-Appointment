import { LightningElement, api } from 'lwc';

export default class SettingsContainer extends LightningElement {
    title="Hello Settings LWC"

    //@api serviceAppointmentId;
    @api operatingHoursId = [string];
    @api schedulingPolicyId =[string];
    @api arrivalWindowMethod = [string];
    @api schedulingHorizonUnit = [string];
    @api sechedulingHorizonValue = [int];
    @api enableAssignToMe = [boolean];
    @api enableAssignToEveryone = [boolean];

    _recordId;

    @api set recordId(recordId) {
        if (recordId !== this._recordId) {
            this._recordId = recordId;
        }
    }

    get recordId() {
        return this._recordId;
    }
}