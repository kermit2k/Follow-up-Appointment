import { LightningElement, api } from 'lwc';

export default class CalendarCompactView extends LightningElement {
    @api weekview
    @api ready;
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
}