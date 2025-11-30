package com.bleat.models;

/**
 * Factory Pattern Implementation for Report Generation
 * 
 * This factory creates different types of reports based on the reportType parameter.
 */
public class ReportFactory {
    
    public static Report createReport(String reportType, int parentId) {
        if (reportType == null || reportType.trim().isEmpty()) {
            throw new IllegalArgumentException("Report type cannot be null or empty");
        }
        
        // Convert to uppercase for case-insensitive comparison
        String type = reportType.trim().toUpperCase();
        
        switch (type) {
            // Time-based reports
            case "DAILY":
                return new DailyReport(parentId);
                
            case "WEEKLY":
                return new WeeklyReport(parentId);
                
            case "MONTHLY":
                return new MonthlyReport(parentId);
            
            // Content-based reports (your original types)
            case "ACTIVITY":
            case "ACTIVITY_REPORT":
                return new ActivityReport(parentId);
                
            case "LOCATION":
            case "LOCATION_HISTORY":
                return new LocationHistoryReport(parentId);
                
            case "ALERT":
            case "ALERT_SUMMARY":
                return new AlertSummaryReport(parentId);
                
            default:
                throw new IllegalArgumentException(
                    "Invalid report type: " + reportType + 
                    ". Supported types are: DAILY, WEEKLY, MONTHLY, ACTIVITY, LOCATION, ALERT"
                );
        }
    }
    
    public static boolean isValidReportType(String reportType) {
        if (reportType == null || reportType.trim().isEmpty()) {
            return false;
        }
        
        String type = reportType.trim().toUpperCase();
        return type.equals("DAILY") || type.equals("WEEKLY") || type.equals("MONTHLY") ||
               type.equals("ACTIVITY") || type.equals("ACTIVITY_REPORT") ||
               type.equals("LOCATION") || type.equals("LOCATION_HISTORY") ||
               type.equals("ALERT") || type.equals("ALERT_SUMMARY");
    }
}
