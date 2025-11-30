package com.bleat.controllers;

import org.springframework.web.bind.annotation.*;
import com.bleat.models.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin(origins = "*")
public class ParentController {

    private static Map<Integer, Parent> parents = new HashMap<>();
    private static Map<Integer, Child> children = new HashMap<>();
    private static Map<Integer, EmergencyContact> emergencyContacts = new HashMap<>();
    private static Map<Integer, SafeZone> safeZones = new HashMap<>();
    private static Map<Integer, Report> reports = new HashMap<>();
    private static Map<Integer, String> deviceStatuses = new HashMap<>();

    // ===== USE CASE 1: Generate Reports (Using Factory Pattern) =====
@PostMapping("/{parentId}/reports/generate")
public GenerateReportResponse generateReport(@PathVariable int parentId,
                                             @RequestBody GenerateReportRequest request) {
    try {
        // Validate report type using factory
        if (!ReportFactory.isValidReportType(request.reportType)) {
            return new GenerateReportResponse(false,
                "Invalid report type. Supported types: DAILY, WEEKLY, MONTHLY",
                -1,
                request.reportType,
                null);
        }
        
        // Use Factory Pattern to create the appropriate report type
        Report report = ReportFactory.createReport(request.reportType, parentId);
        
        // Generate report content (polymorphic call - each subclass implements its own logic)
        String content = report.generate();
        
        // Save into DB
        int savedId = com.bleat.models.DBHandler.saveReport(parentId, request.reportType, content);
        
        if (savedId <= 0) {
            return new GenerateReportResponse(false,
                "Failed to save report in database",
                -1,
                request.reportType,
                null);
        }
        
        // Success
        return new GenerateReportResponse(
            true,
            "Report generated successfully using Factory Pattern",
            savedId,
            request.reportType,
            LocalDateTime.now().toString()
        );
        
    } catch (IllegalArgumentException e) {
        return new GenerateReportResponse(false, e.getMessage(), -1, request.reportType, null);
    } catch (Exception e) {
        return new GenerateReportResponse(false, e.getMessage(), -1, null, null);
    }
}



