package com.bleat.controllers;

import org.springframework.web.bind.annotation.*;
import com.bleat.models.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static Map<Integer, Parent> parents = new HashMap<>();
    private static Map<Integer, String> auditLogs = new HashMap<>();

    // Public static method for AuthController to query parents
    public static java.util.Optional<Parent> getParentsByNameAndPassword(String name, String password) {
        return parents.values().stream()
                .filter(p -> p.getName().equals(name) && p.login(name, password))
                .findFirst();
    }

    // ===== USE CASE 1: Authenticate Users =====
    @GetMapping("/users/pending")
    public List<UserDto> getPendingUsers() {
        List<UserDto> pending = new ArrayList<>();
        for (Parent p : com.bleat.services.PendingUserService.getInstance().listPending()) {
            pending.add(new UserDto(p.getUserId(), p.getName(), "PENDING"));
        }
        return pending;
    }

    @PostMapping("/users/{userId}/authenticate")
    public AuthenticateUserResponse authenticateUser(@PathVariable int userId,
            @RequestBody AuthenticateUserRequest request) {
        try {
            if (!com.bleat.services.PendingUserService.getInstance().contains(userId)) {
                return new AuthenticateUserResponse(false, "User not found in pending list", userId);
            }

            Parent pending = com.bleat.services.PendingUserService.getInstance().removePending(userId);
            String status = request.approve ? "AUTHENTICATED" : "REJECTED";

            // Log audit
            recordAudit(userId, "User " + status + ": " + pending.getName());

            if (request.approve) {
                // Persist approved parent to the database store (parents map - acts as our DB)
                parents.put(pending.getUserId(), pending);
                // Also register in authentication manager and parent registry for redundancy
                com.bleat.services.AuthenticationManager.getInstance().addUser(pending.getUserId(), pending.getName());
                com.bleat.services.ParentRegistry.getInstance().addParent(pending);
                recordAudit(pending.getUserId(), "User approved and persisted to database");
            }

            return new AuthenticateUserResponse(true, "User " + status, userId);
        } catch (Exception e) {
            return new AuthenticateUserResponse(false, e.getMessage(), userId);
        }
    }

    @GetMapping("/audit-logs")
    public List<String> getAuditLogs() {
        return new ArrayList<>(auditLogs.values());
    }

    // ===== USE CASE 2: Manage Parents =====
    @GetMapping("/parents")
    public List<ParentDto> getAllParents() {
        List<ParentDto> parentList = new ArrayList<>();
        for (Parent p : parents.values()) {
            parentList.add(new ParentDto(p.getUserId(), p.getName(), p.getPhoneNumber(), "ACTIVE"));
        }
        return parentList;
    }

    @PostMapping("/parents/add")
    public AddParentResponse addParent(@RequestBody AddParentRequest request) {
        try {
            // Validate input
            if (request.name == null || request.name.isEmpty()) {
                return new AddParentResponse(false, "Invalid name", -1);
            }

            int parentId = (int) (System.currentTimeMillis() % 100000);
            Parent parent = new Parent(parentId, request.name, request.password, request.phoneNumber);
            parents.put(parentId, parent);

            recordAudit(parentId, "Parent added: " + request.name);

            return new AddParentResponse(true, "Parent added successfully", parentId);
        } catch (Exception e) {
            return new AddParentResponse(false, e.getMessage(), -1);
        }
    }

    @PutMapping("/parents/{parentId}/update")
    public UpdateParentResponse updateParent(@PathVariable int parentId, @RequestBody UpdateParentRequest request) {
        try {
            if (!parents.containsKey(parentId)) {
                return new UpdateParentResponse(false, "Parent not found", parentId);
            }

            Parent parent = parents.get(parentId);
            // Update fields as needed
            recordAudit(parentId, "Parent updated: " + parent.getName());

            return new UpdateParentResponse(true, "Parent updated successfully", parentId);
        } catch (Exception e) {
            return new UpdateParentResponse(false, e.getMessage(), parentId);
        }
    }

    @DeleteMapping("/parents/{parentId}/deactivate")
    public DeactivateParentResponse deactivateParent(@PathVariable int parentId) {
        try {
            if (!parents.containsKey(parentId)) {
                return new DeactivateParentResponse(false, "Parent not found", parentId);
            }

            parents.remove(parentId);
            recordAudit(parentId, "Parent deactivated");

            return new DeactivateParentResponse(true, "Parent deactivated successfully", parentId);
        } catch (Exception e) {
            return new DeactivateParentResponse(false, e.getMessage(), parentId);
        }
    }

    // Helper method
    private void recordAudit(int userId, String action) {
        int logId = (int) (System.currentTimeMillis() % 100000);
        auditLogs.put(logId, "[" + LocalDateTime.now() + "] User " + userId + ": " + action);
    }

    // ===== DTOs =====

    public static class UserDto {
        public int userId;
        public String name;
        public String status;

        public UserDto(int userId, String name, String status) {
            this.userId = userId;
            this.name = name;
            this.status = status;
        }
    }

    public static class AuthenticateUserRequest {
        public boolean approve;
        public String reason;
    }

    public static class AuthenticateUserResponse {
        public boolean success;
        public String message;
        public int userId;

        public AuthenticateUserResponse(boolean success, String message, int userId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
        }
    }

    public static class ParentDto {
        public int userId;
        public String name;
        public String phoneNumber;
        public String status;

        public ParentDto(int userId, String name, String phoneNumber, String status) {
            this.userId = userId;
            this.name = name;
            this.phoneNumber = phoneNumber;
            this.status = status;
        }
    }

    public static class AddParentRequest {
        public String name;
        public String password;
        public String phoneNumber;
    }

    public static class AddParentResponse {
        public boolean success;
        public String message;
        public int parentId;

        public AddParentResponse(boolean success, String message, int parentId) {
            this.success = success;
            this.message = message;
            this.parentId = parentId;
        }
    }

    public static class UpdateParentRequest {
        public String name;
        public String phoneNumber;
    }

    public static class UpdateParentResponse {
        public boolean success;
        public String message;
        public int parentId;

        public UpdateParentResponse(boolean success, String message, int parentId) {
            this.success = success;
            this.message = message;
            this.parentId = parentId;
        }
    }

    public static class DeactivateParentResponse {
        public boolean success;
        public String message;
        public int parentId;

        public DeactivateParentResponse(boolean success, String message, int parentId) {
            this.success = success;
            this.message = message;
            this.parentId = parentId;
        }
    }
}
