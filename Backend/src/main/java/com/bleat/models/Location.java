package com.bleat.models;

import java.time.LocalDateTime;

public class Location {
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;
    public Location() {
    	
    }
    public Location(double latitude, double longitude) {
        this(latitude, longitude, LocalDateTime.now());
    }

    public Location(double latitude, double longitude, LocalDateTime timestamp) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    public String getCoordinates() {
        return latitude + ", " + longitude;
    }

    // getters
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public LocalDateTime getTimestamp() { return timestamp; }

    @Override
    public String toString() {
        return "Location{" +
                "lat=" + latitude +
                ", long=" + longitude +
                ", ts=" + timestamp +
                '}';
    }
}
