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
            // Try find approved parent by name and password in ParentRegistry
            java.util.Optional<com.bleat.models.Parent> parent = com.bleat.services.ParentRegistry.getInstance()
                    .findByNameAndPassword(request.name, request.password);
            if (parent.isPresent()) {
                return new LoginResponse(true, "Login successful", parent.get().getUserId(), parent.get().getName());
            }

            // Also check AdminController's parents map (approved users stored there)
            java.util.Optional<com.bleat.models.Parent> adminParent = AdminController
                    .getParentsByNameAndPassword(request.name, request.password);
            if (adminParent.isPresent()) {
                return new LoginResponse(true, "Login successful", adminParent.get().getUserId(),
                        adminParent.get().getName());
            }

            // fallback: allow admin seeded users via AuthenticationManager (by userId)
            try {
                int uid = Integer.parseInt(request.name);
                if (AuthenticationManager.getInstance().authenticate(uid)) {
                    return new LoginResponse(true, "Login successful", uid, "User_" + uid);
                }
            } catch (NumberFormatException ignore) {
            }

            return new LoginResponse(false, "Invalid credentials or not approved yet", -1, null);
        } catch (Exception e) {
            return new LoginResponse(false, e.getMessage(), -1, null);
        }
    }

    @PostMapping("/signup")
    public SignupResponse signup(@RequestBody SignupRequest request) {
        try {
            if ("PARENT".equals(request.role)) {
                int id = generateUserId();
                Parent parent = new Parent(id, request.name, request.password, request.phoneNumber);
                // add to pending list for admin approval
                com.bleat.services.PendingUserService.getInstance().addPending(parent);
                return new SignupResponse(true, "Parent signup pending admin approval", parent.getUserId());
            } else if ("ADMIN".equals(request.role)) {
                Admin admin = new Admin(generateUserId(), request.name, request.password);
                // Store in database
                return new SignupResponse(true, "Admin signup successful", admin.getUserId());
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

        public LoginResponse(boolean success, String message, int userId, String name) {
            this.success = success;
            this.message = message;
            this.userId = userId;
            this.name = name;
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
