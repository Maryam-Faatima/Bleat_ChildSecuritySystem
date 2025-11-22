package com.bleat.services;

import java.util.HashMap;
import java.util.Map;

public class AuthenticationManager {
    private static AuthenticationManager instance;
    private Map<Integer, String> userStore = new HashMap<>(); // userId -> username

    private AuthenticationManager() {
        // seeded users for demo (in real app load from DB)
        userStore.put(1, "AliceParent");
        userStore.put(2, "BobAdmin");
    }

    public static synchronized AuthenticationManager getInstance() {
        if (instance == null) {
            instance = new AuthenticationManager();
        }
        return instance;
    }

    public boolean authenticate(String uname, String password) {
        // placeholder: real system must check hashed password
        return uname != null && password != null && password.length() >= 4;
    }

    public boolean authenticate(int userid) {
        return userStore.containsKey(userid);
    }

    public void addUser(int userId, String username) {
        userStore.put(userId, username);
    }

    public void removeUser(int userId) {
        userStore.remove(userId);
    }
}
