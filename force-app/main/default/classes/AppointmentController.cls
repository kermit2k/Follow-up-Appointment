public without sharing class AppointmentController {
    public AppointmentController() {

    }

    @AuraEnabled(Cacheable=true)
    public static Map<String, String> getServiceAppointment(String serviceAppointmentId) {

        Map<String, String> serviceAppointmentInfo = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id,
                                            Contact.FirstName,
                                            Contact.LastName,
                                            Contact.Phone,
                                            Status,
                                            Address,
                                            WorkType.Name,
                                            Subject,
                                            EarliestStartTime,
                                            ArrivalWindowStartTime,
                                            ArrivalWindowEndTime,
                                            SchedStartTime,
                                            SchedEndTime,
                                            DueDate,
                                            Description,
                                            AppointmentNumber
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];

                Address addr = sa.Address;
                String customerAddress = '';
                if (addr != null) {
                    if(addr.Street != null) customerAddress = customerAddress + addr.Street + ' ';
                    if(addr.City != null) customerAddress = customerAddress + addr.City + ' ';
                    if(addr.State != null) customerAddress = customerAddress + addr.State + ' ';
                    if(addr.PostalCode != null) customerAddress = customerAddress + addr.PostalCode + ' ';
                    if(addr.Country != null) customerAddress = customerAddress + addr.Country + ' ';
                }
                    
                serviceAppointmentInfo.put('serviceAppointmentId', serviceAppointmentId);
                serviceAppointmentInfo.put('CustomerFirstName', sa.Contact.FirstName);
                serviceAppointmentInfo.put('CustomerLastName', sa.Contact.LastName);
                serviceAppointmentInfo.put('CustomerPhone', sa.Contact.Phone);
                serviceAppointmentInfo.put('ServiceAppointmentStatus', sa.Status);
                serviceAppointmentInfo.put('CustomerAddress', customerAddress);
                serviceAppointmentInfo.put('WorkTypeName', sa.WorkType.Name);
                serviceAppointmentInfo.put('ServiceAppointmentSubject', sa.Subject);
                serviceAppointmentInfo.put('EarliestStartTime', ''+sa.EarliestStartTime);
                serviceAppointmentInfo.put('ArrivalWindowStartTime', ''+sa.ArrivalWindowStartTime); 
                serviceAppointmentInfo.put('ArrivalWindowEndTime', ''+sa.ArrivalWindowEndTime); 
                serviceAppointmentInfo.put('SchedStartTime', ''+sa.SchedStartTime);
                serviceAppointmentInfo.put('SchedEndTime', ''+sa.SchedEndTime);
                serviceAppointmentInfo.put('DueDate', ''+sa.DueDate);
                serviceAppointmentInfo.put('ServiceAppointmentDescription', sa.Description);
                serviceAppointmentInfo.put('AppointmentNumber', sa.AppointmentNumber);

                AssignedResource ar = [SELECT Id, ServiceResourceId
                                        FROM AssignedResource
                                        WHERE ServiceAppointmentId =: serviceAppointmentId
                                        ][0];

                ServiceResource sr = [SELECT Id, Name
                                        FROM ServiceResource
                                        WHERE Id =: ar.ServiceResourceId
                                        ][0];

                serviceAppointmentInfo.put('ServiceResourceName', sr.Name);

            } catch (Exception e) {
                serviceAppointmentInfo.put('error', ''+e);
            }
            return serviceAppointmentInfo;
        
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
