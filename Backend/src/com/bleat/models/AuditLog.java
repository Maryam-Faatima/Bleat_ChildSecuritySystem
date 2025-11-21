package com.bleat.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class AuditLog {
    private static final AtomicInteger ID_GEN = new AtomicInteger(1);
    private static final List<AuditLog> LOGS = new ArrayList<>();

    private int logId;
    private int adminId;
    private String action;
    private LocalDateTime timestamp;

    public AuditLog(int adminId, String action) {
        this.logId = ID_GEN.getAndIncrement();
        this.adminId = adminId;
        this.action = action;
        this.timestamp = LocalDateTime.now();
        LOGS.add(this);
    }

    public static void recordAction(int adminId, String action) {
        new AuditLog(adminId, action);
    }

    public static List<AuditLog> getLogs() {
        return new ArrayList<>(LOGS);
    }

    public int getLogId() { return logId; }
    public int getAdminId() { return adminId; }
    public String getAction() { return action; }
    public LocalDateTime getTimestamp() { return timestamp; }

    @Override
    public String toString() {
        return "AuditLog{" +
                "id=" + logId +
                ", adminId=" + adminId +
                ", action='" + action + '\'' +
                ", ts=" + timestamp +
                '}';
    }
}
