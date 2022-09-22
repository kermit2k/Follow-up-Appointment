import customLabels from './labels';

const MONTHNAME = [ customLabels.Appointment_ReBooking_MonthName_January,
    customLabels.Appointment_ReBooking_MonthName_February,
    customLabels.Appointment_ReBooking_MonthName_March,
    customLabels.Appointment_ReBooking_MonthName_April,
    customLabels.Appointment_ReBooking_MonthName_May,
    customLabels.Appointment_ReBooking_MonthName_June,
    customLabels.Appointment_ReBooking_MonthName_July,
    customLabels.Appointment_ReBooking_MonthName_August,
    customLabels.Appointment_ReBooking_MonthName_September,
    customLabels.Appointment_ReBooking_MonthName_October,
    customLabels.Appointment_ReBooking_MonthName_November,
    customLabels.Appointment_ReBooking_MonthName_December];

const DAYNAME = [ customLabels.Appointment_ReBooking_WeekDayLong_Sunday,
    customLabels.Appointment_ReBooking_WeekDayLong_Monday,
    customLabels.Appointment_ReBooking_WeekDayLong_Tuesday,
    customLabels.Appointment_ReBooking_WeekDayLong_Wednesday,
    customLabels.Appointment_ReBooking_WeekDayLong_Thursday,
    customLabels.Appointment_ReBooking_WeekDayLong_Friday,
    customLabels.Appointment_ReBooking_WeekDayLong_Saturday ];


const formatAppointmentFromHToH = (startDate, durationMinutes) => {
    let date = new Date(startDate);
    let formatedStr = DAYNAME[date.getDay()] + ","+"  "
                    +MONTHNAME[date.getMonth()] + " " 
                    +date.getDate() + " , "
                    +date.getHours() + ":" + date.getMinutes();

    return formatedStr;
};


export{ formatAppointmentFromHToH};