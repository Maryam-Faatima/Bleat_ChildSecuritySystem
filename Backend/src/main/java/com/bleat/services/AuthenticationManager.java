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

    public static class SignupResult {
        public boolean success;
        public String message;
        public int userId;

        public SignupResult(boolean success, String message, int userId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
        }
    }

    public static class LoginResult {
        public boolean success;
        public String message;
        public int id;
        public String name;
        public String role; // ADMIN, PARENT, CHILD
        public int parentId = -1; // for child

        public LoginResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    public SignupResult signup(String fullName, String email, String phone, String password, String role) {
        if (fullName == null || password == null || role == null)
            return new SignupResult(false, "Missing required fields", -1);

        // Use DBHandler helpers
        boolean exists = com.bleat.models.DBHandler.userExistsByEmailOrUsername(email, fullName);
        if (exists)
            return new SignupResult(false, "Email or username already exists", -1);

        int userId = com.bleat.models.DBHandler.createUser(fullName, email, phone, password, role);
        if (userId <= 0)
            return new SignupResult(false, "Failed to create user", -1);

        if ("PARENT".equalsIgnoreCase(role)) {
            com.bleat.models.DBHandler.insertParentRecord(userId);
            com.bleat.models.DBHandler.insertParentAuthRequest(userId);
            return new SignupResult(true, "Parent signup received and is pending admin approval", userId);
        }

        return new SignupResult(true, "Signup successful", userId);
    }

    public LoginResult login(String nameOrUsername, String password) {
        if (nameOrUsername == null || password == null)
            return new LoginResult(false, "Missing credentials");

        // 1) Try parent/admin by username
        com.bleat.models.User u = com.bleat.models.DBHandler.loginByUsername(nameOrUsername, password);
        if (u != null) {
            if (u instanceof com.bleat.models.Parent) {
                int uid = u.getUserId();
                boolean auth = com.bleat.models.DBHandler.isParentAuthenticated(uid);
                if (!auth) {
                    // queue auth request
                    com.bleat.models.DBHandler.insertParentAuthRequest(uid);
                    LoginResult r = new LoginResult(false, "Parent not yet authenticated by admin");
                    return r;
                }
                LoginResult r = new LoginResult(true, "Login successful");
                r.id = u.getUserId();
                r.name = u.getName();
                r.role = "PARENT";
                return r;
            } else {
                LoginResult r = new LoginResult(true, "Login successful");
                r.id = u.getUserId();
                r.name = u.getName();
                r.role = "ADMIN";
                return r;
            }
        }

        // 2) Try child login
        com.bleat.models.Child c = com.bleat.models.DBHandler.getChildByUsernameAndPassword(nameOrUsername, password);
        if (c != null) {
            LoginResult r = new LoginResult(true, "Login successful");
            r.id = c.getChildId();
            r.name = c.getName();
            r.role = "CHILD";
            r.parentId = c.getParentId();
            return r;
        }

        return new LoginResult(false, "Invalid credentials or not approved yet");
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
