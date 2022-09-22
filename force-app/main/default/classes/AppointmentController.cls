public without sharing class AppointmentController {
    public AppointmentController() {

    }
    @AuraEnabled()
    public static String getServiceAppointmentByFieldsList(String serviceAppointmentId, String serviceAppointmnetFields){
        List<sObject> queryresult = new List<SObject>();
        String result= '';
        try{

            System.debug('serviceAppointmnetFields:::' + serviceAppointmnetFields);
            List<String> fieldsJson = (List<String>)JSON.deserialize(serviceAppointmnetFields, List<String>.class);
            
            String fields = createAppointmentQueryFields(fieldsJson);
            String soqlquery = 'SELECT '+ fields + ' FROM ' + 'ServiceAppointment' + ' WHERE ID =:' + serviceAppointmentId;
            //check alphanumeric + _ 
            queryresult = Database.query(soqlquery);
            result = JSON.serialize(queryresult);
            System.debug('Get SA Result'+ queryresult);
            
            //return queryresult[0];

        } catch(Exception e){
            System.debug('Error getServiceAppointmentByFieldsList'+ e);
        }

        return result;
        

    }

    private static String createAppointmentQueryFields(List<String> serviceAppointmnetFields){
        List<String> defaultFields = new List<String>{
            'Id',
            'Contact.FirstName', 
            'Contact.LastName', 
            'Contact.Phone', 
            'Status', 
            'Address', 
            'WorkType.Name', 
            'Subject',
            'EarliestStartTime',
            'ArrivalWindowStartTime',
            'ArrivalWindowEndTime',
            'SchedStartTime',
            'SchedEndTime',
            'DueDate',
            'Description',
            'ServiceNote',
            'WorkTypeId',
            'AppointmentNumber'
        };

        Set<String> allFields = new Set<String>(defaultFields);      
        allFields.addAll(serviceAppointmnetFields);
        List<String> fieldsList = new List<String>();
        fieldsList.addAll(allFields);

        String fieldsStr = String.join( fieldsList, ', ' ); 

        return  fieldsStr;
    }
}
