import { LightningElement, api } from 'lwc';

export default class CalendarContainer extends LightningElement {
    showCalendarFullPage;
    showModal = 1;
    @api get maxValidCalendarDate(){
        return this._maxValidCalendarDate;
    }

    set maxValidCalendarDate(value){
        
        this._maxValidCalendarDate = value;
    }

    renderedCallback(){
        this.showCalendarFullPage = false;
        console.log("maxValidCalendarDate::: rendered" + this.maxValidCalendarDate);
    }


}