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
    @api operatingHoursId = "0OH7e000000Cj5iGAC";
    @api schedulingPolicyId ="a0Z7e00000MImdzEAD";
    @api arrivalWindowMethod = "Arrival Windows";
    @api schedulingHorizonUnit = "Days";
    @api sechedulingHorizonValue = "20";
    @api enableAssignToMe;
    @api enableAssignToEveryone;
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
        this._serviceAppointmentId = "08p7e000000CxXIAA0"
        /*if (recordId !== this._serviceAppointmentId) {
            this._serviceAppointmentId = recordId;
        }*/
    }

    get recordId() {
        return this._serviceAppointmentId;
    }
}