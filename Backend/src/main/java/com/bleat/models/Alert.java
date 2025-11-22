package com.bleat.models;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import com.bleat.services.NotificationService;

public class Alert {
    private static final AtomicInteger ID_GEN = new AtomicInteger(1);

    private int alertId;
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
