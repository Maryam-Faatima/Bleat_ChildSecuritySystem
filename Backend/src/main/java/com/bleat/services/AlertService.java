package com.bleat.services;

import java.time.LocalDateTime;
import java.util.*;

public class AlertService {

    private static AlertService instance;

    private Map<Integer, SosAlert> alerts = new HashMap<>();

    private AlertService() {
    }

    public static synchronized AlertService getInstance() {
        if (instance == null)
            instance = new AlertService();
        return instance;
    }

    public static class SosAlert {
        public int sosId;
        public int childId;
        public int parentId;
        public String message;
        public Double latitude;
        public Double longitude;
        public String timestamp;
        public String status; // SENT, CANCELLED

        public SosAlert(int sosId, int childId, int parentId, String message, Double latitude, Double longitude,
                String timestamp, String status) {
            this.sosId = sosId;
            this.childId = childId;
            this.parentId = parentId;
            this.message = message;
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
            this.status = status;
        }
    }

    public SosAlert addAlert(int childId, int parentId, String message, Double latitude, Double longitude) {
        int id = com.bleat.models.DBHandler.createAlert(childId, parentId, message, latitude, longitude);
        if (id <= 0)
            return null;
        // Fetch the stored alert (including timestamp) from DB
        return com.bleat.models.DBHandler.getAlertById(id);
    }

    public boolean cancelAlert(int sosId) {
        return com.bleat.models.DBHandler.cancelAlert(sosId);
    }

    public List<SosAlert> listAlertsByParent(int parentId) {
        return com.bleat.models.DBHandler.listAlertsByParent(parentId);
    }

    public SosAlert getAlert(int sosId) {
        return com.bleat.models.DBHandler.getAlertById(sosId);
    }
}
