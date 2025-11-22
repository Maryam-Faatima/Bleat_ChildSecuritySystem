package com.bleat.controllers;

import org.springframework.web.bind.annotation.*;
import com.bleat.models.*;
import com.bleat.services.AuthenticationManager;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        try {
            // Use DB-backed login flows
            // 1) Try parent/admin user by username
            com.bleat.models.User u = com.bleat.models.DBHandler.loginByUsername(request.name, request.password);
            if (u != null) {
                if (u instanceof com.bleat.models.Admin) {
                    return new LoginResponse(true, "Login successful", u.getUserId(), u.getName(), "ADMIN");
                } else if (u instanceof com.bleat.models.Parent) {
                    return new LoginResponse(true, "Login successful", u.getUserId(), u.getName(), "PARENT");
                }
            }

            // 2) Try child login
            com.bleat.models.Child c = com.bleat.models.DBHandler.getChildByUsernameAndPassword(request.name,
                    request.password);
            if (c != null) {
                return new LoginResponse(true, "Login successful", c.getChildId(), c.getName(), "CHILD",
                        c.getParentId());
            }

            // Not found
            return new LoginResponse(false, "Invalid credentials or not approved yet", -1, null, null);
        } catch (Exception e) {
            return new LoginResponse(false, e.getMessage(), -1, null, null);
        }
    }

    @PostMapping("/signup")
    public SignupResponse signup(@RequestBody SignupRequest request) {
        try {
            if ("PARENT".equalsIgnoreCase(request.role)) {
                // Use username as a fallback email placeholder if none provided
                String email = request.name + "@local";
                boolean ok = com.bleat.models.DBHandler.signup(request.name, email, request.phoneNumber,
                        request.password, "PARENT");
                if (ok)
                    return new SignupResponse(true, "Parent signup received and is pending admin approval", -1);
                return new SignupResponse(false, "Signup failed (duplicate or DB error)", -1);
            } else if ("ADMIN".equalsIgnoreCase(request.role)) {
                return new SignupResponse(false, "Admin accounts cannot be created via signup", -1);
            }
            return new SignupResponse(false, "Invalid role", -1);
        } catch (Exception e) {
            return new SignupResponse(false, e.getMessage(), -1);
        }
    }

    private int generateUserId() {
        return (int) (System.currentTimeMillis() % 100000);
    }

    public static class LoginRequest {
        public String name;
        public String password;
    }

    public static class LoginResponse {
        public boolean success;
        public String message;
        public int userId;
        public String name;
        public String role;
        public int parentId;

        public LoginResponse(boolean success, String message, int userId, String name, String role) {
            this(success, message, userId, name, role, -1);
        }

        public LoginResponse(boolean success, String message, int userId, String name, String role, int parentId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
            this.name = name;
            this.role = role;
            this.parentId = parentId;
        }
    }

    public static class SignupRequest {
        public String name;
        public String password;
        public String phoneNumber;
        public String role;
    }

    public static class SignupResponse {
        public boolean success;
        public String message;
        public int userId;

        public SignupResponse(boolean success, String message, int userId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
        }
    }
}
