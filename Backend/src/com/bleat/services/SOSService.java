package com.bleat.services;

import com.bleat.models.Child;
import com.bleat.models.EmergencyContact;
import com.bleat.models.Location;
import com.bleat.models.Parent;
import com.bleat.models.Alert;

import java.util.List;

public class SOSService implements ISOSService {
    private static SOSService instance = new SOSService();

    private SOSService() {}

    public static SOSService getInstance() {
        return instance;
    }

    @Override
    public boolean triggerSOS(Child child) {
        if (child == null) return false;
        Location loc = child.getDevice() != null ? child.getDevice().getCurrentLocation() : null;
        // notify emergency contacts
        List<EmergencyContact> contacts = child.getEmergencyContacts();
        for (EmergencyContact c : contacts) {
            notifyEmergencyServices(loc); // placeholder
            System.out.println("Notifying emergency contact " + c.getName() + " at " + c.getPhone());
        }
        return true;
    }

    @Override
    public boolean notifyEmergencyServices(Location location) {
        // In real implementation call external API. Here just print.
        System.out.println("Notifying emergency services. Location: " + (location != null ? location : "unknown"));
        return true;
    }

    @Override
    public void cancelSOS(int childId) {
        System.out.println("SOS cancelled for child " + childId);
    }

    // convenience method used by Parent
    public boolean sendSOS(Parent parent, Child child) {
        if (parent == null || child == null) return false;
        Alert alert = new Alert("SOS", "SOS triggered for child " + child.getName());
        // send alert to parent
        parent.receiveAlert(alert);
        // trigger contacts and emergency services
        triggerSOS(child);
        return true;
    }
}
