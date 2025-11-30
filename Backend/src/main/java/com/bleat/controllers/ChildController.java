package com.bleat.controllers;

import org.springframework.web.bind.annotation.*;
import com.bleat.models.*;
import com.bleat.models.DBHandler.LocationRecord;
import com.bleat.services.AlertService;

import java.util.*;

@RestController
@RequestMapping("/api/child")
@CrossOrigin(origins = "*")
public class ChildController {

    // =============================================================
    //                USE CASE 1: SEND SOS ALERT
    // =============================================================

    @PostMapping("/{childId}/sos")
    public SosAlertResponse sendSosAlert(
            @PathVariable int childId,
            @RequestBody SosAlertRequest request) {

        try {
            Child child = DBHandler.getChildById(childId);
            if (child == null)
                return new SosAlertResponse(false, "Child not found", -1, null);

            int parentId = child.getParentId();

            AlertService.SosAlert a =
                    AlertService.getInstance().addAlert(
                            childId,
                            parentId,
                            request != null ? request.message : null,
                            request != null ? request.latitude : null,
                            request != null ? request.longitude : null
                    );

            return new SosAlertResponse(
                    true,
                    "SOS alert sent",
                    a.sosId,
                    a.timestamp
            );

        } catch (Exception e) {
            return new SosAlertResponse(false, e.getMessage(), -1, null);
        }
    }

    // SOS HISTORY (from DB)
    @GetMapping("/{childId}/sos/history")
    public List<Alert> getSosHistory(@PathVariable int childId) {
        return DBHandler.getSosAlertHistory(childId);
    }

    // CANCEL SOS ALERT
    @PostMapping("/{childId}/sos/{alertId}/cancel")
    public CancelSosResponse cancelSos(@PathVariable int childId, @PathVariable int alertId) {
        try {
            boolean ok = DBHandler.cancelAlert(alertId);
            if (!ok)
                return new CancelSosResponse(false, "Alert not found or cannot be cancelled", alertId);

            return new CancelSosResponse(true, "SOS alert cancelled", alertId);
        } catch (Exception e) {
            return new CancelSosResponse(false, e.getMessage(), alertId);
        }
    }

    // =============================================================
    //                 USE CASE 2: SHARE LOCATION
    // =============================================================

    @PostMapping("/{childId}/location/share")
    public ShareLocationResponse shareLocation(
            @PathVariable int childId,
            @RequestBody LocationShareRequest req) {

        try {
            Child child = DBHandler.getChildById(childId);
            if (child == null)
                return new ShareLocationResponse(false, "Child not found", -1, 0, 0, null);

            Integer deviceId = DBHandler.getDeviceIdForChild(childId);
            if (deviceId == null)
                return new ShareLocationResponse(false, "Child has no paired device", -1, 0, 0, null);

            int locId = DBHandler.insertLocation(deviceId, req.latitude, req.longitude);

            // safe zone calculation
            List<SafeZone> zones = DBHandler.getSafeZonesForChild(childId);
            boolean inZone = DBHandler.isInsideAnySafeZone(req.latitude, req.longitude, zones);

            // trigger safe-zone exit alert
            Boolean wasInZone = DBHandler.getChildSafeZoneState(childId);
            if ((wasInZone == null || wasInZone) && !inZone) {
                DBHandler.saveSafeZoneExitAlert(childId);
            }

            DBHandler.updateChildSafeZoneState(childId, inZone);

            return new ShareLocationResponse(
                    true,
                    "Location shared",
                    locId,
                    req.latitude,
                    req.longitude,
                    new java.util.Date().toString()
            );

        } catch (Exception e) {
            return new ShareLocationResponse(false, e.getMessage(), -1, 0, 0, null);
        }
    }

    // LAST KNOWN LOCATION
    @GetMapping("/{childId}/location/last-known")
    public LocationDto getLastKnownLocation(@PathVariable int childId) {
    	Location last = DBHandler.getLastLocation(childId);
    	if (last != null) {
    	    return new LocationDto(last);
    	}
    	return null;
    }

    
    // LOCATION HISTORY
    @GetMapping("/{childId}/location/history")
    public List<LocationRecord> getLocationHistory(@PathVariable int childId) {
    	
        return DBHandler.getLocationHistory(childId);
    }

    // =============================================================
    //         USE CASE 6: CHILD VIEW MESSAGES FROM PARENT
    // =============================================================

    @GetMapping("/{childId}/messages")
    public List<DBHandler.MessageDto> getMessagesForChild(@PathVariable int childId) {
        try {
            return DBHandler.getMessagesForChild(childId);
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @PostMapping("/{childId}/messages/{messageId}/ack")
    public AcknowledgeResponse acknowledgeMessageAsChild(
            @PathVariable int childId,
            @PathVariable int messageId) {

        boolean ok = DBHandler.acknowledgeMessageByChild(messageId);
        return new AcknowledgeResponse(ok, ok ? "Acknowledged" : "Failed", messageId);
    }

    // =============================================================
    // DTOs
    // =============================================================

    public static class SosAlertRequest {
        public String message;
        public Double latitude;
        public Double longitude;
    }

    public static class SosAlertResponse {
        public boolean success;
        public String message;
        public int alertId;
        public String timestamp;
        public SosAlertResponse(boolean s, String m, int i, String t) {
            success = s; message = m; alertId = i; timestamp = t;
        }
    }

    public static class AlertDto {
        public int id; public String type; public String description; public String timestamp;
        public AlertDto(int id, String t, String d, String ts) {
            this.id=id; type=t; description=d; timestamp=ts;
        }
    }

    public static class CancelSosResponse {
        public boolean success; public String message; public int alertId;
        public CancelSosResponse(boolean s, String m, int i) {
            success=s; message=m; alertId=i;
        }
    }

    public static class LocationShareRequest {
        public double latitude;
        public double longitude;
    }

    public static class ShareLocationResponse {
        public boolean success; public String message;
        public int locationId; public double latitude; public double longitude;
        public String timestamp;
        public ShareLocationResponse(
                boolean s, String m, int lid, double lat, double lon, String ts) {
            success=s; message=m; locationId=lid; latitude=lat; longitude=lon; timestamp=ts;
        }
    }

    public static class MessageDto {
        public int messageId; public String content; public String sentAt; public String status;
        public MessageDto(int id,String c,String s,String st){
            messageId=id; content=c; sentAt=s; status=st;
        }
    }

    public static class AcknowledgeResponse {
        public boolean success; public String message; public int messageId;
        public AcknowledgeResponse(boolean s,String m,int id){
            success=s; message=m; messageId=id;
        }
    }
}