    @GetMapping("/{parentId}/reports/{reportId}/download")
    public ReportDto downloadReport(@PathVariable int parentId, @PathVariable int reportId) {
        try {
            // Fetch full report (type, timestamp, content) from DB
            DBHandler.ReportFull result = DBHandler.getReportFull(reportId);

            if (result == null) {
                return null; // Report not found
            }

            // Return as DTO
            return new ReportDto(
                    result.reportId,
                    result.type,
                    result.generatedOn,
                    result.content
            );

        } catch (Exception e) {
            System.out.println("Failed to download report: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/{parentId}/reports")
    public List<ReportDto> listReports(@PathVariable int parentId) {
        List<ReportDto> out = new ArrayList<>();

        try {
            List<DBHandler.ReportSummary> rows = DBHandler.listReportsByParent(parentId);

            for (DBHandler.ReportSummary s : rows) {
                out.add(new ReportDto(
                        s.reportId,
                        s.type,
                        s.generatedOn,
                        null // no content in listing, only metadata
                ));
            }

        } catch (Exception ex) {
            System.out.println("Failed to list reports: " + ex.getMessage());
        }

        return out;
    }


    // ===== USE CASE 2: Pair Device =====
    @PostMapping("/{parentId}/child/{childId}/pair-device")
    public PairDeviceResponse pairDevice(
    		
            @PathVariable int parentId,
            @PathVariable int childId,
            @RequestBody PairDeviceRequest request) {
    	System.out.println("=============================================================In paire device");
        try {
            if (request == null || request.deviceSerial  == null || request.deviceSerial .trim().isEmpty()) {
                return new PairDeviceResponse(false, "Device serial is required", null);
            }

            // Verify parent owns the child
            if (!DBHandler.childBelongsToParent(childId, parentId)) {
                return new PairDeviceResponse(false, "Child does not belong to this parent", null);
            }

            // Find device by serial
            Integer deviceId = DBHandler.getDeviceIdBySerial(request.deviceSerial);

            if (deviceId == null) {
                // auto-create device
                deviceId = DBHandler.createDevice(request.deviceSerial);

                if (deviceId == null) {
                    return new PairDeviceResponse(false, "Failed to create new device", null);
                }
            }

            if (deviceId == null) {
                return new PairDeviceResponse(false, "Device not found", null);
            }

            // Pair in DB
            boolean ok = DBHandler.pairDeviceToChild(deviceId, childId);
            if (!ok) {
                return new PairDeviceResponse(false, "Failed to pair device", null);
            }

            // Generate pairing code for the child app
            String pairingCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            return new PairDeviceResponse(true, "Device paired successfully", pairingCode);

        } catch (Exception e) {
            return new PairDeviceResponse(false, e.getMessage(), null);
        }
    }


    @PostMapping("/{parentId}/pair-code/generate")
    public GeneratePairingCodeResponse generatePairingCode(@PathVariable int parentId) {
        try {
            String code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            return new GeneratePairingCodeResponse(true, "Pairing code generated", code);
        } catch (Exception e) {
            return new GeneratePairingCodeResponse(false, e.getMessage(), null);
        }
    }

    // ===== USE CASE 3: Manage Child =====
    @GetMapping("/children/{parentId}")
    public List<ChildDto> getChildren(@PathVariable int parentId) {
        List<ChildDto> result = new ArrayList<>();

        try {
            List<DBHandler.ChildRecord> rows = DBHandler.getChildrenByParent(parentId);

            for (DBHandler.ChildRecord r : rows) {
                result.add(new ChildDto(
                        r.childId,
                        r.name,
                        r.age,
                        r.deviceId,
                        r.deviceStatus,
                        r.active
                ));
            }
        } catch (Exception ex) {
            System.out.println("Failed to fetch children: " + ex.getMessage());
        }

        return result;
    }

    @PostMapping("/{parentId}/add-child")
    public AddChildResponse addChild(@PathVariable int parentId, @RequestBody AddChildRequest request) {
        try {
            if (request.name == null || request.name.trim().isEmpty()) {
                return new AddChildResponse(false, "Child name is required", -1);
            }

            if (request.age < 0) {
                return new AddChildResponse(false, "Age cannot be negative", -1);
            }

            int childId = com.bleat.models.DBHandler.createChild(
                    parentId,
                    request.name.trim(),
                    request.age
            );

            if (childId <= 0) {
                return new AddChildResponse(false, "Failed to save child to database", -1);
            }

            return new AddChildResponse(true, "Child added successfully", childId);

        } catch (Exception e) {
            return new AddChildResponse(false, e.getMessage(), -1);
        }
    }



    @PutMapping("/{parentId}/child/{childId}/update")
    public UpdateChildResponse updateChild(@PathVariable int parentId,
                                           @PathVariable int childId,
                                           @RequestBody UpdateChildRequest request) {
        try {
            boolean ok = DBHandler.updateChild(childId, request.name, request.age);

            if (!ok) {
                return new UpdateChildResponse(false, "Unable to update child", childId);
            }

            return new UpdateChildResponse(true, "Child updated successfully", childId);

        } catch (Exception e) {
            return new UpdateChildResponse(false, e.getMessage(), childId);
        }
    }


    @DeleteMapping("/{parentId}/child/{childId}/delete")
    public DeleteChildResponse deleteChild(@PathVariable int parentId, @PathVariable int childId) {
        try {
            boolean ok = DBHandler.deleteChild(childId);

            if (!ok) {
                return new DeleteChildResponse(false, "Child not found", childId);
            }

            return new DeleteChildResponse(true, "Child deleted successfully", childId);

        } catch (Exception e) {
            return new DeleteChildResponse(false, e.getMessage(), childId);
        }
    }


    // ===== USE CASE 4: Track Child's Location =====
    @GetMapping("/{parentId}/child/{childId}/track-location")
    public LocationDto getChildLocation(@PathVariable int parentId, @PathVariable int childId) {
        try {
            DBHandler.LocationRecord loc = DBHandler.getLatestLocation(childId);
            if (loc == null) {
                return null;
            }


            return new LocationDto(
                    loc.latitude,
                    loc.longitude,
                    loc.timestamp.toString()
            );
        } catch (Exception e) {
            System.out.println("Failed to fetch location: " + e.getMessage());
            return null;
        }
    }
    

    @GetMapping("/{parentId}/child/{childId}/location-history")
    public List<LocationDto> getLocationHistory(@PathVariable int parentId, @PathVariable int childId) {

        List<LocationDto> history = new ArrayList<>();

        try {
            List<DBHandler.LocationRecord> rows = DBHandler.getLocationHistory(childId);

            for (DBHandler.LocationRecord r : rows) {
                history.add(new LocationDto(
                        r.latitude,
                        r.longitude,
                        r.timestamp.toString()
                ));
            }
        } catch (Exception e) {
            System.out.println("Failed to fetch history: " + e.getMessage());
        }

        return history;
    }

    // ===== USE CASE 5: Get Alerts (Safe Zone Violations) =====
 // ===== USE CASE 5: Get Alerts (Safe Zone Violations / SOS / Device Alerts) =====
    @GetMapping("/{parentId}/alerts")
    public List<AlertDto> getAlerts(@PathVariable int parentId) {
        List<AlertDto> alertList = new ArrayList<>();

        try {
            List<DBHandler.AlertRecord> rows = DBHandler.getAlertsByParent(parentId);

            for (DBHandler.AlertRecord a : rows) {
                alertList.add(
                    new AlertDto(
                        a.alertId,
                        a.childId,
                        a.type,
                        a.description,
                        a.timestamp.toString()
                    )
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to fetch alerts: " + e.getMessage());
        }

        return alertList;
    }


    @PostMapping("/{parentId}/alerts/subscribe")
    public SubscribeAlertsResponse subscribeToAlerts(@PathVariable int parentId) {
        try {
            return new SubscribeAlertsResponse(true, "Subscribed to alerts successfully");
        } catch (Exception e) {
            return new SubscribeAlertsResponse(false, e.getMessage());
        }
    }

    // ===== USE CASE 6: Send Message to Child =====
    @PostMapping("/{parentId}/child/{childId}/send-message")
    public SendMessageResponse sendMessage(
            @PathVariable int parentId,
            @PathVariable int childId,
            @RequestBody SendMessageRequest request) {

        try {
            int messageId = DBHandler.saveMessage(parentId, childId, request.message, "PARENT");

            if (messageId <= 0) {
                return new SendMessageResponse(false, "Failed to send message", -1, null);
            }

            return new SendMessageResponse(true,
                    "Message sent successfully",
                    messageId,
                    LocalDateTime.now().toString());

        } catch (Exception e) {
            return new SendMessageResponse(false, e.getMessage(), -1, null);
        }
    }


    @GetMapping("/{parentId}/child/{childId}/messages")
    public List<MessageDto> getMessagesWithChild(
            @PathVariable int parentId,
            @PathVariable int childId) {

        List<MessageDto> out = new ArrayList<>();

        try {
            List<DBHandler.MessageRecord> rows = DBHandler.getMessages(parentId, childId);

            for (DBHandler.MessageRecord r : rows) {

                // If child sent the message → mark delivered
                if ("CHILD".equalsIgnoreCase(r.senderRole) && !"delivered".equalsIgnoreCase(r.status)) {
                    DBHandler.markMessageDelivered(r.messageId);
                }

                out.add(new MessageDto(
                        r.messageId,
                        r.content,
                        r.timestamp.toString(),
                        r.status
                ));
            }

        } catch (Exception ex) {
            System.out.println("Failed to load messages: " + ex.getMessage());
        }

        return out;
    }


    @PostMapping("/{parentId}/child/{childId}/messages/{messageId}/ack")
    public AcknowledgeResponse acknowledgeMessageAsParent(
            @PathVariable int parentId,
            @PathVariable int childId,
            @PathVariable int messageId) {

        try {
            boolean updated = DBHandler.acknowledgeMessageByParent(messageId);

            if (updated) {
                return new AcknowledgeResponse(true,
                        "Message acknowledged successfully",
                        messageId);
            }

            return new AcknowledgeResponse(false,
                    "No message was updated. Possibly invalid messageId.",
                    messageId);

        } catch (Exception e) {
            return new AcknowledgeResponse(false, e.getMessage(), messageId);
        }
    }


    // ===== USE CASE 7: Manage Emergency Contacts =====
    @GetMapping("/{parentId}/child/{childId}/emergency-contacts")
    public List<EmergencyContactDto> getEmergencyContacts(
            @PathVariable int parentId,
            @PathVariable int childId) {

        List<EmergencyContactDto> out = new ArrayList<>();

        try {
            // Verify parent owns the child
            if (!DBHandler.childBelongsToParent(childId, parentId)) {
                return out; // empty list
            }

            List<DBHandler.EmergencyContactRecord> rows =
                    DBHandler.listEmergencyContacts(childId);

            for (DBHandler.EmergencyContactRecord r : rows) {
                out.add(new EmergencyContactDto(
                        r.contactId,
                        r.name,
                        r.phone,
                        r.relation
                ));
            }

        } catch (Exception e) {
            System.out.println("Failed to fetch emergency contacts: " + e.getMessage());
        }

        return out;
    }


    @PostMapping("/{parentId}/child/{childId}/emergency-contact/add")
    public AddEmergencyContactResponse addEmergencyContact(
            @PathVariable int parentId,
            @PathVariable int childId,
            @RequestBody AddEmergencyContactRequest request) {

        try {
            // Validation
            if (request == null ||
                    request.name == null || request.name.trim().isEmpty() ||
                    request.phoneNumber == null || request.phoneNumber.trim().isEmpty()) {

                return new AddEmergencyContactResponse(false,
                        "Name and phone number are required", -1);
            }

            // Ownership check
            if (!DBHandler.childBelongsToParent(childId, parentId)) {
                return new AddEmergencyContactResponse(false,
                        "Parent does not own this child", -1);
            }

            // Duplicate check
            List<DBHandler.EmergencyContactRecord> existing =
                    DBHandler.listEmergencyContacts(childId);

            for (DBHandler.EmergencyContactRecord c : existing) {
                if (c.name.equalsIgnoreCase(request.name.trim()) &&
                    c.phone.equals(request.phoneNumber.trim())) {

                    return new AddEmergencyContactResponse(false,
                            "Duplicate contact", -1);
                }
            }

            int id = DBHandler.addEmergencyContact(
                    childId,
                    request.name.trim(),
                    request.phoneNumber.trim(),
                    request.relation == null ? "" : request.relation.trim()
            );

            if (id <= 0) {
                return new AddEmergencyContactResponse(false,
                        "Failed to save contact", -1);
            }

            return new AddEmergencyContactResponse(true,
                    "Emergency contact added", id);

        } catch (Exception e) {
            return new AddEmergencyContactResponse(false,
                    e.getMessage(), -1);
        }
    }

    @PutMapping("/{parentId}/child/{childId}/emergency-contact/{contactId}/update")
    public UpdateEmergencyContactResponse updateEmergencyContact(
            @PathVariable int parentId,
            @PathVariable int childId,
            @PathVariable int contactId,
            @RequestBody UpdateEmergencyContactRequest request) {

        try {
            // Ownership check
            if (!DBHandler.childBelongsToParent(childId, parentId)) {
                return new UpdateEmergencyContactResponse(false,
                        "Parent does not own this child", contactId);
            }

            // Validation
            if (request == null ||
                    request.name == null || request.name.trim().isEmpty() ||
                    request.phoneNumber == null || request.phoneNumber.trim().isEmpty()) {

                return new UpdateEmergencyContactResponse(false,
                        "Name and phone number are required", contactId);
            }

            // Duplicate check
            List<DBHandler.EmergencyContactRecord> existing =
                    DBHandler.listEmergencyContacts(childId);

            for (DBHandler.EmergencyContactRecord c : existing) {
                if (c.contactId != contactId &&
                    c.name.equalsIgnoreCase(request.name.trim()) &&
                    c.phone.equals(request.phoneNumber.trim())) {

                    return new UpdateEmergencyContactResponse(false,
                            "Duplicate contact", contactId);
                }
            }

            boolean ok = DBHandler.updateEmergencyContact(
                    contactId,
                    request.name.trim(),
                    request.phoneNumber.trim(),
                    request.relation == null ? "" : request.relation.trim()
            );

            if (!ok) {
                return new UpdateEmergencyContactResponse(false,
                        "Failed to update contact", contactId);
            }

            return new UpdateEmergencyContactResponse(true,
                    "Emergency contact updated", contactId);

        } catch (Exception e) {
            return new UpdateEmergencyContactResponse(false,
                    e.getMessage(), contactId);
        }
    }


    @DeleteMapping("/{parentId}/child/{childId}/emergency-contact/{contactId}/delete")
    public DeleteEmergencyContactResponse deleteEmergencyContact(
            @PathVariable int parentId,
            @PathVariable int childId,
            @PathVariable int contactId) {

        try {
            if (!DBHandler.childBelongsToParent(childId, parentId)) {
                return new DeleteEmergencyContactResponse(false,
                        "Parent does not own this child", contactId);
            }

            boolean ok = DBHandler.deleteEmergencyContact(contactId);

            if (!ok) {
                return new DeleteEmergencyContactResponse(false,
                        "Contact not found", contactId);
            }

            return new DeleteEmergencyContactResponse(true,
                    "Emergency contact deleted", contactId);

        } catch (Exception e) {
            return new DeleteEmergencyContactResponse(false,
                    e.getMessage(), contactId);
        }
    }


    // ===== USE CASE 8: Send SOS to Emergency Services =====
    @PostMapping("/{parentId}/child/{childId}/sos/emergency-services")
    public SendSosEmergencyResponse sendSosToEmergencyServices(
            @PathVariable int parentId,
            @PathVariable int childId,
            @RequestBody SendSosEmergencyRequest request) {

        try {
            int alertId = DBHandler.createSosAlert(
                    parentId,
                    childId,
                    request.message,
                    request.latitude,
                    request.longitude
            );

            if (alertId <= 0) {
                return new SendSosEmergencyResponse(false, "Failed to save SOS alert", -1, null);
            }

            return new SendSosEmergencyResponse(true,
                    "SOS sent to emergency services",
                    alertId,
                    LocalDateTime.now().toString()
            );
        } catch (Exception e) {
            return new SendSosEmergencyResponse(false, e.getMessage(), -1, null);
        }
    }

    @PostMapping("/{parentId}/child/{childId}/sos/cancel-emergency")
    public CancelSosEmergencyResponse cancelSosEmergency(
            @PathVariable int parentId,
            @PathVariable int childId,
            @RequestBody CancelSosEmergencyRequest request) {

        try {
            boolean ok = DBHandler.cancelSos(request.sosId);

            if (!ok) {
                return new CancelSosEmergencyResponse(false, "Failed to cancel SOS", request.sosId);
            }

            return new CancelSosEmergencyResponse(true,
                    "SOS to emergency services cancelled",
                    request.sosId);

        } catch (Exception e) {
            return new CancelSosEmergencyResponse(false, e.getMessage(), request.sosId);
        }
    }


    @PostMapping("/{parentId}/child/{childId}/safety-confirmed")
    public ConfirmSafetyResponse confirmSafety(
            @PathVariable int parentId,
            @PathVariable int childId) {

        try {
            boolean ok = DBHandler.confirmSafety(parentId, childId);

            if (!ok) {
                return new ConfirmSafetyResponse(false, "Failed to confirm safety");
            }

            return new ConfirmSafetyResponse(true, "Child safety confirmed and emergency services notified");

        } catch (Exception e) {
            return new ConfirmSafetyResponse(false, e.getMessage());
        }
    }

    // ===== USE CASE 9: Deactivate Child's Device =====
    @PostMapping("/{parentId}/child/{childId}/device/deactivate")
    public DeactivateDeviceResponse deactivateDevice(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody DeactivateDeviceRequest request) {
        try {
            Child child = children.get(childId);
            if (child != null && child.getDevice() != null) {
                child.getDevice().deactivate();
                deviceStatuses.put(child.getDevice().getDeviceId(), "DEACTIVATED");
                // persist deactivation
                try {
                    com.bleat.services.ParentService.getInstance().deactivateDevice(child.getDevice().getDeviceId());
                } catch (Exception ex) {
                    System.out.println("Failed to persist device deactivation: " + ex.getMessage());
                }

                return new DeactivateDeviceResponse(true,
                        "Device deactivated " + (request.permanent ? "permanently" : "temporarily"), childId);
            }
            return new DeactivateDeviceResponse(false, "Device not found", childId);
        } catch (Exception e) {
            return new DeactivateDeviceResponse(false, e.getMessage(), childId);
        }
    }

    @PostMapping("/{parentId}/child/{childId}/device/reactivate")
    public ReactivateDeviceResponse reactivateDevice(@PathVariable int parentId, @PathVariable int childId) {
        try {
            Child child = children.get(childId);
            if (child != null && child.getDevice() != null) {
                deviceStatuses.put(child.getDevice().getDeviceId(), "ACTIVE");
                return new ReactivateDeviceResponse(true, "Device reactivated", childId);
            }
            return new ReactivateDeviceResponse(false, "Device not found", childId);
        } catch (Exception e) {
            return new ReactivateDeviceResponse(false, e.getMessage(), childId);
        }
    }

    // ===== USE CASE 10: View Child's Device Status =====
    @GetMapping("/{parentId}/child/{childId}/device-status")
    public DBHandler.DeviceStatusDto getDeviceStatus(@PathVariable int parentId, @PathVariable int childId) {
        try {
            return DBHandler.getDeviceStatus(childId);
        } catch (Exception e) {
            System.out.println("device status failed: " + e.getMessage());
            return null;
        }
    }


    // Public helper used by AdminController / AuthController
    public static java.util.Optional<Child> getChildByUsernameAndPassword(String username, String password) {
        return children.values().stream()
                .filter(c -> username != null && username.equals(c.getUsername()) && password != null
                        && password.equals(c.getPassword()))
                .findFirst();
    }

    // Public helper to fetch a child by id
    public static Child getChildById(int childId) {
        return children.get(childId);
    }

    // Public helper to fetch a parent by id
    public static Parent getParentById(int parentId) {
        return parents.get(parentId);
    }

    public static void addApprovedChild(Child child) {
        if (child == null)
            return;
        children.put(child.getChildId(), child);
        try {
            com.bleat.services.AuthenticationManager.getInstance().addUser(child.getChildId(), child.getUsername());
        } catch (Exception ex) {
            // best-effort
        }
    }

    // ===== USE CASE 11: Set Safe Zones =====
    @PostMapping("/{parentId}/child/{childId}/safe-zone/add")
    public AddSafeZoneResponse addSafeZone(
            @PathVariable int parentId,
            @PathVariable int childId,
            @RequestBody AddSafeZoneRequest request) {

        try {
            // 1. Check ownership
            if (!DBHandler.isChildOwnedByParent(childId, parentId)) {
                return new AddSafeZoneResponse(false, "Parent does not own this child", -1);
            }

            // 2. Save to DB
            int zoneId = DBHandler.addSafeZone(childId, request.latitude, request.longitude, request.radius);
            if (zoneId <= 0) {
                return new AddSafeZoneResponse(false, "Failed to save safe zone", -1);
            }

            return new AddSafeZoneResponse(true, "Safe zone created", zoneId);

        } catch (Exception e) {
            return new AddSafeZoneResponse(false, e.getMessage(), -1);
        }
    }


    @GetMapping("/{parentId}/child/{childId}/safe-zones")
    public List<SafeZoneDto> getSafeZones(
            @PathVariable int parentId,
            @PathVariable int childId) {

        List<SafeZoneDto> zones = new ArrayList<>();

        try {
            if (!DBHandler.isChildOwnedByParent(childId, parentId)) return zones;

            List<DBHandler.SafeZoneRecord> rows = DBHandler.getSafeZones(childId);

            for (DBHandler.SafeZoneRecord z : rows) {
                zones.add(new SafeZoneDto(z.id, null, z.latitude, z.longitude, z.radius));
            }

        } catch (Exception e) {
            System.out.println("Failed to load safe zones: " + e.getMessage());
        }

        return zones;
    }


    @DeleteMapping("/{parentId}/child/{childId}/safe-zone/{zoneId}/delete")
    public DeleteSafeZoneResponse deleteSafeZone(
            @PathVariable int parentId,
            @PathVariable int childId,
            @PathVariable int zoneId) {

        try {
            if (!DBHandler.isChildOwnedByParent(childId, parentId)) {
                return new DeleteSafeZoneResponse(false, "Parent does not own this child", zoneId);
            }

            boolean deleted = DBHandler.deleteSafeZone(zoneId);
            if (!deleted) return new DeleteSafeZoneResponse(false, "Safe zone not found", zoneId);

            return new DeleteSafeZoneResponse(true, "Safe zone deleted", zoneId);

        } catch (Exception e) {
            return new DeleteSafeZoneResponse(false, e.getMessage(), zoneId);
        }
    }

    // ===== DTOs =====

    public static class AddChildRequest {
        public String name;
        public int age;
    }


    public static class AddChildResponse {
        public boolean success;
        public String message;
        public int childId;

        public AddChildResponse(boolean success, String message, int childId) {
            this.success = success;
            this.message = message;
            this.childId = childId;
        }
    }

    public static class UpdateChildRequest {
        public String name;
        public int age;
    }

    public static class UpdateChildResponse {
        public boolean success;
        public String message;
        public int childId;

        public UpdateChildResponse(boolean success, String message, int childId) {
            this.success = success;
            this.message = message;
            this.childId = childId;
        }
    }

    public static class DeleteChildResponse {
        public boolean success;
        public String message;
        public int childId;

        public DeleteChildResponse(boolean success, String message, int childId) {
            this.success = success;
            this.message = message;
            this.childId = childId;
        }
    }

    public static class ChildDto {
        public int id;
        public String name;
        public int age;
        public Integer deviceId;
        public String deviceStatus;
        public boolean deviceActive;

        public ChildDto(int id, String name, int age, Integer deviceId, String deviceStatus, boolean deviceActive) {
            this.id = id;
            this.name = name;
            this.age = age;
            this.deviceId = deviceId;
            this.deviceStatus = deviceStatus;
            this.deviceActive = deviceActive;
        }
    }

    public static class LocationDto {
        public double latitude;
        public double longitude;
        public String timestamp;

        public LocationDto(double latitude, double longitude, String timestamp) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
        }
    }

    public static class GenerateReportRequest {
        public String reportType; // daily, weekly, monthly, custom
        public String startDate;
        public String endDate;
    }

    public static class GenerateReportResponse {
        public boolean success;
        public String message;
        public int reportId;
        public String reportType;
        public String generatedAt;

        public GenerateReportResponse(boolean success, String message, int reportId, String reportType,
                String generatedAt) {
            this.success = success;
            this.message = message;
            this.reportId = reportId;
            this.reportType = reportType;
            this.generatedAt = generatedAt;
        }
    }

    public static class ReportDto {
        public int reportId;
        public String reportType;
        public String generatedOn;
        public String data;

        public ReportDto(int reportId, String reportType, String generatedOn, String data) {
            this.reportId = reportId;
            this.reportType = reportType;
            this.generatedOn = generatedOn;
            this.data = data;
        }
    }

    public static class PairDeviceRequest {
        public String pairingCode;
        public String deviceSerial;
    }

    public static class PairDeviceResponse {
        public boolean success;
        public String message;
        public String pairingCode;

        public PairDeviceResponse(boolean success, String message, String pairingCode) {
            this.success = success;
            this.message = message;
            this.pairingCode = pairingCode;
        }
    }

    public static class GeneratePairingCodeResponse {
        public boolean success;
        public String message;
        public String code;

        public GeneratePairingCodeResponse(boolean success, String message, String code) {
            this.success = success;
            this.message = message;
            this.code = code;
        }
    }

    public static class SendMessageRequest {
        public String message;
    }

    public static class SendMessageResponse {
        public boolean success;
        public String message;
        public int messageId;
        public String sentAt;

        public SendMessageResponse(boolean success, String message, int messageId, String sentAt) {
            this.success = success;
            this.message = message;
            this.messageId = messageId;
            this.sentAt = sentAt;
        }
    }

    public static class MessageDto {
        public int messageId;
        public String content;
        public String sentAt;
        public String status;

        public MessageDto(int messageId, String content, String sentAt, String status) {
            this.messageId = messageId;
            this.content = content;
            this.sentAt = sentAt;
            this.status = status;
        }
    }

    public static class AlertDto {
        public int alertId;
        public int childId;
        public String type;
        public String message;
        public String timestamp;

        public AlertDto(int alertId, int childId, String type, String message, String timestamp) {
            this.alertId = alertId;
            this.childId = childId;
            this.type = type;
            this.message = message;
            this.timestamp = timestamp;
        }
    }

    public static class SubscribeAlertsResponse {
        public boolean success;
        public String message;

        public SubscribeAlertsResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    public static class AddEmergencyContactRequest {
        public String name;
        public String phoneNumber;
        public String relation;
    }

    public static class AddEmergencyContactResponse {
        public boolean success;
        public String message;
        public int contactId;

        public AddEmergencyContactResponse(boolean success, String message, int contactId) {
            this.success = success;
            this.message = message;
            this.contactId = contactId;
        }
    }

    public static class UpdateEmergencyContactRequest {
        public String name;
        public String phoneNumber;
        public String relation;
    }

    public static class UpdateEmergencyContactResponse {
        public boolean success;
        public String message;
        public int contactId;

        public UpdateEmergencyContactResponse(boolean success, String message, int contactId) {
            this.success = success;
            this.message = message;
            this.contactId = contactId;
        }
    }

    public static class DeleteEmergencyContactResponse {
        public boolean success;
        public String message;
        public int contactId;

        public DeleteEmergencyContactResponse(boolean success, String message, int contactId) {
            this.success = success;
            this.message = message;
            this.contactId = contactId;
        }
    }

    public static class EmergencyContactDto {
        public int contactId;
        public String name;
        public String phoneNumber;
        public String relation;

        public EmergencyContactDto(int contactId, String name, String phoneNumber, String relation) {
            this.contactId = contactId;
            this.name = name;
            this.phoneNumber = phoneNumber;
            this.relation = relation;
        }
    }

    public static class SendSosEmergencyRequest {
        public String message;
        public double latitude;
        public double longitude;
    }

    public static class SendSosEmergencyResponse {
        public boolean success;
        public String message;
        public int sosId;
        public String sentAt;

        public SendSosEmergencyResponse(boolean success, String message, int sosId, String sentAt) {
            this.success = success;
            this.message = message;
            this.sosId = sosId;
            this.sentAt = sentAt;
        }
    }
    public static class CancelSosEmergencyRequest {
        public int sosId;
    }


    public static class CancelSosEmergencyResponse {
        public boolean success;
        public String message;
        public int sosId;

        public CancelSosEmergencyResponse(boolean success, String message, int sosId) {
            this.success = success;
            this.message = message;
            this.sosId = sosId;
        }
    }

    public static class ConfirmSafetyResponse {
        public boolean success;
        public String message;

        public ConfirmSafetyResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    public static class DeactivateDeviceRequest {
        public boolean permanent;
    }

    public static class DeactivateDeviceResponse {
        public boolean success;
        public String message;
        public int childId;

        public DeactivateDeviceResponse(boolean success, String message, int childId) {
            this.success = success;
            this.message = message;
            this.childId = childId;
        }
    }

    public static class ReactivateDeviceResponse {
        public boolean success;
        public String message;
        public int childId;

        public ReactivateDeviceResponse(boolean success, String message, int childId) {
            this.success = success;
            this.message = message;
            this.childId = childId;
        }
    }

    public static class DeviceStatusDto {
        public int deviceId;
        public String status;
        public double batteryLevel;
        public boolean active;
        public String checkedAt;

        public DeviceStatusDto(int deviceId, String status, double batteryLevel, boolean active, String checkedAt) {
            this.deviceId = deviceId;
            this.status = status;
            this.batteryLevel = batteryLevel;
            this.active = active;
            this.checkedAt = checkedAt;
        }
    }

    public static class AddSafeZoneRequest {
        public String name;
        public double latitude;
        public double longitude;
        public double radius;
    }

    public static class AddSafeZoneResponse {
        public boolean success;
        public String message;
        public int zoneId;

        public AddSafeZoneResponse(boolean success, String message, int zoneId) {
            this.success = success;
            this.message = message;
            this.zoneId = zoneId;
        }
    }

    public static class SafeZoneDto {
        public int id;
        public String name;
        public double latitude;
        public double longitude;
        public double radius;

        public SafeZoneDto(int id, String name, double latitude, double longitude, double radius) {
            this.id = id;
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
            this.radius = radius;
        }
    }

    public static class DeleteSafeZoneResponse {
        public boolean success;
        public String message;
        public int zoneId;

        public DeleteSafeZoneResponse(boolean success, String message, int zoneId) {
            this.success = success;
            this.message = message;
            this.zoneId = zoneId;
        }
    }

    public static class AcknowledgeResponse {
        public boolean success;
        public String message;
        public int messageId;

        public AcknowledgeResponse(boolean success, String message, int messageId) {
            this.success = success;
            this.message = message;
            this.messageId = messageId;
        }
    }
}
