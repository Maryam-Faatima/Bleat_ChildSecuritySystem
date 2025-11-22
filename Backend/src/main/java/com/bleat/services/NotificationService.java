package com.bleat.services;

import com.bleat.models.Alert;
import com.bleat.models.Message;
import com.bleat.models.Parent;

public class NotificationService {
    private static NotificationService instance = new NotificationService();

    private NotificationService() {}

    public static NotificationService getInstance() {
        return instance;
    }

    public boolean sendAlert(Alert alert) {
        // placeholder — persist to DB or push notification
        System.out.println("NotificationService: sending alert: " + alert);
        return true;
    }

    public boolean sendMessage(Message message) {
        System.out.println("NotificationService: sending message: " + message);
        return true;
    }

    public void notifyParent(Parent parent, Alert alert) {
        if (parent == null) return;
        parent.receiveAlert(alert);
    }
}
