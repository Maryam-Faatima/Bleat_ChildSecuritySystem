package com.bleat.app;

import com.bleat.models.*;
import com.bleat.services.AuthenticationManager;
import com.bleat.services.NotificationService;
import com.bleat.services.SOSService;

public class App {
    public static void main(String[] args) {
        // Create parent and child
        Parent parent = new Parent(1, "AliceParent", "pass1234", "+923001234567");
        Child child = new Child(101, "Sam", 8);
        ChildDevice device = new ChildDevice(9001);
        child.linkDevice(device);

        // add an emergency contact
        child.addEmergencyContact(new EmergencyContact(1, "Uncle Joe", "+923009876543", "Uncle"));

        // parent manages child
        parent.manageChild(child);

        // update location
        device.updateLocation(new Location(24.8607, 67.0011)); // Karachi

        // parent tracks child
        Location loc = parent.trackChildLocation(101);
        System.out.println("Tracked location: " + loc);

        // send message
        parent.sendMessage(101, "Dinner at 7. Be home!");

        // SOS
        parent.sendSOS(101);

        // Admin and audit
        Admin admin = new Admin(2, "BobAdmin", "adminpass");
        AuditLog.recordAction(admin.getUserId(), "Viewed parent accounts");
        admin.viewAuditLog();

        // Authentication manager demo
        AuthenticationManager am = AuthenticationManager.getInstance();
        System.out.println("Auth userId 1 exists? " + am.authenticate(1));

        // Notification service demo
        NotificationService.getInstance().sendAlert(new Alert("info", "This is a test alert"));

        // generate report
        Report r = parent.generateReport("location_history", "last_7_days");
        System.out.println(r.generate());
    }
}
