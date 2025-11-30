package com.bleat.services;

public class ParentService {

    private static ParentService instance;

    private ParentService() {}

    public static synchronized ParentService getInstance() {
        if (instance == null)
            instance = new ParentService();
        return instance;
    }

    // Store live location from child device
    public boolean persistLocation(int deviceId, double latitude, double longitude) {
        return com.bleat.models.DBHandler.storeLocationData(deviceId, latitude, longitude);
    }

    // Assign a device to a child
    //public boolean pairDeviceToChild(int childId, String deviceSerial) {
        //return com.bleat.models.DBHandler.pairDeviceToChild(childId, deviceSerial);
  //  }

    // Mark a device as inactive
    public boolean deactivateDevice(int deviceId) {
        return com.bleat.models.DBHandler.deactivateDevice(deviceId);
    }

    // Replace child's device with a new one
    public boolean replaceDevice(int childId, String newDeviceSerial) {
        return com.bleat.models.DBHandler.replaceDevice(childId, newDeviceSerial);
    }

    // Insert or update child safe zone
    public boolean setSafeZone(int childId, double lat, double lon, double radius) {
        return com.bleat.models.DBHandler.setSafeZone(childId, lat, lon, radius);
    }

    // Add new child under parent
    public boolean addChild(int parentId, String childName, int age) {
        return com.bleat.models.DBHandler.addChild(parentId, childName, age);
    }

    // Update child details
    public boolean updateChild(int childId, int parentId, String newName, int newAge) {
        return com.bleat.models.DBHandler.updateChild(childId, parentId, newName, newAge);
    }

    // Send message from parent → child
    public boolean sendMessageToChild(int parentId, int childId, String content) {
        return com.bleat.models.DBHandler.sendMessage(parentId, childId, content);
    }
}
