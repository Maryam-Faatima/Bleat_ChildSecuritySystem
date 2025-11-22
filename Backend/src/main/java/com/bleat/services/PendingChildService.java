package com.bleat.services;

import com.bleat.models.Child;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.ArrayList;

public class PendingChildService {
    private static PendingChildService instance;
    private Map<Integer, Child> pending = new ConcurrentHashMap<>();

    private PendingChildService() {
    }

    public static synchronized PendingChildService getInstance() {
        if (instance == null)
            instance = new PendingChildService();
        return instance;
    }

    public void addPending(Child c) {
        pending.put(c.getChildId(), c);
    }

    public Child removePending(int childId) {
        return pending.remove(childId);
    }

    public List<Child> listPending() {
        return new ArrayList<>(pending.values());
    }

    public boolean contains(int childId) {
        return pending.containsKey(childId);
    }
}
