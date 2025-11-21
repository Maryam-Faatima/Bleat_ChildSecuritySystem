package com.bleat.models;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

public class Report {
    private static final AtomicInteger ID_GEN = new AtomicInteger(1);

    private int reportId;
    private int generatedBy; // parent userId
    private LocalDateTime generatedOn;
    private String type; // e.g., "location_history", "alerts"

    public Report(int generatedBy, String type) {
        this.reportId = ID_GEN.getAndIncrement();
        this.generatedBy = generatedBy;
        this.type = type;
        this.generatedOn = LocalDateTime.now();
    }

    public String generate() {
        // In real system build proper content. Here just return a summary.
        return "Report[id=" + reportId + ", type=" + type + ", by=" + generatedBy + ", on=" + generatedOn + "]";
    }

    public boolean export(String format) {
        // supporting "pdf", "csv", "json" placeholders
        System.out.println("Exporting report " + reportId + " as " + format);
        return true;
    }

    // getters
    public int getReportId() { return reportId; }
    public int getGeneratedBy() { return generatedBy; }
    public LocalDateTime getGeneratedOn() { return generatedOn; }
    public String getType() { return type; }
}
