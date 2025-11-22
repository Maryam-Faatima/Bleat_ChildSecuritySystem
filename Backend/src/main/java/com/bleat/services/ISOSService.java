package com.bleat.services;

import com.bleat.models.Child;
import com.bleat.models.Location;

public interface ISOSService {
    boolean triggerSOS(Child child);
    boolean notifyEmergencyServices(Location location);
    void cancelSOS(int childId);
}
