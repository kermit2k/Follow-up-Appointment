import { LightningElement,  api, wire, track } from 'lwc';

import { getRecord } from 'lightning/uiRecordApi';
import getServiceAppointment from '@salesforce/apex/AppointmentController.getServiceAppointment';
import updateAppointmentStatus from '@salesforce/apex/AppointmentController.updateServiceAppointmentStatus';
import getSlots from '@salesforce/apex/AppointmentController.getSlots';
import updateSA from '@salesforce/apex/AppointmentController.updateSA';
import scheduleSA from '@salesforce/apex/AppointmentController.scheduleSA';
import updateSASlot from '@salesforce/apex/AppointmentController.updateSASlot';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import customLabels from './labels';
import { CloseActionScreenEvent } from 'lightning/actions';
import {calculateMaxValidHorizonDate} from 'c/utils';

export default class SchedulingContainer extends LightningElement {
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
    @api noOfDaysBeforeAfterWeek;
    @api showExactArrivalTime;
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

    onDateSelected(event) {
        this.selectedDate = event.detail.date;
        console.log('Selected date in main class : '+this.selectedDate);
        var staticElement = this.template.querySelector('[data-id="calendar"]');
        var top  = staticElement.getBoundingClientRect().top
        console.log("The element is : "+top);
        const returnValue = this.template.querySelector('c-slots-container').onPositionUpdated(top);
    }

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

    handleConfirm() {
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
    }

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

}