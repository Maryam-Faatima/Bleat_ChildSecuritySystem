package com.bleat.services;

import com.bleat.models.DBHandler;
import java.util.List;

public class AlertService {

    private static AlertService instance;

    private AlertService() {}

    public static synchronized AlertService getInstance() {
        if (instance == null)
            instance = new AlertService();
        return instance;
    }

    // DTO returned by DBHandler
    public static class SosAlert {
        public int sosId;
        public int childId;
        public int parentId;
        public String type;
        public String message;
        public Double latitude;
        public Double longitude;
        public String timestamp;
        public String status;

        public SosAlert(int sosId, int childId, int parentId, String type, String message,
                        Double latitude, Double longitude,
                        String timestamp, String status) {
            this.sosId = sosId;
            this.childId = childId;
            this.parentId = parentId;
            this.type = type;
            this.message = message;
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
            this.status = status;
        }
    }

    // CREATE SOS ALERT (Type = SOS)
    public SosAlert addAlert(int childId, int parentId, String message, Double latitude, Double longitude) {
    	int alertId = DBHandler.createAlert(parentId, childId, null, "SOS", message, latitude, longitude);

        if (alertId <= 0) return null;
        return DBHandler.getAlertById(alertId);
    }

    // CREATE A TYPED ALERT (SafeZone, BatteryLow, DeviceOffline, etc)
    public SosAlert addAlertWithType(int childId, int parentId, String type, String message,
                                     Double latitude, Double longitude) {
        int id = DBHandler.createAlert(parentId, childId, null, "SOS", message, latitude, longitude);
        if (id <= 0) return null;
        return DBHandler.getAlertById(id);
    }

    // CANCEL ALERT
    public boolean cancelAlert(int sosId) {
        return DBHandler.cancelAlert(sosId);
    }

    // FETCH ALL ALERTS FOR PARENT
    public List<SosAlert> listAlertsByParent(int parentId) {
        return DBHandler.listAlertsByParent(parentId);
    }

    // GET SINGLE ALERT
    public SosAlert getAlert(int sosId) {
        return DBHandler.getAlertById(sosId);
    }
}
