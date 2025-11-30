package com.bleat.models;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import com.bleat.services.NotificationService;

public class Alert {
    private static final AtomicInteger ID_GEN = new AtomicInteger(1);

    private int alertId;
    private int parentId;
    private int childId;
    private int deviceId;
    private String type;
    private String description;
    private LocalDateTime timestamp;
    private boolean isAcknowledged;

    public Alert(String type, String description) {
        this.alertId = ID_GEN.getAndIncrement();
        this.type = type;
        this.description = description;
        this.timestamp = LocalDateTime.now();
        this.isAcknowledged = false;
    }
    public Alert(int alertid,int pid,int cid,int did,String type,String desc,Timestamp timestamp2,Boolean isack) {
    	this.alertId=alertid;
    	this.type = type;
    	this.parentId = pid;
    	   this.childId = cid;
    	   this.deviceId = did;
        this.description = desc;
        this.timestamp = LocalDateTime.now();
        this.isAcknowledged = false;
    }
    public Alert(int alertId, int parentId, int childId, Integer deviceId,
            String type, String description,
            LocalDateTime timestamp, boolean isAcknowledged) {

   this.alertId = alertId;
   this.parentId = parentId;
   this.childId = childId;
   this.deviceId = deviceId;
   this.type = type;
   this.description = description;
   this.timestamp = timestamp;
   this.isAcknowledged = isAcknowledged;
}
    public void acknowledge() {
        this.isAcknowledged = true;
    }

    public void sendToParent(Parent parent) {
        // rely on NotificationService
        NotificationService.getInstance().sendAlert(this);
        NotificationService.getInstance().notifyParent(parent, this);
    }

    // getters
    public int getAlertId() { return alertId; }
    public String getType() { return type; }
    public String getDescription() { return description; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public boolean isAcknowledged() { return isAcknowledged; }

    @Override
    public String toString() {
        return "Alert{" +
                "id=" + alertId +
                ", type='" + type + '\'' +
                ", desc='" + description + '\'' +
                ", ts=" + timestamp +
                ", ack=" + isAcknowledged +
                '}';
    }
}
