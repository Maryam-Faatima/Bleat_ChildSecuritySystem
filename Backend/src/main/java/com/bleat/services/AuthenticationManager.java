package com.bleat.services;

import com.bleat.models.*;

public class AuthenticationManager {

    private static AuthenticationManager instance;

    private AuthenticationManager() {
    }

    public static synchronized AuthenticationManager getInstance() {
        if (instance == null) {
            instance = new AuthenticationManager();
        }
        return instance;
    }

    // ─────────────────────────────────────────────────────────────
    //  DTOs
    // ─────────────────────────────────────────────────────────────

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
        public String role;   // ADMIN, PARENT, CHILD
        public int parentId;  // Used when role == CHILD

        public LoginResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  SIGNUP (DB ONLY)
    // ─────────────────────────────────────────────────────────────
    public SignupResult signup(String fullName, String email, String phone, String password, String role) {

        if (fullName == null || email == null || password == null || role == null) {
            return new SignupResult(false, "Missing required fields", -1);
        }

        // Check duplicates
        boolean exists = DBHandler.userExistsByEmailOrUsername(email, fullName);
        if (exists) {
            return new SignupResult(false, "Email or username already exists", -1);
        }

        // Create user
        int userId = DBHandler.createUser(fullName, email, phone, password, role);
        if (userId <= 0) {
            return new SignupResult(false, "Failed to create user", -1);
        }

        // If parent, create parent entry + authentication request
        if ("PARENT".equalsIgnoreCase(role)) {
            DBHandler.insertParentRecord(userId);
            DBHandler.insertParentAuthRequest(userId);

            return new SignupResult(true,
                    "Signup successful — awaiting admin approval",
                    userId);
        }

        // Admin created directly
        return new SignupResult(true, "Signup successful", userId);
    }

    // ─────────────────────────────────────────────────────────────
    //  LOGIN (DB ONLY — NO IN-MEMORY)
    // ─────────────────────────────────────────────────────────────
    public LoginResult login(String usernameOrEmail, String password) {

        if (usernameOrEmail == null || password == null) {
            return new LoginResult(false, "Missing credentials");
        }

        System.out.println("[Auth] login attempt: " + usernameOrEmail);

        // Developer fallback admin login
        if ("admin".equals(usernameOrEmail) && "1".equals(password)) {
            LoginResult r = new LoginResult(true, "Login successful");
            r.id = 0;
            r.name = "admin";
            r.role = "ADMIN";
            return r;
        }

        // ─────────────────────────────────────────────
        //  1) Try Admin or Parent
        // ─────────────────────────────────────────────
        User u = DBHandler.loginByUsername(usernameOrEmail, password);
        if (u != null) {

            if (u instanceof Parent) {
                int pid = u.getUserId();
               
                boolean approved = DBHandler.isParentAuthenticated(pid);

                if (!approved) {
                    return new LoginResult(false,
                            "Your account is pending admin approval.");
                }

                LoginResult r = new LoginResult(true, "Login successful");
                r.id = pid;
                r.name = u.getName();
                r.role = "PARENT";
                r.parentId = pid;
                return r;
            }

            if (u instanceof Admin) {
                LoginResult r = new LoginResult(true, "Login successful");
                r.id = u.getUserId();
                r.name = u.getName();
                r.role = "ADMIN";
                return r;
            }
        }

        // ─────────────────────────────────────────────
        //  2) Try Child login
        // ─────────────────────────────────────────────
        Child c = DBHandler.getChildByUsernameAndPassword(usernameOrEmail, password);
        if (c != null) {
            LoginResult r = new LoginResult(true, "Login successful");
            r.id = c.getChildId();
            r.name = c.getName();
            r.role = "CHILD";
            r.parentId = c.getParentId();
            return r;
        }

        // ─────────────────────────────────────────────
        //  No match in DB
        // ─────────────────────────────────────────────
        return new LoginResult(false, "Invalid credentials");
    }

    // ─────────────────────────────────────────────────────────────
    //  VERIFY USER EXISTS (DB ONLY)
    // ─────────────────────────────────────────────────────────────
    public boolean authenticate(int userId) {
        return DBHandler.userExistsById(userId);
    }

    // No in-memory
    public void addUser(int userId, String username) { }
    public void removeUser(int userId) { }
}
