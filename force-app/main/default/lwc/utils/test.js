
const calculateMaxValidHorizonDate = (sechedulingHorizonValue, selectedHorizonUnit, serviceAppointmentDueDate) => {
    if(sechedulingHorizonValue && selectedHorizonUnit) {
        var currentDate = new Date();
        var targetDate;
        switch(selectedHorizonUnit) {
            case "Weeks":
                targetDate = new Date(currentDate.setDate(currentDate.getDate() + sechedulingHorizonValue*7));
            break;
            case "Months":
                targetDate = new Date(currentDate.setMonth(currentDate.getMonth() + sechedulingHorizonValue));
            break;
            default: //this.SCHEDULING_UNIT_DAY
                targetDate = new Date(currentDate.setDate(currentDate.getDate() + sechedulingHorizonValue));
        }

        console.log("Scheduling horizon unit : new date is  : " + targetDate);

        if(serviceAppointmentDueDate < targetDate) 
            return serviceAppointmentDueDate;
        else
            return targetDate;

    } else {
        return serviceAppointmentDueDate;
    }
}

const convertDateUTCtoLocal = (date) =>{
    if(date && date !== 'null') {
        return new Date((date.replace(/ /g,"T") + '.000Z'));
        } else {
        return '';
        }
}



export {
    calculateMaxValidHorizonDate,
    convertDateUTCtoLocal
}