import { LightningElement, api } from 'lwc';
import ID_FIELD from '@salesforce/schema/ServiceAppointment.Id';
import WORK_TYPE_FIELD from '@salesforce/schema/ServiceAppointment.WorkTypeId';
import SCHED_END_FIELD from '@salesforce/schema/ServiceAppointment.SchedEndTime';
import SCHED_START_FIELD from '@salesforce/schema/ServiceAppointment.SchedStartTime';
import APPOINTMENT_NUMBER_FIELD from '@salesforce/schema/ServiceAppointment.AppointmentNumber';
import DURATION from '@salesforce/schema/ServiceAppointment.Duration';



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
}