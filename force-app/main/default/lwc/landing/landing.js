import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getServiceAppointment from '@salesforce/apex/AppointmentController.getServiceAppointment';
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
    previousServiceAppointmentId;
    @track currentAppointmentData;
    @api appointmentFields;
    @api useDefaultFields;
    _showModal = 0;

    @api
    get showModal() {
        return this._showModal;
    }

    set showModal(value) {
       this._showModal = value;
    }

    constructor() {
        super();
        this.template.addEventListener('closemodal', this.closeModal);
        this.template.addEventListener('openmodal', this.openModal);

    }

    connectedCallback(){
        console.log("connected before assignment new Service appointment:" + this.serviceAppointmentId + ", previous: " + this._previousServiceAppointmentId);
        this._previousServiceAppointmentId = this.serviceAppointmentId;
        console.log("connected after assignment new Service appointment:" + this.serviceAppointmentId + ", previous: " + this._previousServiceAppointmentId);

        this.getInitData();
    }

    renderedCallback(){
        console.log("rendered new Service appointment:" + this.serviceAppointmentId + ", previous: " + this._previousServiceAppointmentId);

        if(this._previousServiceAppointmentId != this.serviceAppointmentId){

            console.log("getting new Service appointment:" + this.serviceAppointmentId + ", previous: " + this._previousServiceAppointmentId);

            this.getInitData();
        }
    }

    getFieldsFromApex(){
        
        let fields = this.appointmentFields.map((fieldObj)=>{
            return fieldObj.fieldApiName;
        });
        console.log("getFields:::: " + JSON.stringify(fields));

    }

    /*@wire(getRecord, { recordId: '$serviceAppointmentId', fields: '$appointmentFields' })
    wiredSa({ error, data }) {
        if (data) {
            this.currentAppointmentData = this.createSAObject(data);
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }*/

    //Add types??

    getInitData(){

        getServiceAppointment({serviceAppointmentId: this.serviceAppointmentId})
            .then((data)=>{
                if(data.error){
                    this.error = data.error;
                }
                else{
                    this.currentAppointmentData = data;
                    this.error = undefined;
                }
            })
    }

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

    testModal(){
        console.log("action button clocked!!!");
    }

    openModal(event){
        event.preventDefault();
        this.showModal = 1;
    }

    closeModal(event){
        event.preventDefault();
        this.showModal = 0;
    };



}