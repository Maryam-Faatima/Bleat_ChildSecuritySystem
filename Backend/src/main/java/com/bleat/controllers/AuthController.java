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
            // Delegate to AuthenticationManager
            com.bleat.services.AuthenticationManager.LoginResult res = com.bleat.services.AuthenticationManager
                    .getInstance().login(request.name, request.password);
            if (res.success) {
                if ("CHILD".equalsIgnoreCase(res.role))
                    return new LoginResponse(true, res.message, res.id, res.name, "CHILD", res.parentId);
                return new LoginResponse(true, res.message, res.id, res.name, res.role);
            }
            return new LoginResponse(false, res.message, -1, null, null);
        } catch (Exception e) {
            return new LoginResponse(false, e.getMessage(), -1, null, null);
        }
    }

    @PostMapping("/signup")
    public SignupResponse signup(@RequestBody SignupRequest request) {
        try {
            // Delegate to AuthenticationManager
            String email = request.name + "@local";
            com.bleat.services.AuthenticationManager.SignupResult sr = com.bleat.services.AuthenticationManager
                    .getInstance().signup(request.name, email,
                            request.phoneNumber, request.password, request.role);
            return new SignupResponse(sr.success, sr.message, sr.userId);
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
