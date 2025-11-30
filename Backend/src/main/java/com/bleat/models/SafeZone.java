package com.bleat.models;

public class SafeZone {
    private int id;
    private String name;
    private double latitude;
    private double longitude;
    private double radius; // in meters

    public SafeZone(int id, double latitude, double longitude, double radius) {
        this.id = id;
       this.name="Zone"+id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radius = radius;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getRadius() {
        return radius;
    }

    @Override
    public String toString() {
        return "SafeZone{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", lat=" + latitude +
                ", lon=" + longitude +
                ", radius=" + radius +
                '}';
    }
}
