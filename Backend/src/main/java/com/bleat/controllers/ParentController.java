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

    // ===== USE CASE 1: Generate Reports =====
    @PostMapping("/{parentId}/reports/generate")
    public GenerateReportResponse generateReport(@PathVariable int parentId,
            @RequestBody GenerateReportRequest request) {
        try {
            int reportId = (int) (System.currentTimeMillis() % 100000);
            Report report = new Report(parentId, request.reportType);
            reports.put(reportId, report);

            return new GenerateReportResponse(true, "Report generated successfully", reportId, request.reportType,
                    LocalDateTime.now().toString());
        } catch (Exception e) {
            return new GenerateReportResponse(false, e.getMessage(), -1, null, null);
        }
    }

    @GetMapping("/{parentId}/reports/{reportId}/download")
    public ReportDto downloadReport(@PathVariable int parentId, @PathVariable int reportId) {
        if (reports.containsKey(reportId)) {
            Report report = reports.get(reportId);
            return new ReportDto(reportId, report.getType(), report.getGeneratedOn().toString(),
                    "Report data in PDF format");
        }
        return null;
    }

    // ===== USE CASE 2: Pair Device =====
    @PostMapping("/{parentId}/child/{childId}/pair-device")
    public PairDeviceResponse pairDevice(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody PairDeviceRequest request) {
        try {
            String pairingCode = UUID.randomUUID().toString().substring(0, 8);

            Child child = children.get(childId);
            if (child == null) {
                return new PairDeviceResponse(false, "Child not found", null);
            }

            ChildDevice device = new ChildDevice((int) (System.currentTimeMillis() % 100000));
            child.linkDevice(device);
            deviceStatuses.put(device.getDeviceId(), "ACTIVE");

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
        List<ChildDto> childList = new ArrayList<>();
        for (Child child : children.values()) {
            childList.add(new ChildDto(child.getChildId(), child.getName(), child.getAge()));
        }
        return childList;
    }

    @PostMapping("/{parentId}/add-child")
    public AddChildResponse addChild(@PathVariable int parentId, @RequestBody AddChildRequest request) {
        try {
            int childId = (int) (System.currentTimeMillis() % 100000);
            Child child = new Child(childId, request.name, request.age);
            children.put(childId, child);
            return new AddChildResponse(true, "Child added successfully", childId);
        } catch (Exception e) {
            return new AddChildResponse(false, e.getMessage(), -1);
        }
    }

    @PutMapping("/{parentId}/child/{childId}/update")
    public UpdateChildResponse updateChild(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody UpdateChildRequest request) {
        try {
            Child child = children.get(childId);
            if (child == null) {
                return new UpdateChildResponse(false, "Child not found", childId);
            }
            child.updateDetails(request.name, request.age);
            return new UpdateChildResponse(true, "Child updated successfully", childId);
        } catch (Exception e) {
            return new UpdateChildResponse(false, e.getMessage(), childId);
        }
    }

    @DeleteMapping("/{parentId}/child/{childId}/delete")
    public DeleteChildResponse deleteChild(@PathVariable int parentId, @PathVariable int childId) {
        try {
            if (children.containsKey(childId)) {
                children.remove(childId);
                return new DeleteChildResponse(true, "Child deleted successfully", childId);
            }
            return new DeleteChildResponse(false, "Child not found", childId);
        } catch (Exception e) {
            return new DeleteChildResponse(false, e.getMessage(), childId);
        }
    }

    // ===== USE CASE 4: Track Child's Location =====
    @GetMapping("/{parentId}/child/{childId}/track-location")
    public LocationDto getChildLocation(@PathVariable int parentId, @PathVariable int childId) {
        Child child = children.get(childId);
        if (child != null && child.getDevice() != null) {
            Location loc = child.getDevice().getCurrentLocation();
            if (loc != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
                return new LocationDto(loc.getLatitude(), loc.getLongitude(), loc.getTimestamp().format(formatter));
            }
        }
        return null;
    }

    @GetMapping("/{parentId}/child/{childId}/location-history")
    public List<LocationDto> getLocationHistory(@PathVariable int parentId, @PathVariable int childId) {
        List<LocationDto> history = new ArrayList<>();
        Child child = children.get(childId);
        if (child != null && child.getDevice() != null) {
            for (Location loc : child.getDevice().getLocations()) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
                history.add(
                        new LocationDto(loc.getLatitude(), loc.getLongitude(), loc.getTimestamp().format(formatter)));
            }
        }
        return history;
    }

    // ===== USE CASE 5: Get Alerts (Safe Zone Violations) =====
    @GetMapping("/{parentId}/alerts")
    public List<AlertDto> getAlerts(@PathVariable int parentId) {
        List<AlertDto> alertList = new ArrayList<>();
        // In real app, fetch alerts from database
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
    public SendMessageResponse sendMessage(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody SendMessageRequest request) {
        try {
            int messageId = (int) (System.currentTimeMillis() % 100000);
            return new SendMessageResponse(true, "Message sent to child device", messageId,
                    LocalDateTime.now().toString());
        } catch (Exception e) {
            return new SendMessageResponse(false, e.getMessage(), -1, null);
        }
    }

    @GetMapping("/{parentId}/child/{childId}/messages")
    public List<MessageDto> getMessagesWithChild(@PathVariable int parentId, @PathVariable int childId) {
        List<MessageDto> messages = new ArrayList<>();
        // In real app, fetch from database
        return messages;
    }

    // ===== USE CASE 7: Manage Emergency Contacts =====
    @GetMapping("/{parentId}/child/{childId}/emergency-contacts")
    public List<EmergencyContactDto> getEmergencyContacts(@PathVariable int parentId, @PathVariable int childId) {
        List<EmergencyContactDto> contacts = new ArrayList<>();
        for (EmergencyContact contact : emergencyContacts.values()) {
            contacts.add(new EmergencyContactDto(contact.getContactId(), contact.getName(), contact.getPhone(),
                    contact.getRelation()));
        }
        return contacts;
    }

    @PostMapping("/{parentId}/child/{childId}/emergency-contact/add")
    public AddEmergencyContactResponse addEmergencyContact(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody AddEmergencyContactRequest request) {
        try {
            int contactId = (int) (System.currentTimeMillis() % 100000);
            EmergencyContact contact = new EmergencyContact(contactId, request.name, request.phoneNumber,
                    request.relation);
            emergencyContacts.put(contactId, contact);
            return new AddEmergencyContactResponse(true, "Emergency contact added", contactId);
        } catch (Exception e) {
            return new AddEmergencyContactResponse(false, e.getMessage(), -1);
        }
    }

    @PutMapping("/{parentId}/child/{childId}/emergency-contact/{contactId}/update")
    public UpdateEmergencyContactResponse updateEmergencyContact(@PathVariable int parentId, @PathVariable int childId,
            @PathVariable int contactId, @RequestBody UpdateEmergencyContactRequest request) {
        try {
            if (emergencyContacts.containsKey(contactId)) {
                // Update logic here
                return new UpdateEmergencyContactResponse(true, "Emergency contact updated", contactId);
            }
            return new UpdateEmergencyContactResponse(false, "Contact not found", contactId);
        } catch (Exception e) {
            return new UpdateEmergencyContactResponse(false, e.getMessage(), contactId);
        }
    }

    @DeleteMapping("/{parentId}/child/{childId}/emergency-contact/{contactId}/delete")
    public DeleteEmergencyContactResponse deleteEmergencyContact(@PathVariable int parentId, @PathVariable int childId,
            @PathVariable int contactId) {
        try {
            if (emergencyContacts.containsKey(contactId)) {
                emergencyContacts.remove(contactId);
                return new DeleteEmergencyContactResponse(true, "Emergency contact deleted", contactId);
            }
            return new DeleteEmergencyContactResponse(false, "Contact not found", contactId);
        } catch (Exception e) {
            return new DeleteEmergencyContactResponse(false, e.getMessage(), contactId);
        }
    }

    // ===== USE CASE 8: Send SOS to Emergency Services =====
    @PostMapping("/{parentId}/child/{childId}/sos/emergency-services")
    public SendSosEmergencyResponse sendSosToEmergencyServices(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody SendSosEmergencyRequest request) {
        try {
            int sosId = (int) (System.currentTimeMillis() % 100000);
            return new SendSosEmergencyResponse(true, "SOS sent to emergency services", sosId,
                    LocalDateTime.now().toString());
        } catch (Exception e) {
            return new SendSosEmergencyResponse(false, e.getMessage(), -1, null);
        }
    }

    @PostMapping("/{parentId}/child/{childId}/sos/cancel-emergency")
    public CancelSosEmergencyResponse cancelSosEmergency(@PathVariable int parentId, @PathVariable int childId,
            @PathVariable int sosId) {
        try {
            return new CancelSosEmergencyResponse(true, "SOS to emergency services cancelled", sosId);
        } catch (Exception e) {
            return new CancelSosEmergencyResponse(false, e.getMessage(), sosId);
        }
    }

    @PostMapping("/{parentId}/child/{childId}/safety-confirmed")
    public ConfirmSafetyResponse confirmSafety(@PathVariable int parentId, @PathVariable int childId) {
        try {
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
    public DeviceStatusDto getDeviceStatus(@PathVariable int parentId, @PathVariable int childId) {
        try {
            Child child = children.get(childId);
            if (child != null && child.getDevice() != null) {
                ChildDevice device = child.getDevice();
                return new DeviceStatusDto(device.getDeviceId(), device.getStatusString(), device.getBatteryLevel(),
                        device.isActive(), LocalDateTime.now().toString());
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // ===== USE CASE 11: Set Safe Zones =====
    @PostMapping("/{parentId}/child/{childId}/safe-zone/add")
    public AddSafeZoneResponse addSafeZone(@PathVariable int parentId, @PathVariable int childId,
            @RequestBody AddSafeZoneRequest request) {
        try {
            int zoneId = (int) (System.currentTimeMillis() % 100000);
            SafeZone zone = new SafeZone(zoneId, request.name, request.latitude, request.longitude, request.radius);
            safeZones.put(zoneId, zone);
            return new AddSafeZoneResponse(true, "Safe zone created", zoneId);
        } catch (Exception e) {
            return new AddSafeZoneResponse(false, e.getMessage(), -1);
        }
    }

    @GetMapping("/{parentId}/child/{childId}/safe-zones")
    public List<SafeZoneDto> getSafeZones(@PathVariable int parentId, @PathVariable int childId) {
        List<SafeZoneDto> zones = new ArrayList<>();
        for (SafeZone zone : safeZones.values()) {
            zones.add(new SafeZoneDto(zone.getId(), zone.getName(), zone.getLatitude(), zone.getLongitude(),
                    zone.getRadius()));
        }
        return zones;
    }

    @DeleteMapping("/{parentId}/child/{childId}/safe-zone/{zoneId}/delete")
    public DeleteSafeZoneResponse deleteSafeZone(@PathVariable int parentId, @PathVariable int childId,
            @PathVariable int zoneId) {
        try {
            if (safeZones.containsKey(zoneId)) {
                safeZones.remove(zoneId);
                return new DeleteSafeZoneResponse(true, "Safe zone deleted", zoneId);
            }
            return new DeleteSafeZoneResponse(false, "Safe zone not found", zoneId);
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

        public ChildDto(int id, String name, int age) {
            this.id = id;
            this.name = name;
            this.age = age;
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
        public String deviceId;
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
        public String type;
        public String message;
        public String timestamp;

        public AlertDto(int alertId, String type, String message, String timestamp) {
            this.alertId = alertId;
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
}
