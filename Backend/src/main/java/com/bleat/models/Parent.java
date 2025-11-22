package com.bleat.models;

import com.bleat.services.SOSService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class Parent extends User {
    private String phoneNumber;
    private List<Child> children = new ArrayList<>();
    private List<Message> messages = new ArrayList<>();
    private List<Alert> alerts = new ArrayList<>();

    public Parent(int userId, String name, String password, String phoneNumber) {
        super(userId, name, password);
        this.phoneNumber = phoneNumber;
    }

    public void manageChild(Child child) {
        // add or update
        Optional<Child> existing = children.stream().filter(c -> c.getChildId() == child.getChildId()).findFirst();
        if (existing.isPresent()) {
            children.remove(existing.get());
        }
        children.add(child);
    }

    public void manageEmergencyContact(int childId, EmergencyContact contact) {
        for (Child c : children) {
            if (c.getChildId() == childId) {
                c.addEmergencyContact(contact);
                return;
            }
        }
    }

    public void sendMessage(int childId, String content) {
        Message msg = new Message(content);
        messages.add(msg);

        Child child = getChildById(childId);
        if (child != null && child.getDevice() != null) {
            boolean ok = msg.sendToDevice(child.getDevice());
            if (ok) System.out.println("Message delivered to child device.");
            else System.out.println("Failed to send message to device.");
        } else {
            System.out.println("Child or device not found.");
        }
    }

    public Location trackChildLocation(int childId) {
        Child child = getChildById(childId);
        if (child == null || child.getDevice() == null) return null;
        return child.getDevice().getCurrentLocation();
    }

    public boolean deactivateDevice(int deviceId) {
        for (Child c : children) {
            ChildDevice d = c.getDevice();
            if (d != null && d.getDeviceId() == deviceId) {
                d.deactivate();
                return true;
            }
        }
        return false;
    }

    public List<Alert> getAlerts() {
        return new ArrayList<>(alerts);
    }

    public boolean sendSOS(int childId) {
        Child child = getChildById(childId);
        if (child == null) return false;
        return SOSService.getInstance().sendSOS(this, child);
    }

    public Report generateReport(String type, String timeframe) {
        Report r = new Report(this.userId, type + " (" + timeframe + ")");
        // normally populate with real data
        return r;
    }

    public DeviceStatus viewDeviceStatus(int deviceId) {
        for (Child c : children) {
            ChildDevice d = c.getDevice();
            if (d != null && d.getDeviceId() == deviceId) {
                return d.getStatus();
            }
        }
        return DeviceStatus.UNKNOWN;
    }

    private Child getChildById(int id) {
        return children.stream().filter(c -> c.getChildId() == id).findFirst().orElse(null);
    }

    // small helper to receive an alert (used by NotificationService)
    public void receiveAlert(Alert alert) {
        alerts.add(alert);
        System.out.println("Parent " + name + " received alert: " + alert);
    }

    // getters
    public String getPhoneNumber() { return phoneNumber; }
    public List<Child> getChildren() { return new ArrayList<>(children); }
    public List<Message> getMessages() { return new ArrayList<>(messages); }

    @Override
    public String toString() {
        return "Parent{" +
                "userId=" + userId +
                ", name='" + name + '\'' +
                ", phone='" + phoneNumber + '\'' +
                '}';
    }
}
