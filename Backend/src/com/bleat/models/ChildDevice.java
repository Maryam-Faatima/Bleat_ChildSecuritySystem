package com.bleat.models;

import java.util.ArrayList;
import java.util.List;

public class ChildDevice {
    private int deviceId;
    private double batteryLevel;
    private String status;
    private boolean active;
    private List<Location> locations = new ArrayList<>();

    public ChildDevice(int deviceId) {
        this.deviceId = deviceId;
        this.batteryLevel = 100.0;
        this.status = "OK";
        this.active = true;
    }

    public void updateLocation(Location location) {
        if (location == null) return;
        locations.add(location);
        // simulate battery drain
        batteryLevel = Math.max(0.0, batteryLevel - 0.01);
    }

    public Location getCurrentLocation() {
        if (locations.isEmpty()) return null;
        return locations.get(locations.size() - 1);
    }

    public void deactivate() {
        active = false;
        status = "deactivated";
    }

    public DeviceStatus getStatus() {
        if (!active) return DeviceStatus.INACTIVE;
        if (batteryLevel < 10.0) return DeviceStatus.LOW_BATTERY;
        return DeviceStatus.ACTIVE;
    }

    public boolean isActive() { return active; }
    public int getDeviceId() { return deviceId; }
    public double getBatteryLevel() { return batteryLevel; }
    public String getStatusString() { return status; }
    public List<Location> getLocations() { return new ArrayList<>(locations); }

    @Override
    public String toString() {
        return "ChildDevice{" +
                "deviceId=" + deviceId +
                ", battery=" + batteryLevel +
                ", status='" + status + '\'' +
                ", active=" + active +
                '}';
    }
}
