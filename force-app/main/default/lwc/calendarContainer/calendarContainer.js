import { LightningElement, api, track } from 'lwc';

export default class CalendarContainer extends LightningElement {
    showCalendarFullPage;
    showModal = 1;
    @track selectedDate;
    @api get maxValidCalendarDate(){
        return this._maxValidCalendarDate;
    }

    set maxValidCalendarDate(value){
        
        this._maxValidCalendarDate = value;
    }

    @api get selecteddate() {
        return this.selectedDate;
    }
    set selecteddate(value) {
        if(value) {
            this.selectedDate = value;
            console.log('set selecteddate in calendar container : ' + this.selectedDate);
        } 
    } 

    renderedCallback(){
        this.showCalendarFullPage = false;
        console.log("maxValidCalendarDate::: rendered" + this.maxValidCalendarDate);
    }

}