package com.bleat.services;

import com.bleat.models.Parent;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.ArrayList;

public class PendingUserService {
    private static PendingUserService instance;
    private Map<Integer, Parent> pending = new ConcurrentHashMap<>();

    private PendingUserService() {
    }

    public static synchronized PendingUserService getInstance() {
        if (instance == null)
            instance = new PendingUserService();
        return instance;
    }

    public void addPending(Parent p) {
        pending.put(p.getUserId(), p);
    }

    public Parent removePending(int userId) {
        return pending.remove(userId);
    }

    public List<Parent> listPending() {
        return new ArrayList<>(pending.values());
    }

    public boolean contains(int userId) {
        return pending.containsKey(userId);
    }
}
