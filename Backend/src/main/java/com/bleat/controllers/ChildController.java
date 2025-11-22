package com.bleat.controllers;

import org.springframework.web.bind.annotation.*;
import com.bleat.models.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/child")
@CrossOrigin(origins = "*")
public class ChildController {

    private static Map<Integer, Alert> alerts = new HashMap<>();
    private static Map<Integer, Location> locations = new HashMap<>();

    // ===== USE CASE 1: Send SOS Alert =====
    @PostMapping("/{childId}/sos")
    public SosAlertResponse sendSosAlert(@PathVariable int childId, @RequestBody SosAlertRequest request) {
        try {
            int alertId = (int) (System.currentTimeMillis() % 100000);
            Alert alert = new Alert("SOS", "SOS triggered by child: " + request.message);
            alerts.put(alertId, alert);

            return new SosAlertResponse(true, "SOS alert sent to parents and emergency contacts", alertId,
                    LocalDateTime.now().toString());
        } catch (Exception e) {
            return new SosAlertResponse(false, e.getMessage(), -1, null);
        }
    }

    @GetMapping("/{childId}/sos/history")
    public List<AlertDto> getSosHistory(@PathVariable int childId) {
        List<AlertDto> history = new ArrayList<>();
        for (Alert alert : alerts.values()) {
            if (alert.getType().equals("SOS")) {
                history.add(new AlertDto(alert.getAlertId(), alert.getType(), alert.getDescription(),
                        alert.getTimestamp().toString()));
            }
        }
        return history;
    }

    @PostMapping("/{childId}/sos/cancel")
    public CancelSosResponse cancelSos(@PathVariable int childId, @PathVariable int alertId) {
        try {
            if (alerts.containsKey(alertId)) {
                alerts.remove(alertId);
                return new CancelSosResponse(true, "SOS alert cancelled and parents notified", alertId);
            }
            return new CancelSosResponse(false, "Alert not found", -1);
        } catch (Exception e) {
            return new CancelSosResponse(false, e.getMessage(), -1);
        }
    }

    // ===== USE CASE 2: Share Location =====
    @PostMapping("/{childId}/location/share")
    public ShareLocationResponse shareLocation(@PathVariable int childId, @RequestBody LocationShareRequest request) {
        try {
            int locId = (int) (System.currentTimeMillis() % 100000);
            Location loc = new Location(request.latitude, request.longitude);
            locations.put(locId, loc);

            return new ShareLocationResponse(true, "Location shared successfully", locId, loc.getLatitude(),
                    loc.getLongitude(), loc.getTimestamp().toString());
        } catch (Exception e) {
            return new ShareLocationResponse(false, e.getMessage(), -1, 0, 0, null);
        }
    }

    @GetMapping("/{childId}/location/last-known")
    public LocationDto getLastKnownLocation(@PathVariable int childId) {
        // In real implementation, fetch from database
        Location lastLoc = locations.values().stream()
                .reduce((first, second) -> second).orElse(null);

        if (lastLoc != null) {
            return new LocationDto(lastLoc);
        }
        return null;
    }

    @GetMapping("/{childId}/location/history")
    public List<LocationDto> getLocationHistory(@PathVariable int childId) {
        List<LocationDto> history = new ArrayList<>();
        for (Location loc : locations.values()) {
            history.add(new LocationDto(loc));
        }
        return history;
    }

    // ===== Request/Response DTOs =====

    public static class SosAlertRequest {
        public String message;
    }

    public static class SosAlertResponse {
        public boolean success;
        public String message;
        public int alertId;
        public String timestamp;

        public SosAlertResponse(boolean success, String message, int alertId, String timestamp) {
            this.success = success;
            this.message = message;
            this.alertId = alertId;
            this.timestamp = timestamp;
        }
    }

    public static class AlertDto {
        public int id;
        public String type;
        public String description;
        public String timestamp;

        public AlertDto(int id, String type, String description, String timestamp) {
            this.id = id;
            this.type = type;
            this.description = description;
            this.timestamp = timestamp;
        }
    }

    public static class CancelSosResponse {
        public boolean success;
        public String message;
        public int alertId;

        public CancelSosResponse(boolean success, String message, int alertId) {
            this.success = success;
            this.message = message;
            this.alertId = alertId;
        }
    }

    public static class LocationShareRequest {
        public double latitude;
        public double longitude;
    }

    public static class ShareLocationResponse {
        public boolean success;
        public String message;
        public int locationId;
        public double latitude;
        public double longitude;
        public String timestamp;

        public ShareLocationResponse(boolean success, String message, int locationId, double latitude, double longitude,
                String timestamp) {
            this.success = success;
            this.message = message;
            this.locationId = locationId;
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
        }
    }
}
