package com.bleat.models;

import java.util.ArrayList;
import java.util.List;

public class Child {
    private int childId;
    private String name;
    private int age;
    private int parentId;
    private String username;
    private String password;
    private String status;
    private ChildDevice device;
    private List<EmergencyContact> emergencyContacts = new ArrayList<>();

    public Child(int childId, String name, int age) {
        this(childId, name, age, -1, null, null);
    }

    public Child(int childId, String name, int age, int parentId, String username, String password) {
        this.childId = childId;
        this.name = name;
        this.age = age;
        this.parentId = parentId;
        this.username = username;
        this.password = password;
        this.status = "OK";
    }
    public Child(int childId,  int parentId,String name, int age) {
        this.childId = childId;
        this.name = name;
        this.age = age;
        this.parentId = parentId;
        
        this.status = "OK";
    }

    public void updateDetails(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void linkDevice(ChildDevice device) {
        this.device = device;
    }

    public void unlinkDevice() {
        this.device = null;
    }

    public DeviceStatus getDeviceStatus() {
        if (device == null)
            return DeviceStatus.UNKNOWN;
        return device.getStatus();
    }

    public void addEmergencyContact(EmergencyContact c) {
        emergencyContacts.add(c);
    }

    public void removeEmergencyContact(int contactId) {
        emergencyContacts.removeIf(c -> c.getContactId() == contactId);
    }

    // getters
    public int getChildId() {
        return childId;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public int getParentId() {
        return parentId;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public ChildDevice getDevice() {
        return device;
    }

    public List<EmergencyContact> getEmergencyContacts() {
        return new ArrayList<>(emergencyContacts);
    }

    @Override
    public String toString() {
        return "Child{" +
                "childId=" + childId +
                ", name='" + name + '\'' +
                ", age=" + age +
                ", device=" + (device != null ? device.getDeviceId() : "none") +
                '}';
    }
}
