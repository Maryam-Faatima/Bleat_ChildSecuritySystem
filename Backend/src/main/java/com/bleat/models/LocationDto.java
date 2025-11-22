package com.bleat.models;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LocationDto {
    private double latitude;
    private double longitude;
    private String timestamp;

    public LocationDto(double latitude, double longitude, LocalDateTime timestamp) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp != null ? timestamp.format(DateTimeFormatter.ISO_DATE_TIME)
                : LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
    }

    public LocationDto(Location location) {
        this.latitude = location.getLatitude();
        this.longitude = location.getLongitude();
        this.timestamp = location.getTimestamp().format(DateTimeFormatter.ISO_DATE_TIME);
    }

    // getters
    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getTimestamp() {
        return timestamp;
    }

    // setters
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "LocationDto{" +
                "latitude=" + latitude +
                ", longitude=" + longitude +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
