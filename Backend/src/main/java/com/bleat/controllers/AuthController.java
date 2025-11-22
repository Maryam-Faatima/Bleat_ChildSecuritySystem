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
            // Strict admin check: only literal username 'admin' with password '1' grants ADMIN
            if ("admin".equals(request.name) && "1".equals(request.password)) {
                return new LoginResponse(true, "Admin login successful", 0, "admin", "ADMIN");
            }

            // Try find approved parent by name and password in ParentRegistry
            java.util.Optional<com.bleat.models.Parent> parent = com.bleat.services.ParentRegistry.getInstance()
                    .findByNameAndPassword(request.name, request.password);
            if (parent.isPresent()) {
                return new LoginResponse(true, "Login successful", parent.get().getUserId(), parent.get().getName(),
                        "PARENT");
            }

                // Check for approved child accounts
                java.util.Optional<com.bleat.models.Child> child = com.bleat.controllers.ParentController
                    .getChildByUsernameAndPassword(request.name, request.password);
                if (child.isPresent()) {
                    return new LoginResponse(true, "Login successful", child.get().getChildId(), child.get().getName(),
                            "CHILD", child.get().getParentId());
                }

            // Also check AdminController's parents map (approved users stored there) and treat as PARENT
            java.util.Optional<com.bleat.models.Parent> adminParent = AdminController
                    .getParentsByNameAndPassword(request.name, request.password);
            if (adminParent.isPresent()) {
                // Even if stored in AdminController parents map, treat non-admin credentials as PARENT
                return new LoginResponse(true, "Login successful", adminParent.get().getUserId(),
                        adminParent.get().getName(), "PARENT");
            }

            // Fallback: check AuthenticationManager by numeric id (rare dev case)
            try {
                int uid = Integer.parseInt(request.name);
                if (AuthenticationManager.getInstance().authenticate(uid)) {
                    return new LoginResponse(true, "Login successful", uid, "User_" + uid, "PARENT");
                }
            } catch (NumberFormatException ignore) {
            }

            return new LoginResponse(false, "Invalid credentials or not approved yet", -1, null, null);
        } catch (Exception e) {
            return new LoginResponse(false, e.getMessage(), -1, null, null);
        }
    }

    @PostMapping("/signup")
    public SignupResponse signup(@RequestBody SignupRequest request) {
        try {
            if ("PARENT".equals(request.role)) {
                // Create parent and add to pending users for admin authentication
                int id = generateUserId();
                Parent parent = new Parent(id, request.name, request.password, request.phoneNumber);
                com.bleat.services.PendingUserService.getInstance().addPending(parent);
                return new SignupResponse(true, "Parent signup received and is pending admin approval", parent.getUserId());
            } else if ("ADMIN".equals(request.role)) {
                // Disallow public admin creation in this demo
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
