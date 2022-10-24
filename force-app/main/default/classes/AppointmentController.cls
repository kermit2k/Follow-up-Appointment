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

    @AuraEnabled()
    public static Map<String, Object> getSlots(String serviceAppointmentId, Id operatingHoursId, Id schedulingPolicyId, Boolean arrivalWindowFlag) {
        // CALL to instrumentation api
        // InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - getSlotsAsPerEarliestStartDate()');


        // SAVE POINT TO ROLLBACK LATER
        Map<String, Object> slotsList = new Map<String, Object>();
        try {
            if(serviceAppointmentId != null) {
                ServiceAppointment sa = [SELECT Id, ServiceTerritoryId
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];        
                Timezone timeZone = UserInfo.getTimeZone();
                if (sa.ServiceTerritoryId != null) {   
                    ServiceTerritory st = [SELECT OperatingHoursId  
                                            FROM ServiceTerritory   
                                            WHERE ID =: sa.ServiceTerritoryId  
                                            ][0];   
                    OperatingHours oh = [SELECT TimeZone    
                                        FROM OperatingHours 
                                        WHERE ID =: st.OperatingHoursID 
                                        ][0];   
                    timeZone = System.Timezone.getTimeZone(oh.TimeZone);    
                }

                List<FSL.AppointmentBookingSlot> timeSlots = FSL.AppointmentBookingService.GetSlots(serviceAppointmentId,
                                    schedulingPolicyId, operatingHoursId, timeZone, arrivalWindowFlag);


                slotsList.put('list', timeSlots);
                List<String> timeSlotRange = new List<String>();
    
                for(integer i=0; i<timeSlots.size(); i++) {
                    System.debug('Time slots are : '+timeSlots[i].Interval.Start+'#'+ timeSlots[i].Interval.Finish);
                    timeSlotRange.add(timeSlots[i].Interval.Start+'#'+ timeSlots[i].Interval.Finish+'#'+timeSlots[i].Grade);
                }
                slotsList.put('timeSlotList', timeSlotRange);
            }
            else {
                slotsList.put('error', 'Invalid SA ID or token expired');
            }
            return slotsList;
        } catch (Exception e) {
            System.debug(e.getMessage());
            slotsList.put('error', ''+e.getMessage());
            return slotsList;
        }
    }

    @AuraEnabled()
    public static Map<String, String> scheduleSA(String serviceAppointmentId, String schedulingPolicyId) {
        //  CALL to instrumentation api
        //  InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - updateSASlot()');

        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                System.debug('Service appointment is  : '+serviceAppointmentId);
                FSL.ScheduleResult myResult = new FSL.ScheduleResult();

                myResult = FSL.ScheduleService.schedule(schedulingPolicyId , serviceAppointmentId);
                System.debug('FSL api result is : '+myResult);
                updateStatusArray.put('success', 'Appointment Updated');

            } catch (Exception e) {
                updateStatusArray.put('error', ''+e);
            }
        
        return updateStatusArray;
    }

    @AuraEnabled()
    public static Map<String, String> updateSASlot(String serviceAppointmentId, DateTime arrivalWindowStartTime, DateTime arrivalWindowEndTime) {
         // CALL to instrumentation api
         // InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - updateSASlot()');

        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];
                sa.ArrivalWindowStartTime = arrivalWindowStartTime; 
                sa.ArrivalWindowEndTime = arrivalWindowEndTime; 
                update sa;

                updateStatusArray.put('success', 'Appointment Updated');

            } catch (Exception e) {
                updateStatusArray.put('error', ''+e);
            }
        
        return updateStatusArray;
    }

    @AuraEnabled()
    public static Map<String, String> updateServiceAppointmentStatus(String serviceAppointmentId, String statusId) {
        // CALL to instrumentation api
        // InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - updateServiceAppointmentStatus()');

        Map<String, String> updateStatusArray = new Map<String, String>();

            try {
                ServiceAppointment sa = [SELECT Id
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];
                sa.Status = statusId;
                update sa;
                updateStatusArray.put('success', 'Appointment Updated');
            } catch (Exception e) {
                updateStatusArray.put('error', ''+e.getMessage());
            }
        
        return updateStatusArray;
    }
    
    @AuraEnabled()
    public static Map<String, Object> updateSA(String serviceAppointmentId, DateTime earliestStartDate, DateTime arrivalStartDate, DateTime arrivalEndDate) {
        // CALL to instrumentation api
        // InstrumentationHelperController.initOperation(InstrumentationHelperController.FEATURE_NAME, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, InstrumentationHelperController.SUB_FEATURE_NAME_SSS, 'SSS - updateSA()');

        Map<String, Object> newSaArray = new Map<String, Object>();

        try {
            if(serviceAppointmentId != null) {
                ServiceAppointment sa = [SELECT Id, EarliestStartTime
                                        FROM ServiceAppointment
                                        WHERE ID =: serviceAppointmentId
                                        ][0];        
                if(sa != null) {

                    sa.EarliestStartTime = earliestStartDate;
                    sa.ArrivalWindowEndTime = arrivalEndDate;
                    sa.ArrivalWindowStartTime = arrivalStartDate;
                    
                    update sa;
                    system.debug('Service appointment updated');
                    newSaArray.put('success', 'service appointment updated' );
                    
                }
                else {
                    newSaArray.put('error', 'Unable to find service appointment');
                }
            } else {
                newSaArray.put('error', 'No service appointment found');
            }

        } catch (Exception e) {
            System.debug(e.getMessage());
            newSaArray.put('error', ''+e.getMessage());
            return newSaArray;
        }
        return newSaArray;
    }
}
