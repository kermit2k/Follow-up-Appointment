import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getServiceAppointment from '@salesforce/apex/AppointmentController.getServiceAppointment';
import updateAppointmentStatus from '@salesforce/apex/AppointmentController.updateServiceAppointmentStatus';
import getSlots from '@salesforce/apex/AppointmentController.getSlots';
import getSlotsByAssignmentMethod from '@salesforce/apex/AppointmentController.getSlotsByAssignmentMethod';
import updateSA from '@salesforce/apex/AppointmentController.updateSA';
import scheduleSA from '@salesforce/apex/AppointmentController.scheduleSA';
import updateSASlot from '@salesforce/apex/AppointmentController.updateSASlot';
import customLabels from './labels';
import { CloseActionScreenEvent } from 'lightning/actions';
import {calculateMaxValidHorizonDate, formatAppointmentDateandHourRange} from 'c/utils';

//SA Field names
//WorkTypeId.	Name
//dates SchedStartTime, SchedEndTime, 	
//	AppointmentNumber

const assignmentMethod = {
    ASSIGN_TO_ME: "assignToMe",
    ASSIGN_TO_ANY_AVIALABLE: "assignToAnyAvailable"
}


export default class Landing extends LightningElement {
    LABELS = customLabels;
    title = this.LABELS.Reschedule_Appointment_page_title;
    @api serviceAppointmentId;
    previousServiceAppointmentId;
    @track currentAppointmentData;
    @api appointmentFields;
    @api useDefaultFields;
    @api schedulingHorizonUnit;
    @api sechedulingHorizonValue;
    @api schedulingPolicyId;
    @api showExactArrivalTime;
    @api operatingHoursId;
    _showModal = 0;
    @track selectedDate;
    @api recommendedScore;
    @api userId;
    @api get maxValidCalendarDate(){
        return this._maxValidCalendarDate;
    };

    set maxValidCalendarDate(value){
        this._maxValidCalendarDate = value;
    }

    @api
    get showModal() {
        return this._showModal;
    }

    set showModal(value) {
       this._showModal = value;
    }

    @api
    get currentAssignmentMethod(){
        return this._currentAssignmentMethod;
    }

    set currentAssignmentMethod(value){
        this._currentAssignmentMethod = value;
    }

    @api enableAssignToMe;
    @api enableAssignToEveryAvailable;

    //proprs from rebooking main
    serviceTerritoryTimeZone;
    currentSAstatus;
    OriginalArrivalEndDate;
    OriginalArrivalStartDate = null;
    OriginalArrivalEndDate = null;
    dateArrayForQuery = [];
    //@api serviceAppointmentObject;
    //@api serviceResourceObject;
    @api timeSlotDateWise;
    timeSlotWiseTemp=[];
    selectedSlotStringForToast = "";

    //Toast
    @track showToast = false;
    toastVariant = "success";
    toastTitle = "";
    toastMessage = "";

    

    ARRIVAL_TIME_TEXT = "Exact Appointment Times";
    ARRIVAL_WINDOW_TEXT = "Arrival Windows";

    BTN_CANCEL_PRESSED = "Cancelled";
    BTN_CONFIRMED_PRESSED = "Confirmed";
    BTN_RESHEDULED_PRESSED = "Rescheduled";

    SCHEDULING_UNIT_DAY = "Days";
    SCHEDULING_UNIT_WEEK = "Weeks";
    SCHEDULING_UNIT_MONTH = "Months";

    constructor() {
        super();
        this.template.addEventListener('closemodal', this.closeModal);
        this.template.addEventListener('openmodal', this.openModal);       

    }

