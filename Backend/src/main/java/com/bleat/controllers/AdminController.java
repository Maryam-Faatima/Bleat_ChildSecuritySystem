package com.bleat.controllers;

import org.springframework.web.bind.annotation.*;
import com.bleat.models.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    // ==========================================================
    //                GET PENDING PARENTS (SQL)
    // ==========================================================
    @GetMapping("/users/pending")
    public List<UserDto> getPendingUsers() {
        List<UserDto> pending = new ArrayList<>();

        try {
            List<com.bleat.models.User> dbPending = DBHandler.listPendingParentRequests();

            for (com.bleat.models.User u : dbPending) {
                pending.add(new UserDto(u.getUserId(), u.getName(), "PENDING"));
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return pending;
    }

    // ==========================================================
    //           APPROVE OR REJECT A PARENT (SQL ONLY)
    // ==========================================================
    @PostMapping("/users/{userId}/authenticate")
    public AuthenticateUserResponse authenticateUser(
            @PathVariable int userId,
            @RequestBody AuthenticateUserRequest request) {

        try {
            String status = request.approve ? "APPROVED" : "REJECTED";

            boolean ok = request.approve
                    ? DBHandler.approveParent(userId)
                    : DBHandler.rejectParent(userId);

            if (!ok) {
                DBHandler.insertAuditLog(1, "Failed to authenticate parent: " + userId);
                return new AuthenticateUserResponse(false, "Database update failed", userId);
            }

            DBHandler.insertAuditLog(1, "User " + status + " (ParentId = " + userId + ")");

            return new AuthenticateUserResponse(true, "User " + status, userId);

        } catch (Exception e) {
            return new AuthenticateUserResponse(false, e.getMessage(), userId);
        }
    }

    // ==========================================================
    //                 LIST ALL PARENTS (SQL)
    // ==========================================================
    @GetMapping("/parents")
    public List<ParentDto> getAllParents() {
        List<ParentDto> list = new ArrayList<>();

        try {
            List<Map<String, Object>> rows = DBHandler.listAllParents();

            for (Map<String, Object> r : rows) {
                list.add(new ParentDto(
                        (int) r.get("UserId"),
                        (String) r.get("UserName"),
                        (String) r.get("Phone"),
                        ((boolean) r.get("IsAuthenticated")) ? "ACTIVE" : "PENDING"
                ));
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return list;
    }

    // ==========================================================
    //                  ADD NEW PARENT (SQL)
    // ==========================================================
    @PostMapping("/parents/add")
    public AddParentResponse addParent(@RequestBody AddParentRequest request) {
        try {
            if (request.name == null || request.name.isEmpty()) {
                return new AddParentResponse(false, "Invalid name", -1);
            }

            if (request.phoneNumber != null &&
                    !request.phoneNumber.matches("^[+]?\\d{7,15}$")) {
                return new AddParentResponse(false, "Invalid phone format", -1);
            }

            int userId = DBHandler.createUser(
                    request.name,
                    request.name + "@mail.com",
                    request.phoneNumber,
                    request.password,
                    "PARENT"
            );

            if (userId <= 0) {
                return new AddParentResponse(false, "Failed to create user", -1);
            }

            boolean parentRec = DBHandler.insertParentRecord(userId);
            boolean authReq = DBHandler.insertParentAuthRequest(userId);

            if (!parentRec || !authReq) {
                return new AddParentResponse(false, "Failed to create parent entry", -1);
            }

            DBHandler.insertAuditLog(1, "Parent added: " + request.name);

            return new AddParentResponse(true, "Parent created", userId);

        } catch (Exception e) {
            return new AddParentResponse(false, e.getMessage(), -1);
        }
    }

    // ==========================================================
    //            UPDATE PARENT PHONE NUMBER (SQL)
    // ==========================================================
    @PutMapping("/parents/{parentId}/update")
    public UpdateParentResponse updateParent(@PathVariable int parentId,
                                             @RequestBody UpdateParentRequest request) {

        try {
            if (request.phoneNumber == null ||
                    !request.phoneNumber.matches("^[+]?\\d{7,15}$")) {
                return new UpdateParentResponse(false, "Invalid phone number", parentId);
            }

            boolean ok = DBHandler.updateParentPhone(parentId, request.phoneNumber);

            if (!ok) {
                return new UpdateParentResponse(false, "Failed to update phone", parentId);
            }

            DBHandler.insertAuditLog(1, "Parent phone updated (ID = " + parentId + ")");

            return new UpdateParentResponse(true, "Phone updated", parentId);

        } catch (Exception e) {
            return new UpdateParentResponse(false, e.getMessage(), parentId);
        }
    }

    // ==========================================================
    //                  DEACTIVATE A PARENT (SQL)
    // ==========================================================
    @DeleteMapping("/parents/{parentId}/deactivate")
    public DeactivateParentResponse deactivateParent(@PathVariable int parentId) {

        try {
            boolean ok = DBHandler.deactivateParent(parentId);

            if (!ok) {
                return new DeactivateParentResponse(false, "Failed to deactivate parent", parentId);
            }

            DBHandler.insertAuditLog(1, "Parent deactivated (ID = " + parentId + ")");

            return new DeactivateParentResponse(true, "Parent deactivated", parentId);

        } catch (Exception e) {
            return new DeactivateParentResponse(false, e.getMessage(), parentId);
        }
    }

    // ==========================================================
    //                      AUDIT LOGS
    // ==========================================================
    @GetMapping("/audit-logs")
    public List<DBHandler.AuditLogRecord> getAuditLogs() {
        return DBHandler.listAuditLogs();
    }



    // ==========================================================
    //                    DTO CLASSES
    // ==========================================================
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
