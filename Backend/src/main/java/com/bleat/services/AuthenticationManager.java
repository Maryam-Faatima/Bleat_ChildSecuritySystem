package com.bleat.services;

public class AuthenticationManager {
    private static AuthenticationManager instance;

    private AuthenticationManager() {
        // No in-memory/demo credentials. Authentication is delegated to the database.
    }

    public static synchronized AuthenticationManager getInstance() {
        if (instance == null) {
            instance = new AuthenticationManager();
        }
        return instance;
    }

    public boolean authenticate(String uname, String password) {
        if (uname == null || password == null)
            return false;
        // Delegate to DBHandler: check for parent/admin user by username
        com.bleat.models.User u = com.bleat.models.DBHandler.loginByUsername(uname, password);
        if (u != null)
            return true;
        // Try child login
        com.bleat.models.Child c = com.bleat.models.DBHandler.getChildByUsernameAndPassword(uname, password);
        return c != null;
    }

    public boolean authenticate(int userid) {
        return com.bleat.models.DBHandler.userExistsById(userid);
    }

    public void addUser(int userId, String username) {
        // no-op: persistence is handled by DB
    }

    public void removeUser(int userId) {
        // no-op: persistence is handled by DB
    }
}
