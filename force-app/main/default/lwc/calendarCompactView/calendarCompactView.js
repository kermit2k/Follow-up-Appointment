import { LightningElement, api } from 'lwc';

export default class CalendarCompactView extends LightningElement {
    @api weekview
    @api ready;
    @api selectedDate;
    @api get maxValidCalendarDate(){
        return this._maxValidCalendarDate;
    }

    set maxValidCalendarDate(value){
        
        this._maxValidCalendarDate = value;
    }

    /*ondateselection = {onDateSelected}
    onweekchangeevent = {onWeekChangeEvent}
    selecteddate = {selectedDate} 
    nonavailabledates = {nonAvailableDateArray} */
    renderedCallback(){
        console.log("ffrom calendare compact view :::: " + this.maxValidCalendarDate);
    }
    
    @api get selecteddate() {
        return this.selectedDate;
    }
    set selecteddate(value) {
        if(value) {
            this.selectedDate = value;
        } 
    } 

    onDateSelected(event) {
        this.selectedDate = event.detail.date;
        console.log('Selected date in compact view : ' + this.selectedDate);
    }
}