    connectedCallback(){
        console.log("connected before assignment new Service appointment:" + this.serviceAppointmentId + ", previous: " + this._previousServiceAppointmentId);
        this._previousServiceAppointmentId = this.serviceAppointmentId;
        console.log("connected after assignment new Service appointment:" + this.serviceAppointmentId + ", previous: " + this._previousServiceAppointmentId);
        this.calcAssignmentMethod();
        this.dataLoaded = false;
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

    calcAssignmentMethod(){
        if(this.enableAssignToMe && this.enableAssignToEveryAvailable){
            this._currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ME;
            this.isCleanupRequired = true;
        }
        else if(!this.enableAssignToMe){
            this._currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ANY_AVIALABLE;
            this.isCleanupRequired = false;
        }
        else{
            this._currentAssignmentMethod = assignmentMethod.ASSIGN_TO_ME;
            this.isCleanupRequired = false;
        }
           
    }
    getInitData(){
        this.dataLoaded = false;
        getServiceAppointment({serviceAppointmentId: this.serviceAppointmentId})
            .then((data)=>{
                console.log('init data ::: ' + JSON.stringify(data));
                if(data.error){
                    this.error = data.error;
                }
                else{
                    let firstDateOfWeek;
                    this.currentAppointmentData = data;
                    //this.maxValidCalendarDate = calculateMaxValidHorizonDate(this.sechedulingHorizonValue, this.schedulingHorizonUnit, data['DueDate']);
                    this.error = undefined;
                    this.serviceTerritoryTimeZone = data.ServiceTerritoryTimeZone;
                    this.currentSAstatus = data.ServiceAppointmentStatus;
                    if(data.ArrivalWindowEndTime && data.ArrivalWindowEndTime !== 'null') {
                        this.OriginalArrivalEndDate = this.convertDateUTCtoLocal(data.ArrivalWindowEndTime);
                    }
                    if(data.ArrivalWindowStartTime && data.ArrivalWindowStartTime !== 'null') {
                        this.OriginalArrivalStartDate = this.convertDateUTCtoLocal(data.ArrivalWindowStartTime);
                    }
                    this.OriginalEarliestStartDate = this.convertDateUTCtoLocal(data.EarliestStartTime);

                    this.checkServiceAppointmentStatus(this.currentSAstatus);
                    this.serviceAppointmentDueDate = this.convertDateUTCtoLocal(data.DueDate);
                    this.maxValidCalendarDate = this.calculateMaxValidHorizonDate();
                    if(data.EarliestStartTime) {
                        this.minValidCalendarDate = this.convertDateUTCtoLocal(data.EarliestStartTime.toString());
                    } else {
                        this.minValidCalendarDate = this.getDateWithoutTime(new Date());
                    }
                    //this.selectedDate = new Date();
                    //firstDateOfWeek = this.getFirstDayOfWeek(this.selectedDate,0);
                    //this.handleGetSlotQueryForSelectedDateRange(firstDateOfWeek);
                    this.dataLoaded = true;
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


    onCustomEventCalled(event) {
        /*switch (event.detail.name) {
            case 'trigergetslotapi': {
                this.runApexQueryToChangeEarlistStartDate(event.detail.value);
                break;
            }
            case 'updateNonAvailableDates': {
                this.nonAvailableDateArray = event.detail.value;
                console.log("Array of the date not available : "+ this.nonAvailableDateArray.length);
                break;
            }
            default: {
            }
        }*/
        console.log("customEvent"); 
    }

   
    checkServiceAppointmentStatus(currentSAStatus) {
        console.log("checkServiceAppointmentStatus => Current:"+currentSAStatus+" ; confirmed:"+this.confirmStatusId+" ; rescheduled:"+this.rescheduleStatusId +"  ;  canceled : "+this.cancelStatusId);
        if(currentSAStatus === this.cancelStatusId) {
            this.showCancelScreen(true);
        } else if(currentSAStatus === this.confirmStatusId) {
            this.isAppointmentConfirmed = true;
        } else {
            this.isAppointmentConfirmed = false;
        }
        if(!this.allowToConfirmAppt) {
            this.isAppointmentConfirmed = true;
        }
    }

    showCancelScreen(value) {
        this.show_cancelScreen = value;
        this.show_RescheduleAppointmentScreen = !value;
        this.show_ConfirmAppointmentScreen = !value;
    }

    showConfirmScreen(value) {
        this.show_cancelScreen = !value;
        this.show_RescheduleAppointmentScreen = !value;
        this.show_ConfirmAppointmentScreen = value;
    }
    showRescheduleScreen(value) {
        this.show_cancelScreen = !value;
        this.show_RescheduleAppointmentScreen = value;
        this.show_ConfirmAppointmentScreen = !value;
    }

    calculateMaxValidHorizonDate() {
        if(this.sechedulingHorizonValue && this.selectedHorizonUnit) {
            var currentDate = new Date();
            var targetDate;
            switch(this.selectedHorizonUnit) {
                case this.SCHEDULING_UNIT_WEEK:
                    targetDate = new Date(currentDate.setDate(currentDate.getDate() + this.sechedulingHorizonValue*7));
                break;
                case this.SCHEDULING_UNIT_MONTH:
                    targetDate = new Date(currentDate.setMonth(currentDate.getMonth() + this.sechedulingHorizonValue));
                break;
                default: //this.SCHEDULING_UNIT_DAY
                    targetDate = new Date(currentDate.setDate(currentDate.getDate() + this.sechedulingHorizonValue));
            }
            // if(this.selectedHorizonUnit == this.SCHEDULING_UNIT_DAY) {
            //     targetDate = new Date(currentDate.setDate(currentDate.getDate() + this.sechedulingHorizonValue));
            // } else {
            //     targetDate = new Date(currentDate.setMonth(currentDate.getMonth() + this.sechedulingHorizonValue));  
            // }
            console.log("Scheduling horizon unit : new date is  : "+targetDate);
            if(this.serviceAppointmentDueDate < targetDate) 
                return this.serviceAppointmentDueDate;
            else
                return targetDate;

        } else {
            return this.serviceAppointmentDueDate;
        }
    }

    getDateWithoutTime(date) {
        var d;
        if (typeof val === 'string') {
            d = new Date(date.replace(/-/g, "/"));   // replace method is use to support time in safari
        } else {
            d = new Date(date);
        }
        d.setHours(0, 0, 0, 0);
        return d;
    }

    onDateSelected(event) {
        this.selectedDate = event.detail.date;
        console.log('Selected date in main class : ' + this.selectedDate);
    }

    getFirstDayOfWeek(date, index) {
        var start = index >= 0 ? index : 0;
        var d = new Date(date);
        var day = d.getDay();
        var diff = d.getDate() - day + (start > day ? start - 7 : start);
        d.setDate(diff);
        console.log('First day of week is : ' + d.getDate());
        var newDate = new Date(d.setDate(d.getDate() - this.noOfDaysBeforeAfterWeek)).setHours(0,0,0,0);
        return newDate;
    };

    getLastDayOfWeek(date, index) {
        var start = index >= 0 ? index : 0;
        var d = new Date(date);
        var day = d.getDay();
        var diff = d.getDate() - day + (start > day ? start - 1 : 6 + start);
        d.setDate(diff);
        var newDate = new Date(d.setDate(d.getDate() + this.noOfDaysBeforeAfterWeek)).setHours(0,0,0,0);
        return newDate;
    };

    isInArray(array, value) {
        for (var i = 0; i < array.length; i++) {
            if (value.getTime() == array[i].getTime()) {
                return true;
            }
        }
        return false;
    }

    revertSA() {
        updateSA({serviceAppointmentId: this.serviceAppointmentId, earliestStartDate: this.OriginalEarliestStartDate,
                        arrivalStartDate: this.OriginalArrivalStartDate, arrivalEndDate: this.OriginalArrivalEndDate})
        .then((data) => {
            if(data.success) {
                console.log('Service appointment reverted successfully');
            }
            else
                console.log('Error while reverting the service appointment');
        }).catch( error => {
            console.log('Error while reverting the service appointment '+error);
        })
    }

    getLastSlotFromTheArray(slotArray) {
        var lastdate;
        if(slotArray.length > 0) {
            var timeSlot = slotArray[slotArray.length - 1].split('#');
            lastdate = this.getDateWithoutTime(Date.parse(timeSlot[0].replace(/-/g, '/')));
            console.log("Last Date from the slots is : "+lastdate);
        }
        return lastdate;
    }


    addDatesToCashArray(start, end) {
        var currentDate = start; 
        while (currentDate <= end) { 
            var addingDate = new Date(currentDate);
            this.dateArrayForQuery.push(addingDate);  
            var tempDate = currentDate.setDate(currentDate.getDate() + 1);
            currentDate = new Date(tempDate);  
        } 
        this.dateArrayForQuery = Array.from(new Set(this.dateArrayForQuery));
    }

    showAlertWithError(errorMessage) {
        alert(errorMessage);
    }

    handleGetSlotQueryForSelectedDate(event) {
        var firstDateOfWeek = this.getFirstDayOfWeek(event.detail.selectedDate);
        if(this.dataLoaded){
            this.handleGetSlotQueryForSelectedDateRange(firstDateOfWeek);
        }
        
    }

    handleGetSlotQueryForSelectedDateRange(selectedDate) {
        this.startWith = performance.now();
        console.log("this.startWith" + this.startWith);
        var firstDateOfWeek = selectedDate;
        if(firstDateOfWeek <= new Date()) {
            firstDateOfWeek = new Date();
        }
        var lastDateOfWeek = this.getLastDayOfWeek(firstDateOfWeek, 0);
        if(lastDateOfWeek > this.maxValidCalendarDate) {
            lastDateOfWeek = this.maxValidCalendarDate;
        }
        console.log("First and Last date of the week : "+firstDateOfWeek + "      "+lastDateOfWeek);
        
        var loopdate = new Date(firstDateOfWeek);
        loopdate = new Date(this.getDateWithoutTime(loopdate));
        console.log("Date in the Array is : "+loopdate);
        console.log("this.dateArrayForQuery.indexOf(loopdate) + : "+loopdate+ "   and  "+this.isInArray(this.dateArrayForQuery, loopdate ))
        
        if(!this.isInArray(this.dateArrayForQuery, loopdate )) {

            //If the date is not added in cache, run the below code to add it and get fresh slots
            this.addDatesToCashArray(new Date(loopdate),new Date(loopdate));

            console.log("getSlot As Per StartDate :  "+loopdate +" Minvalid Calendar date : "+this.minValidCalendarDate);
            if(loopdate < this.minValidCalendarDate)
                loopdate = this.minValidCalendarDate;

            if(loopdate >= this.minValidCalendarDate) {
                
                console.log("Run appointment query for  date "+loopdate);

                
                updateSA({serviceAppointmentId: this.serviceAppointmentId, earliestStartDate: loopdate,
                    arrivalStartDate: null, arrivalEndDate: null })
                .then((saData) => {
                    if(saData.success) {
                    
                        //console.log("Run appointment query for  date "+loopdate);

                        getSlotsByAssignmentMethod({serviceAppointmentId: this.serviceAppointmentId,
                            operatingHoursId: this.operatingHoursId,
                            schedulingPolicyId: this.schedulingPolicyId,
                            arrivalWindowFlag: this.showExactArrivalTime, 
                            userId: this.userId, 
                            currentAssignmentMethod: this.currentAssignmentMethod,
                            cleanupRequired: this.isCleanupRequired })
                        .then((data) => {

                            this.revertSA();
                            
                            if(data.error) {
                                console.log('Error in getting slots : '+data.error);
                                this.showAlertWithError(this.LABELS.AppointmentAssistance_confirmation_failure_message);
                                this.timeSlotDateWise = [];
                            } else {
                                this.timeSlotWiseTemp = data.timeSlotList;
                                this.timeSlotDateWise = this.timeSlotWiseTemp;
                                var lastDateOfSlot = this.getLastSlotFromTheArray(this.timeSlotWiseTemp);
                                
                                // if last date of the slot is not null
            
                                //Erez - I think you can avoid the if/else and do lastDateOfSlot != null?lastDateOfSlot:lastDateOfWeek+1
                                if(lastDateOfSlot) {
                                    console.log("Date in the Array is : last date is  "+lastDateOfSlot);
                                    this.addDatesToCashArray(new Date(loopdate), new Date(lastDateOfSlot));
                                    if(lastDateOfSlot >= lastDateOfWeek) {
                
                                        this.showDataSpinner = false;
                                        this.timeSlotDateWise = this.timeSlotWiseTemp;
                                        
                                    } else {
            
                                        if(loopdate < lastDateOfSlot) {
                                            loopdate = lastDateOfSlot;
                                        } 
                                        var tempDate = loopdate.setDate(loopdate.getDate() + 1);
                                        loopdate = new Date(tempDate);
            
                                        if(loopdate <= lastDateOfWeek) {
                                            this.handleGetSlotQueryForSelectedDateRange(loopdate);
                                        } else {
                                            this.showDataSpinner = false;
                                            this.timeSlotDateWise = this.timeSlotWiseTemp;
                                        }
                                    }
                                } else {            
                                    // if last date of the slot is null, increase the date to one and run the query for next date
                                    var tempDate = loopdate.setDate(loopdate.getDate() + 1);
                                    loopdate = new Date(tempDate);
                                    if(loopdate <= lastDateOfWeek) {
                                        this.handleGetSlotQueryForSelectedDateRange(loopdate);
                                    } else {
                                        this.timeSlotDateWise = this.timeSlotWiseTemp;
                                        this.showDataSpinner = false;
                                    }

                                }
                                this.endWith = performance.now();
                                console.log("this.endWith" + this.endWith);
                            }
                        }).catch(error=>{
                            // delete SA/WO incase transaction fails
                            this.revertSA();
                            this.showDataSpinner = false;
                            console.log('getSlotAsPerStartDate errror is :', + error);
                            this.timeSlotDateWise = [];
                            this.showDataSpinner = false;
                        })
                    }
                    if(saData.error) {
                        this.showDataSpinner = false;
                        console.log('getSlotAsPerStartDate errror is :', + error);
                        this.timeSlotDateWise = [];
                    }

                }).catch(error => {
                    this.showDataSpinner = false;
                    console.log('getSlotAsPerStartDate errror is :', + error);
                    this.timeSlotDateWise = [];
                    this.showDataSpinner = false;
                })


            } else {
                // IF THE DATE IS BEFORE ARRIVAL WINDOW START DATE
                var tempDate = loopdate.setDate(loopdate.getDate() + 1);
                loopdate = new Date(tempDate);
                if(loopdate <= lastDateOfWeek) {
                    this.handleGetSlotQueryForSelectedDateRange(loopdate);
                } else {
                    this.timeSlotDateWise = this.timeSlotWiseTemp;
                    this.showDataSpinner = false;
                }
            }
            
        } else {
            // If the date are already cache, take the slot from it and run the query for next date;
            var tempDate = loopdate.setDate(loopdate.getDate() + 1);
            loopdate = new Date(tempDate);

            if(loopdate <= lastDateOfWeek) {
                this.handleGetSlotQueryForSelectedDateRange(loopdate);
            } else {
                this.timeSlotDateWise = [];
            }

        }
    }

    onServiceAppointmentUpdate(event) {
        let selectedSlotStart = event.detail.selectedSlotStart;
        let selectedSlotEnd = event.detail.selectedSlotEnd;
        this.selectedSlotStringForToast = formatAppointmentDateandHourRange(selectedSlotStart, selectedSlotEnd);
        let ArrivalWindowStartTime = event.detail.ArrivalWindowStartTime
        if(this.isValidDate(selectedSlotStart) && this.isValidDate(selectedSlotEnd)) {
            if(!(ArrivalWindowStartTime) || ArrivalWindowStartTime === "null") {
                ArrivalWindowStartTime = "1970-01-01 09:00:00"; //Overwrites null ArrivalWindowStart field
            } 
            if(selectedSlotStart.getTime() !== this.convertDateUTCtoLocal(ArrivalWindowStartTime).getTime()) {
                this.showSpinnerInChildClass = true;
                console.log('this.selectedSlotStart='+selectedSlotStart)
                console.log('this.selectedSlotEnd='+selectedSlotEnd)
                updateSASlot({serviceAppointmentId: this.serviceAppointmentId, arrivalWindowStartTime: selectedSlotStart, arrivalWindowEndTime: selectedSlotEnd})
                .then((data) => {
                    if(data.error) {
                        this.showSpinnerInChildClass = false;
                        this.showToast = true;
                        this.toastVariant = "warning";
                        this.toastTitle = this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message;
                        /*const toastEventError = new ShowToastEvent({
                            title: this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                            variant: "warning"
                        });
                        this.dispatchEvent(toastEventError);*/
                        console.log(this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message +"  "+ data.error);
                    } else {
                        // If the transaction Success, run the FSL schedule service
                        scheduleSA({serviceAppointmentId: this.serviceAppointmentId, schedulePolicy: this.schedulingPolicyId})
                        .then((data) => {
                            if(data.error) {
                                this.revertSA();
                                this.showSpinnerInChildClass = false;
                                this.showToast = true;
                                this.toastVariant = "warning";
                                this.toastTitle = this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message;
                                /*const toastEventError = new ShowToastEvent({
                                    title: this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                                    variant: "warning"
                                });
                                this.dispatchEvent(toastEventError);*/
                                console.log("Error while executing FSL API : " +"  "+ data.error);
                            } else {
                                console.log('Service appointment Scheduled : '+data);
                                //this.handleButtonClickEvent('rescheduleSAsuccess');
                                this.executeRescheduleAppointmentQuery();   
                                console.log("Appointment reschedule sucessfully");
                                //window.location.reload();
                            }

                        }).catch(error => {
                            this.revertSA();
                            this.showSpinnerInChildClass = false;
                            //TODO: add the labels
                            this.showToast = true;
                            this.toastVariant = "warning";
                            this.toastTitle = this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message;
                            /*const toastEventError = new ShowToastEvent({
                                title: this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                                variant: "warning"
                            });
                            this.dispatchEvent(toastEventError);*/
                            console.log( "Error while executing FSL API : " +"  "+ error);
                        })
                    }
                    
                }).catch(error => {
                    this.showSpinnerInChildClass = false;
                    this.showToast = true;
                    this.toastVariant = "warning";
                    this.toastTitle = this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message;
                    /*const toastEventError = new ShowToastEvent({
                        title: this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                        variant: "warning"
                    });
                    this.dispatchEvent(toastEventError);*/
                    console.log(this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message +"  "+ error);
                })
            } else {
                this.showSpinnerInChildClass = false;
                this.showToast = true;
                this.toastVariant = "warning";
                this.toastTitle = this.LABELS.Appointment_ReBooking_same_appointment_selected_warning;
                /*const toastEvent = new ShowToastEvent({
                    title: this.LABELS.Appointment_ReBooking_same_appointment_selected_warning,
                    variant: "warning"
                });
                this.dispatchEvent(toastEvent);*/
            }
            
        } else {
            console.log("Invalid date time ");
        }
        
    }
    
    isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    
    executeRescheduleAppointmentQuery() {
        this.showSpinnerInChildClass = true;
        updateAppointmentStatus({
            serviceAppointmentId: this.serviceAppointmentId, statusId: this.rescheduleStatusId
        }).then((data) => {
            if (data.success) {
                this.showToast = true;
                this.toastVariant = "success";
                this.toastTitle = this.LABELS.Appointment_ReBooking_toastMessage_appointment_reschedule;
                this.toastMessage = this.selectedSlotStringForToast;
                /*const toastEvent = new ShowToastEvent({
                    title: this.LABELS.Appointment_ReBooking_toastMessage_appointment_reschedule,
                    message: this.selectedSlotStringForToast,
                    variant: "success"
                });
                this.dispatchEvent(toastEvent);*/
                this.isAppointmentConfirmed = true;
            } else if(data.urlExpired) {
                console.log('invalidURL #9:');
                this.show_InvalidURLpage();  
            } else {
                if(data.error) {
                    this.showToast = true;
                    this.toastVariant = "warning";
                    this.toastTitle = this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message;
                    /*const toastEventError = new ShowToastEvent({
                        title: this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message,
                        variant: "warning"
                    });
                    this.dispatchEvent(toastEventError);*/
                    console.log(this.LABELS.Appointment_ReBooking_toastMessage_reschedule_appointment_fail_message +"  "+ data.error);
                }
            }
            this.showSpinnerInChildClass = false;
        })
    }
    /************************************************************************* */
    //from reschdule main

    guestToken;
    schedulePolicyId;
    LABELS = customLabels;
    CustomerFirstName;
    CustomerLastName;
    CustomerPhone;
    ServiceAppointmentStatus;
    CustomerAddress;
    WorkTypeName;
    ArrivalWindowStartTime;
    ArrivalWindowEndTime;
    SchedStartTime;
    SchedEndTime;
    ServiceAppointmentDueDate;
    ServiceAppointmentDescription;
    ServiceResourceId;
    ServiceResourceRole;
    ServiceResourceName;
    serviceAppointmentObject;
    @api timeSlotObject;
    @track selectedDate;
    @track isSlots = true;
    @track showCalenderInFullScreen = false;
    headlineDate;
    headlineTime;
    selectedSlotStart;
    selectedSlotEnd;
    showDataSpinner = false;
    inFlowMode = false;
    newAppointmentDate;
    newAppointmentTime;
    maxValidCalendarDate;
    minValidCalendarDate;
    @api nonAvailableDateArray = [];
    @api noOfDaysBeforeAfterWeek=2;
    @api worktypeDisplayname;
    
    backButtonTitle = this.LABELS.Appointment_ReBooking_back_button_title;
    backButtonTitleNoSlot = this.LABELS.Appointment_ReBooking_back_button_title_no_slot;

    show_confirmBtnLayout = false;

    @api get serviceappointmentobject(){
        return this.serviceAppointmentObject;
    }
    set serviceappointmentobject(value){
        this.selectedDate = new Date();
        if(value){
            this.serviceAppointmentObject = value; 
            this.customerFirstName = value.CustomerFirstName;
            this.customerLastName = value.CustomerLastName;
            this.CustomerPhone = value.CustomerPhone;
            this.ServiceAppointmentStatus = value.ServiceAppointmentStatus;
            this.CustomerAddress = value.CustomerAddress;
            this.WorkTypeName = value.WorkTypeName;
            this.ArrivalWindowStartTime = value.ArrivalWindowStartTime;
            this.ArrivalWindowEndTime = value.ArrivalWindowEndTime;
            this.SchedStartTime = value.SchedStartTime;
            this.SchedEndTime = value.SchedEndTime;
            this.ServiceAppointmentDescription = value.ServiceAppointmentDescription;
            this.ServiceAppointmentDueDate = value.DueDate;
        }
        this.getHeadlineDate();
    }

    @api get serviceresourceobj(){
        return this.serviceAppointmentObject;
    }
    set serviceresourceobj(value){
        if(value){
            this.ServiceResourceId = value.ServiceResourceId;
            this.serviceResourceRole = value.ServiceResourceRole;
            this.ServiceResourceName = value.ServiceResourceName;
        }
    }

    @api get guesttoken(){
        return this.guestToken;
    }
    set guesttoken(value){
        if(value){
            this.guestToken = value;
        }
    }

    @api get schedulepolicy(){
        return this.schedulePolicyId;
    }
    set schedulepolicy(value){
        if(value){
            this.schedulePolicyId = value;
        }
    }

    @api get timeslotobject() {
        return this.timeSlotObject;
    }
    set timeslotobject(value) {
        this.showDataSpinner = false;
        if(value){
            this.timeSlotObject = value;  
        }
    }
    

    @api get showdataspinner() {
        return this.showDataSpinner;
    }
    set showdataspinner(value) {
        this.showDataSpinner = value;
    }

    @api get maxvaliddate() {
        return this.maxValidCalendarDate;
    }

    set maxvaliddate(value) {
        if(value) {
            this.maxValidCalendarDate = value;
        }
    }

    @api get shownoofdaysbeforeafterweek(){
        return this.noOfDaysBeforeAfterWeek;
    }
    set shownoofdaysbeforeafterweek(value){
        if(value){
            this.noOfDaysBeforeAfterWeek = value;
        }
    }

    @api get showexactarrivaltime() {
        return this.showExactArrivalTime;
    }
    set showexactarrivaltime(value) {
        this.showExactArrivalTime = value;
    }
    
    @api get inflowmode() {
        return this.inFlowMode;
    }
    set inflowmode(value) {
        this.inFlowMode = value;
    }

    @api get worktypename() {
        return this.WorkTypeName;
    }
    set worktypename(value) {
        this.WorkTypeName = value;
    }

    /*onDateSelected(event) {
        this.selectedDate = event.detail.date;
        console.log('Selected date in main class : '+this.selectedDate);
        var staticElement = this.template.querySelector('[data-id="calendar"]');
        var top  = staticElement.getBoundingClientRect().top
        console.log("The element is : "+top);
        const returnValue = this.template.querySelector('c-slots-container').onPositionUpdated(top);
    }*/

    onWeekChangeEvent(event) {
        this.selectedDate = event.detail.date;
        console.log("On week change called");
        const returnValue = this.template.querySelector('c-slots-container').onWeekUpdated(this.selectedDate);
        this.runApexQueryToChangeEarlistStartDate(this.selectedDate);
    }

    onSlotSelection(event) {
        this.selectedSlotStart = event.detail.startDate;
        this.selectedSlotEnd = event.detail.endDate;
        this.setNewAppointmentSelectedText(event.detail.startDate, event.detail.endDate);
    }

    onCustomEventCalled(event) {
        switch (event.detail.name) {
            case 'trigergetslotapi': {
                this.runApexQueryToChangeEarlistStartDate(event.detail.value);
                break;
            }
            case 'updateNonAvailableDates': {
                this.nonAvailableDateArray = event.detail.value;
                console.log("Array of the date not available : "+ this.nonAvailableDateArray.length);
                break;
            }
            default: {
            }
        }  
    }

    handleBackButton() {
        this.handleButtonClickEvent("showConfirmScreen");
    }
    // pass date to main/parent class
    handleButtonClickEvent(buttonEvent) {
        const customEvent = new CustomEvent('eventname', {
            detail:{ buttonName : buttonEvent } 
        });
       this.dispatchEvent(customEvent);
    }

    getHeadlineDate() { 
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        if (this.ArrivalWindowStartTime == 'null' || this.showExactArrivalTime) {
            var startDate = this.convertDateUTCtoLocal(this.SchedStartTime);
            var endDate = this.convertDateUTCtoLocal(this.SchedEndTime);    
        } else {
            var startDate = this.convertDateUTCtoLocal(this.ArrivalWindowStartTime);
            var endDate = this.convertDateUTCtoLocal(this.ArrivalWindowEndTime);    
        }
        if(startDate && endDate) {
            var dateLong = startDate.toLocaleDateString(undefined, dateOptions);
            var time = this.getFormattedTimeFromDate(startDate) + ' - '+this.getFormattedTimeFromDate(endDate);
            if(this.showExactArrivalTime) {
                time = this.getFormattedTimeFromDate(startDate);
            }
            this.headlineDate = dateLong;
            this.headlineTime = time;
        }
    }

    convertDateUTCtoLocal(date) {
        if(date && date !== 'null') {
          return new Date((date.replace(/ /g,"T") + '.000Z'));
        } else {
          return '';
        }
    }

    getFormattedTimeFromDate(date) { // method to format the time digits
        var tempDate = new Date(date);
        var hours = tempDate.getHours();
        var minutes = tempDate.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + " "+ampm;
    }

    /*handleConfirm() {
        // allow scrolling
        document.body.style.overflow = 'auto';
        const customEvent = new CustomEvent('serviceappointmentupdate', {
            detail:{selectedSlotStart : this.selectedSlotStart,
                    selectedSlotEnd : this.selectedSlotEnd,
                    ArrivalWindowStartTime : this.ArrivalWindowStartTime,
                    schedulePolicyId : this.schedulePolicyId
            }
        });
        this.dispatchEvent(customEvent);
    }*/

    runApexQueryToChangeEarlistStartDate(selectedDate) {
        this.showDataSpinner = true;
        const customEvent = new CustomEvent('getslotexecuted', {
            detail:{ selectedDate : selectedDate } 
        });
       this.dispatchEvent(customEvent);
    }

    /**
     * SAVE ALL VALUES AFTER SELECTING THE SLOT
     */
    position;
    setNewAppointmentSelectedText(start, end) {

        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        var dateLong = start.toLocaleDateString(undefined, dateOptions);
        var time = this.getFormattedTimeFromDate(start) + ' - '+this.getFormattedTimeFromDate(end);
        if(this.showExactArrivalTime) {
            time = this.getFormattedTimeFromDate(start);
        }
        this.newAppointmentDate = dateLong;
        this.newAppointmentTime = time;
        this.show_confirmBtnLayout = true;
        // lock scrolling
        document.body.style.overflow = 'hidden';
    }

    handleConfirmBtnClose() {
        this.show_confirmBtnLayout = false;
        // allow scrolling
        document.body.style.overflow = 'auto';
    }

    onButtonClick(event) {
        this.buttonClickName = event.detail.buttonName;
        switch (this.buttonClickName) {
            case 'rescheduleEvent': {
                this.showRescheduleScreen(true);
                break;
            }
            case 'confirmEvent': {
                this.executeConfirmAppointmentQuery();
                break;
            }
            case 'showConfirmScreen': {
                this.dateArrayForQuery = [];
                this.showConfirmScreen(true);
                break;
            }
            case 'cancelAppointmentEvent' : {
                this.executeCancelAppointmentQuery();
                break;
            }
            case 'rescheduleSAsuccess' : {
                this.executeRescheduleAppointmentQuery();   
                console.log("Appointment reschedule sucessfully");
                window.location.reload();
                break;
            }
            case 'showPageExpired' : {
                this.show_InvalidURLpage();
                break;
            }
            case 'onMonthViewSelected' : {
                this.dateArrayForQuery = [];
                break;
            }
            default: {

            }
        }
    }
}
