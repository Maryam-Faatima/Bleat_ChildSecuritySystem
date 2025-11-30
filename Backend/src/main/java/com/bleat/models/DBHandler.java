
package com.bleat.models;
import java.time.LocalDateTime;

import java.sql.*;
import java.util.*;
import com.bleat.models.*;
import com.bleat.services.AlertService;

public class DBHandler {

    

    private static final String URL =
            "jdbc:sqlserver://localhost:1433;"
          + "databaseName=BLEAT;"
          + "encrypt=false;"
          + "trustServerCertificate=true;";

    private static final String USER = "javauser1";
    private static final String PASS = "Please1";

    static {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            System.out.println("[DBHandler] Using SQL Server at " + URL);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load SQL Server JDBC driver", e);
        }
    }

    // Central connection provider
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    // ─────────────────────────────────────────────────────────────
    //  USER HELPERS FOR CLEANER CODE
    // ─────────────────────────────────────────────────────────────

    private static void closeQuietly(AutoCloseable c) {
        if (c == null) return;
        try { c.close(); } catch (Exception ignored) {}
    }

    // ─────────────────────────────────────────────────────────────
    //  SECTION 1 — USER & ACCOUNT MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    /** Checks if a user exists based on email or username */
    public static boolean userExistsByEmailOrUsername(String email, String username) {
        String sql = """
            SELECT COUNT(*) 
            FROM [dbo].[Users]
            WHERE Email = ? OR UserName = ?
        """;

        try (Connection conn = getConnection(); 
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ps.setString(2, username);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1) > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return true; 
        }
        return false;
    }

    /** Creates a user (ADMIN or PARENT) **/
    public static int createUser(String fullName, String email, String phone, String password, String role) {
        String sql = """
            INSERT INTO [dbo].[Users]
            (UserName, PasswordHash, Role, Email, Phone)
            VALUES (?, ?, ?, ?, ?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, fullName);
            ps.setString(2, password);
            ps.setString(3, role.toUpperCase());
            ps.setString(4, email);
            ps.setString(5, phone);

            int rows = ps.executeUpdate();
            if (rows == 0) return -1;

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    /** Insert into Parents table after user creation */
    public static boolean insertParentRecord(int userId) {
        String sql = """
            INSERT INTO [dbo].[Parents] (ParentId)
            VALUES (?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /** Create parent authentication request */
    public static boolean insertParentAuthRequest(int userId) {
        String sql = """
            INSERT INTO [dbo].[ParentAuthRequests] (ParentId)
            VALUES (?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /** Login by email/password */
    public static User login(String email, String password) {
        String sql = """
            SELECT u.UserId, u.UserName, u.Role, u.Phone, p.IsAuthenticated
            FROM [dbo].[Users] u
            LEFT JOIN [dbo].[Parents] p ON u.UserId = p.ParentId
            WHERE u.Email = ? AND u.PasswordHash = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                int uid = rs.getInt("UserId");
                String uname = rs.getString("UserName");
                String role = rs.getString("Role");
                String phone = rs.getString("Phone");

                if (role.equalsIgnoreCase("PARENT")) {
                    return new Parent(uid, uname, password, phone);
                } else {
                    return new Admin(uid, uname, password);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────
    //  LOGIN BY USERNAME (PARENT/ADMIN)
    // ─────────────────────────────────────────────────────────────
    public static User loginByUsername(String username, String password) {

        String sql = """
            SELECT u.UserId, u.UserName, u.Role, u.Phone, p.IsAuthenticated
            FROM [dbo].[Users] u
            LEFT JOIN [dbo].[Parents] p ON u.UserId = p.ParentId
            WHERE u.UserName = ? AND u.PasswordHash = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
            	
                int uid = rs.getInt("UserId");
                String uname = rs.getString("UserName");
                String role = rs.getString("Role");
                String phone = rs.getString("Phone");

                if (role.equalsIgnoreCase("PARENT")) {
                    return new Parent(uid, uname, password, phone);
                } else {
                    return new Admin(uid, uname, password);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }


    // ─────────────────────────────────────────────────────────────
    //  CHILD LOGIN
    // ─────────────────────────────────────────────────────────────
    public static Child getChildByUsernameAndPassword(String username, String password) {

        String sql = """
            SELECT ChildId, Name, Age, ParentId, Name, Passwords
            FROM [dbo].[Children]
            WHERE Name = ? AND Passwords = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new Child(
                        rs.getInt("ChildId"),
                        rs.getString("Name"),
                        rs.getInt("Age"),
                        rs.getInt("ParentId"),
                        rs.getString("Name"),
                        rs.getString("Passwords")
                );
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    public static class ReportFull {
        public int reportId;
        public String type;
        public String generatedOn;
        public String content;

        public ReportFull(int reportId, String type, String generatedOn, String content) {
            this.reportId = reportId;
            this.type = type;
            this.generatedOn = generatedOn;
            this.content = content;
        }
    }
    public static ReportFull getReportFull(int reportId) {
        String sql = """
            SELECT ReportId, ReportType, GeneratedOn, Content 
            FROM Reports
            WHERE ReportId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, reportId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new ReportFull(
                        rs.getInt("ReportId"),
                        rs.getString("ReportType"),
                        rs.getString("GeneratedOn"),
                        rs.getString("Content")
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────
    //  CREATE CHILD WITH CREDENTIALS
    // ─────────────────────────────────────────────────────────────
    

    public static boolean acknowledgeMessageByChild(int messageId) {

        String sql = """
            UPDATE Messages
            SET Status = 'seen'
            WHERE MessageId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, messageId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    // ─────────────────────────────────────────────────────────────
    //  UPDATE CHILD
    // ─────────────────────────────────────────────────────────────
    public static boolean updateChild(int childId, int parentId, String newName, int newAge) {

        String sql = """
            UPDATE [dbo].[Children]
            SET Name = ?, Age = ?
            WHERE ChildId = ? AND ParentId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newName);
            ps.setInt(2, newAge);
            ps.setInt(3, childId);
            ps.setInt(4, parentId);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  ADD CHILD (BASIC)
    // ─────────────────────────────────────────────────────────────
    public static boolean addChild(int parentId, String name, int age) {

        String sql = """
            INSERT INTO [dbo].[Children] (ParentId, Name, Age)
            VALUES (?, ?, ?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);
            ps.setString(2, name);
            ps.setInt(3, age);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  LIST ALL CHILDREN
    // ─────────────────────────────────────────────────────────────
    public static List<Child> listAllChildren() {

        String sql = """
            SELECT ChildId, Name, Age, ParentId, Username, PasswordHash
            FROM [dbo].[Children]
        """;

        List<Child> out = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {

                out.add(new Child(
                        rs.getInt("ChildId"),
                        rs.getString("Name"),
                        rs.getInt("Age"),
                        rs.getInt("ParentId"),
                        rs.getString("Username"),
                        rs.getString("PasswordHash")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return out;
    }


    // ─────────────────────────────────────────────────────────────
    //  DEVICE PAIRING
    // ─────────────────────────────────────────────────────────────
    public static boolean pairDeviceToChild(int deviceId, int childId) {

        String clearOldDevice = "UPDATE Devices SET ChildId = NULL WHERE ChildId = ?";
        String clearDeviceFromOtherChild = "UPDATE Devices SET ChildId = NULL WHERE DeviceId = ? AND ChildId IS NOT NULL";
        String assignDevice = "UPDATE Devices SET ChildId = ?, AssignedAt = SYSDATETIME() WHERE DeviceId = ?";

        try (Connection conn = getConnection()) {

            // 1. Clear any device currently paired with this child
            try (PreparedStatement ps = conn.prepareStatement(clearOldDevice)) {
                ps.setInt(1, childId);
                ps.executeUpdate();
            }

            // 2. Clear any child currently using this device
            try (PreparedStatement ps = conn.prepareStatement(clearDeviceFromOtherChild)) {
                ps.setInt(1, deviceId);
                ps.executeUpdate();
            }

            // 3. Assign device to child
            try (PreparedStatement ps = conn.prepareStatement(assignDevice)) {
                ps.setInt(1, childId);
                ps.setInt(2, deviceId);

                return ps.executeUpdate() > 0;
            }

        } catch (Exception e) {
            System.out.println("pairDeviceToChild() failed: " + e.getMessage());
            return false;
        }
    }



    // ─────────────────────────────────────────────────────────────
    //  DEACTIVATE DEVICE
    // ─────────────────────────────────────────────────────────────
    public static boolean deactivateDevice(int deviceId) {

        String sql = """
            UPDATE [dbo].[Devices]
            SET ChildId = NULL, Active = 0
            WHERE DeviceId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, deviceId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  REPLACE DEVICE
    // ─────────────────────────────────────────────────────────────
    public static boolean replaceDevice(int childId, String newSerial) {

        String findOld = """
            SELECT DeviceId
            FROM Devices
            WHERE ChildId = ?
        """;

        String deactivateOld = """
            UPDATE Devices
            SET Active = 0, ChildId = NULL
            WHERE DeviceId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement psFind = conn.prepareStatement(findOld);
             PreparedStatement psDeactivate = conn.prepareStatement(deactivateOld)) {

            // 1. Find old paired device
            psFind.setInt(1, childId);
            ResultSet rs = psFind.executeQuery();

            if (rs.next()) {
                int oldDeviceId = rs.getInt("DeviceId");
                // 2. Deactivate old device and unassign it
                psDeactivate.setInt(1, oldDeviceId);
                psDeactivate.executeUpdate();
            }

            // 3. Check if new device exists
            Integer newDeviceId = getDeviceIdBySerial(newSerial);

            // 4. Auto-create new device if needed
            if (newDeviceId == null) {
                newDeviceId = createDevice(newSerial);
                if (newDeviceId == null) {
                    return false; // failed to create
                }
            }

            // 5. Pair the new device to the child
            return pairDeviceToChild(newDeviceId, childId);

        } catch (Exception e) {
            System.out.println("replaceDevice() failed: " + e.getMessage());
            return false;
        }
    }


    // ─────────────────────────────────────────────────────────────
    //  SEND MESSAGE (Parent → Child or Child → Parent)
    // ─────────────────────────────────────────────────────────────
    public static boolean sendMessage(int parentId, int childId, String content, String senderRole) {

        String sql = """
            INSERT INTO [dbo].[Messages] (ParentId, ChildId, Content, SenderRole, Status)
            VALUES (?, ?, ?, ?, 'pending')
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);
            ps.setInt(2, childId);
            ps.setString(3, content);
            ps.setString(4, senderRole);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  GET MESSAGES FOR PARENT
    // ─────────────────────────────────────────────────────────────
    public static List<Message> getMessagesForParent(int parentId) {

        String sql = """
            SELECT MessageId, ParentId, ChildId, Content, Timestamp, Status, SenderRole
            FROM [dbo].[Messages]
            WHERE ParentId = ?
            ORDER BY Timestamp DESC
        """;

        List<Message> out = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {

                out.add(new Message(
                        rs.getString("Content")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return out;
    }


    // ─────────────────────────────────────────────────────────────
    //  MARK MESSAGE AS DELIVERED
    // ─────────────────────────────────────────────────────────────
    public static boolean markMessageDelivered(int messageId) {

        String sql = """
            UPDATE [dbo].[Messages]
            SET Status = 'delivered'
            WHERE MessageId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, messageId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  ALERT: CREATE ALERT
    // ─────────────────────────────────────────────────────────────
    public static boolean createAlert(int parentId, Integer childId, Integer deviceId,
                                      String alertType, String description) {

        String sql = """
            INSERT INTO [dbo].[Alerts] (ParentId, ChildId, DeviceId, AlertType, Description)
            VALUES (?, ?, ?, ?, ?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);
            if (childId != null) ps.setInt(2, childId); else ps.setNull(2, Types.INTEGER);
            if (deviceId != null) ps.setInt(3, deviceId); else ps.setNull(3, Types.INTEGER);
            ps.setString(4, alertType);
            ps.setString(5, description);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }

    public static boolean sendMessage(int parentId, int childId, String content) {

        String sql = """
            INSERT INTO Messages (ParentId, ChildId, Content, SenderRole, Status)
            VALUES (?, ?, ?, 'PARENT', 'pending')
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);
            ps.setInt(2, childId);
            ps.setString(3, content);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    public static boolean storeLocationData(int deviceId, double lat, double lng) {

        String sql = """
            INSERT INTO Locations (DeviceId, Latitude, Longitude)
            VALUES (?, ?, ?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, deviceId);
            ps.setDouble(2, lat);
            ps.setDouble(3, lng);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────
    //  GET ALERTS FOR PARENT
    // ─────────────────────────────────────────────────────────────
    public static List<Alert> getAlertsForParent(int parentId) {

        String sql = """
            SELECT AlertId, ParentId, ChildId, DeviceId, AlertType, Description, Timestamp, IsAcknowledged
            FROM [dbo].[Alerts]
            WHERE ParentId = ?
            ORDER BY Timestamp DESC
        """;

        List<Alert> out = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {

                out.add(new Alert(
                        rs.getString("AlertType"),
                        rs.getString("Description")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return out;
    }


    // ─────────────────────────────────────────────────────────────
    //  ACKNOWLEDGE ALERT
    // ─────────────────────────────────────────────────────────────
    public static boolean acknowledgeAlert(int alertId) {

        String sql = """
            UPDATE [dbo].[Alerts]
            SET IsAcknowledged = 1
            WHERE AlertId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, alertId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  SAFE ZONES: ADD
    // ─────────────────────────────────────────────────────────────
   
    // ─────────────────────────────────────────────────────────────
    //  SAFE ZONES: GET BY CHILD
    // ─────────────────────────────────────────────────────────────
    
    // ─────────────────────────────────────────────────────────────
    //  AUDIT LOGS — Insert Log Entry
    // ─────────────────────────────────────────────────────────────
    public static boolean insertAuditLog(int adminUserId, String actionText) {

        String sql = """
            INSERT INTO [dbo].[AuditLogs] (AdminUserId, ActionText)
            VALUES (?, ?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, adminUserId);
            ps.setString(2, actionText);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  AUDIT LOGS — Get All Logs
    // ─────────────────────────────────────────────────────────────
    public static List<AuditLog> getAuditLogs() {

        String sql = """
            SELECT LogId, AdminUserId, ActionText, Timestamp
            FROM [dbo].[AuditLogs]
            ORDER BY Timestamp DESC
        """;

        List<AuditLog> logs = new ArrayList<>();

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {

                logs.add(new AuditLog(
                        rs.getInt("AdminUserId"),
                        rs.getString("ActionText")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return logs;
    }


    // ─────────────────────────────────────────────────────────────
    //  REPORTS — Insert Report
    // ─────────────────────────────────────────────────────────────
    public static boolean insertReport(int parentId, String reportType) {

        String sql = """
            INSERT INTO [dbo].[Reports] (GeneratedBy, ReportType)
            VALUES (?, ?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);
            ps.setString(2, reportType);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // ─────────────────────────────────────────────────────────────
// REPORTS — Get Reports For Parent
// ─────────────────────────────────────────────────────────────
public static List<Report> getReports(int parentId) {
    String sql = """
    SELECT ReportId, GeneratedBy, ReportType, GeneratedOn
    FROM [dbo].[Reports]
    WHERE GeneratedBy = ?
    ORDER BY GeneratedOn DESC
    """;
    
    List<Report> out = new ArrayList<>();
    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, parentId);
        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            // Use ReportFactory instead of direct instantiation
            try {
                Report report = ReportFactory.createReport(
                    rs.getString("ReportType"), 
                    rs.getInt("GeneratedBy")
                );
                out.add(report);
            } catch (IllegalArgumentException e) {
                System.out.println("Warning: Invalid report type in database: " + 
                                   rs.getString("ReportType"));
            }
        }
    } catch (SQLException e) {
        e.printStackTrace();
    }
    
    return out;
}

    public static class DeviceStatusDto {
        public int deviceId;
        public String status;
        public double batteryLevel;
        public boolean active;
        public String checkedAt;

        public DeviceStatusDto(int deviceId, String status, double batteryLevel, boolean active, String checkedAt) {
            this.deviceId = deviceId;
            this.status = status;
            this.batteryLevel = batteryLevel;
            this.active = active;
            this.checkedAt = checkedAt;
        }
    }
    public static DeviceStatusDto getDeviceStatus(int childId) throws Exception {
        String sql = "SELECT DeviceId, Status, BatteryLevel, Active, AssignedAt FROM Devices WHERE ChildId = ?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, childId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new DeviceStatusDto(
                    rs.getInt("DeviceId"),
                    rs.getString("Status"),
                    rs.getDouble("BatteryLevel"),
                    rs.getBoolean("Active"),
                    rs.getTimestamp("AssignedAt").toString()
                );
            }
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  LOCATIONS — Insert New Device Location
    // ─────────────────────────────────────────────────────────────
   

    // ─────────────────────────────────────────────────────────────
    //  LOCATIONS — Get LAST Known Location For Device
    // ─────────────────────────────────────────────────────────────
    public static Location getLastLocation(int deviceId) {

        String sql = """
            SELECT TOP 1 LocationId, DeviceId, Latitude, Longitude, Timestamp
            FROM [dbo].[Locations]
            WHERE DeviceId = ?
            ORDER BY Timestamp DESC
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, deviceId);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return new Location(
                        rs.getDouble("Latitude"),
                        rs.getDouble("Longitude")
                );
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }


    // ─────────────────────────────────────────────────────────────
    //  PARENT AUTH REQUESTS — Insert Request
    // ─────────────────────────────────────────────────────────────
    public static boolean createParentAuthRequest(int parentId) {

        String sql = """
            INSERT INTO [dbo].[ParentAuthRequests] (ParentId)
            VALUES (?)
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, parentId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }


    // ─────────────────────────────────────────────────────────────
    //  PARENT AUTH REQUESTS — Approve / Reject
    // ─────────────────────────────────────────────────────────────
    public static boolean updateParentAuthRequest(int requestId, String status) {

        String sql = """
            UPDATE [dbo].[ParentAuthRequests]
            SET Status = ?
            WHERE RequestId = ?
        """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, requestId);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return false;
    }
 // ─────────────────────────────────────────────────────────────
//  ADMIN CONTROLLER SUPPORTING METHODS (REQUIRED)
// ─────────────────────────────────────────────────────────────

/** Return list of pending parent requests */
public static List<User> listPendingParentRequests() {
    String sql = """
        SELECT u.UserId, u.UserName, u.PasswordHash, u.Phone
        FROM ParentAuthRequests r
        JOIN Users u ON r.ParentId = u.UserId
        WHERE r.Status = 'PENDING' OR r.Status IS NULL
    """;

    List<User> list = new ArrayList<>();

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        while (rs.next()) {
            int id = rs.getInt("UserId");
            String name = rs.getString("UserName");
            String pass = rs.getString("PasswordHash");
            String phone = rs.getString("Phone");
            list.add(new Parent(id, name, pass, phone));
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return list;
}

/** Mark a parent as authenticated (Approve / Reject) */
public static boolean setParentAuthenticated(int parentId, boolean authenticated) {
    String sql = """
        UPDATE Parents
        SET IsAuthenticated = ?
        WHERE ParentId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, authenticated ? 1 : 0);
        ps.setInt(2, parentId);
        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return false;
}

/** Count total users */
public static int countUsers() {
    String sql = "SELECT COUNT(*) FROM Users";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        if (rs.next()) return rs.getInt(1);

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return 0;
}

/** Count pending parent authentication requests */
public static int countParentAuthRequests() {
    String sql = """
        SELECT COUNT(*)
        FROM ParentAuthRequests
        WHERE Status = 'PENDING' OR Status IS NULL
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        if (rs.next()) return rs.getInt(1);

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return 0;
}

/** Sample pending parent authentication rows */
public static List<Map<String, Object>> sampleParentAuthRows(int limit) {
    String sql = """
        SELECT TOP (?) r.RequestId, r.ParentId, r.Status, u.UserName, u.Email
        FROM ParentAuthRequests r
        JOIN Users u ON r.ParentId = u.UserId
        ORDER BY r.RequestId DESC
    """;

    List<Map<String, Object>> out = new ArrayList<>();

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, limit);

        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            Map<String, Object> row = new HashMap<>();
            row.put("RequestId", rs.getInt("RequestId"));
            row.put("ParentId", rs.getInt("ParentId"));
            row.put("Status", rs.getString("Status"));
            row.put("UserName", rs.getString("UserName"));
            row.put("Email", rs.getString("Email"));
            out.add(row);
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return out;
}
public static int saveReport(int parentId, String type, String content) {
    String sql = """
        INSERT INTO Reports (GeneratedBy, ReportType, Content)
        VALUES (?, ?, ?)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        ps.setInt(1, parentId);
        ps.setString(2, type);
        ps.setString(3, content);

        int rows = ps.executeUpdate();
        if (rows == 0) return -1;

        ResultSet rs = ps.getGeneratedKeys();
        if (rs.next()) return rs.getInt(1);

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return -1;
}
public static String getReportContent(int reportId) {
    String sql = """
        SELECT Content FROM Reports WHERE ReportId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, reportId);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            return rs.getString("Content");
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return null;
}
public static class ReportSummary {
    public int reportId;
    public String type;
    public String generatedOn;

    public ReportSummary(int reportId, String type, String generatedOn) {
        this.reportId = reportId;
        this.type = type;
        this.generatedOn = generatedOn;
    }
}
public static List<ReportSummary> listReportsByParent(int parentId) {

    String sql = """
        SELECT ReportId, ReportType, GeneratedOn
        FROM Reports
        WHERE GeneratedBy = ?
        ORDER BY GeneratedOn DESC
    """;

    List<ReportSummary> list = new ArrayList<>();

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            list.add(new ReportSummary(
                    rs.getInt("ReportId"),
                    rs.getString("ReportType"),
                    rs.getString("GeneratedOn")
            ));
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return list;
}
public static boolean acknowledgeMessageByParent(int messageId) {

    String sql = """
        UPDATE Messages
        SET Status = 'seen'
        WHERE MessageId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, messageId);
        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}
public static boolean persistLocation(int deviceId, double lat, double lng) {

    String sql = """
        INSERT INTO Locations (DeviceId, Latitude, Longitude)
        VALUES (?, ?, ?)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, deviceId);
        ps.setDouble(2, lat);
        ps.setDouble(3, lng);

        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}
public static boolean setSafeZone(int childId, double lat, double lng, double radius) {

    String sql = """
        INSERT INTO SafeZones (ChildId, Latitude, Longitude, Radius)
        VALUES (?, ?, ?, ?)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ps.setDouble(2, lat);
        ps.setDouble(3, lng);
        ps.setDouble(4, radius);

        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}

public static int createSosAlert(int parentId, int childId, String description, Double lat, Double lng) {
    String sql = """
        INSERT INTO Alerts (ParentId, ChildId, AlertType, Description, Timestamp)
        VALUES (?, ?, 'SOS', ?, SYSUTCDATETIME())
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        String desc = description;
        if (lat != null && lng != null) {
            desc += " | Location: (" + lat + ", " + lng + ")";
        }

        ps.setInt(1, parentId);
        ps.setInt(2, childId);
        ps.setString(3, desc);

        int rows = ps.executeUpdate();
        if (rows == 0) return -1;

        ResultSet rs = ps.getGeneratedKeys();
        if (rs.next()) return rs.getInt(1);

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return -1;
}
public static boolean cancelSos(int alertId) {
    String sql = """
        UPDATE Alerts
        SET IsAcknowledged = 1,
            Description = CONCAT(ISNULL(Description,''), ' | CANCELLED by parent')
        WHERE AlertId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, alertId);
        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}
public static boolean confirmSafety(int parentId, int childId) {
    String sql = """
        INSERT INTO Alerts (ParentId, ChildId, AlertType, Description, Timestamp)
        VALUES (?, ?, 'SAFETY_CONFIRMED', 'Parent confirmed child is safe', SYSUTCDATETIME())
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ps.setInt(2, childId);

        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}


//─────────────────────────────────────────────────────────────
//ALERTS — CREATE ALERT (RETURNS GENERATED ID)
//─────────────────────────────────────────────────────────────
public static int createAlert(
        int parentId,
        Integer childId,
        Integer deviceId,
        String alertType,
        String description,
        Double latitude,
        Double longitude
) {

    String sql = """
        INSERT INTO Alerts (ParentId, ChildId, DeviceId, AlertType, Description, Timestamp, IsAcknowledged)
        VALUES (?, ?, ?, ?, ?, SYSUTCDATETIME(), 0)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        ps.setInt(1, parentId);

        if (childId == null) ps.setNull(2, Types.INTEGER);
        else ps.setInt(2, childId);

        if (deviceId == null) ps.setNull(3, Types.INTEGER);
        else ps.setInt(3, deviceId);

        ps.setString(4, alertType);
        ps.setString(5, description);

        ps.executeUpdate();

        ResultSet keys = ps.getGeneratedKeys();
        if (keys.next()) {
            return keys.getInt(1);
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return -1;
}



//─────────────────────────────────────────────────────────────
//ALERTS — FETCH ONE ALERT BY ID
//─────────────────────────────────────────────────────────────
public static AlertService.SosAlert getAlertById(int alertId) {

    String sql = """
         SELECT AlertId, ParentId, ChildId, DeviceId, AlertType, Description,
                Timestamp, IsAcknowledged
         FROM Alerts
         WHERE AlertId = ?
     """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, alertId);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            return new AlertService.SosAlert(
                rs.getInt("AlertId"),
                rs.getInt("ChildId"),
                rs.getInt("ParentId"),
                rs.getString("AlertType"),
                rs.getString("Description"),
                null,            // latitude (not stored)
                null,            // longitude (not stored)
                rs.getString("Timestamp"),
                rs.getInt("IsAcknowledged") == 1 ? "ACK" : "SENT"
            );
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return null;
}



//─────────────────────────────────────────────────────────────
//ALERTS — LIST ALERTS FOR PARENT
//─────────────────────────────────────────────────────────────
public static List<AlertService.SosAlert> listAlertsByParent(int parentId) {

    String sql = """
         SELECT AlertId, ParentId, ChildId, DeviceId, AlertType, Description,
                Timestamp, IsAcknowledged
         FROM Alerts
         WHERE ParentId = ?
         ORDER BY Timestamp DESC
     """;

    List<AlertService.SosAlert> list = new ArrayList<>();

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            list.add(new AlertService.SosAlert(
                rs.getInt("AlertId"),
                rs.getInt("ChildId"),
                rs.getInt("ParentId"),
                rs.getString("AlertType"),
                rs.getString("Description"),
                null,   // latitude not stored in Alerts table
                null,   // longitude not stored in Alerts table
                rs.getString("Timestamp"),
                rs.getInt("IsAcknowledged") == 1 ? "ACK" : "SENT"
            ));
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return list;
}

public static boolean userExistsById(int userId) {
    String sql = "SELECT COUNT(*) FROM Users WHERE UserId = ?";
    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, userId);
        ResultSet rs = ps.executeQuery();
        rs.next();
        return rs.getInt(1) > 0;
    } catch (Exception e) {
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
//  USER CREATION
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
//   PARENT REGISTRATION
// ─────────────────────────────────────────────────────────────




public static boolean isParentAuthenticated(int parentId) {
    String sql = "SELECT IsAuthenticated FROM Parents WHERE ParentId = ?";

    System.out.println("//////////////////////////////+++++++++++++++++++++++userid"+parentId);
    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            return rs.getBoolean("IsAuthenticated");
        }
        return false; // parent not found
    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}


// ─────────────────────────────────────────────────────────────
//   LOGIN LOOKUPS
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
//  ALERT SYSTEM (used in AlertService)
// ─────────────────────────────────────────────────────────────








//─────────────────────────────────────────────────────────────
//ALERTS — CANCEL ALERT (MARK AS ACKNOWLEDGED)
//─────────────────────────────────────────────────────────────
public static boolean cancelAlert(int alertId) {

 String sql = """
     UPDATE Alerts
     SET IsAcknowledged = 1
     WHERE AlertId = ?
 """;

 try (Connection conn = getConnection();
      PreparedStatement ps = conn.prepareStatement(sql)) {

     ps.setInt(1, alertId);
     return ps.executeUpdate() > 0;

 } catch (SQLException e) {
     e.printStackTrace();
 }

 return false;
}
public static boolean parentAuthRequestExists(int parentId) {
    String sql = """
        SELECT COUNT(*)
        FROM ParentAuthRequests
        WHERE ParentId = ? AND (Status = 'PENDING' OR Status IS NULL)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ResultSet rs = ps.executeQuery();
        rs.next();
        return rs.getInt(1) > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}
public static boolean approveParent(int parentId) {
    String sql1 = "UPDATE Parents SET IsAuthenticated = 1 WHERE ParentId = ?";
    String sql2 = "UPDATE ParentAuthRequests SET Status = 'APPROVED' WHERE ParentId = ? AND (Status='PENDING' OR Status IS NULL)";

    try (Connection conn = getConnection();
         PreparedStatement ps1 = conn.prepareStatement(sql1);
         PreparedStatement ps2 = conn.prepareStatement(sql2)) {

        ps1.setInt(1, parentId);
        ps2.setInt(1, parentId);

        ps1.executeUpdate();
        ps2.executeUpdate();

        return true;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}
public static boolean rejectParent(int parentId) {
    String sql = """
        UPDATE ParentAuthRequests
        SET Status = 'REJECTED'
        WHERE ParentId = ? AND (Status='PENDING' OR Status IS NULL)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}
public static List<Map<String, Object>> listAllParents() {
    String sql = """
        SELECT u.UserId, u.UserName, u.Phone, p.IsAuthenticated
        FROM Users u
        JOIN Parents p ON u.UserId = p.ParentId
    """;

    List<Map<String, Object>> list = new ArrayList<>();

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        while (rs.next()) {
            Map<String, Object> row = new HashMap<>();
            row.put("UserId", rs.getInt("UserId"));
            row.put("UserName", rs.getString("UserName"));
            row.put("Phone", rs.getString("Phone"));
            row.put("IsAuthenticated", rs.getBoolean("IsAuthenticated"));
            list.add(row);
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return list;
}
public static boolean updateParentPhone(int parentId, String newPhone) {
    String sql = """
        UPDATE Parents
        SET Phone = ?
        WHERE ParentId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, newPhone);
        ps.setInt(2, parentId);

        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return false;
}
public static boolean deactivateParent(int parentId) {
    String sql = """
        UPDATE Parents
        SET IsAuthenticated = 0
        WHERE ParentId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }
    return false;
}
public static class AuditLogRecord {
    public int logId;
    public int adminUserId;
    public String actionText;
    public String timestamp;

    public AuditLogRecord(int logId, int adminUserId, String actionText, String timestamp) {
        this.logId = logId;
        this.adminUserId = adminUserId;
        this.actionText = actionText;
        this.timestamp = timestamp;
    }
}


public static List<AuditLogRecord> listAuditLogs() {
    String sql = """
        SELECT LogId, AdminUserId, ActionText, Timestamp
        FROM AuditLogs
        ORDER BY Timestamp DESC
    """;

    List<AuditLogRecord> logs = new ArrayList<>();

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        while (rs.next()) {
            logs.add(new AuditLogRecord(
                rs.getInt("LogId"),
                rs.getInt("AdminUserId"),
                rs.getString("ActionText"),
                rs.getString("Timestamp")
            ));
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return logs;
}



public static Integer getDeviceIdBySerial(String serial) {
    String sql = "SELECT DeviceId FROM Devices WHERE DeviceSerial = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, serial);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) return rs.getInt("DeviceId");

    } catch (Exception e) {
        e.printStackTrace();
    }

    return null;
}

public static boolean childBelongsToParent(int childId, int parentId) {
    String sql = "SELECT 1 FROM Children WHERE ChildId = ? AND ParentId = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ps.setInt(2, parentId);

        ResultSet rs = ps.executeQuery();
        return rs.next();

    } catch (Exception e) {
        e.printStackTrace();
    }
    return false;
}
public static class ChildRecord {
    public int childId;
    public String name;
    public int age;
    public Integer deviceId;
    public String deviceStatus;
    public boolean active;
}
public static int createChild(int parentId, String name, int age) {
    String sql = """
        INSERT INTO Children (ParentId, Name, Age)
        VALUES (?, ?, ?)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        ps.setInt(1, parentId);
        ps.setString(2, name);
        ps.setInt(3, age);

        int rows = ps.executeUpdate();
        if (rows == 0) return -1;

        ResultSet rs = ps.getGeneratedKeys();
        if (rs.next()) return rs.getInt(1);

    } catch (Exception e) {
        e.printStackTrace();
    }
    return -1;
}

public static List<ChildRecord> getChildrenByParent(int parentId) {
    List<ChildRecord> list = new ArrayList<>();

    String sql = """
        SELECT 
            c.ChildId,
            c.Name,
            c.Age,
            d.DeviceId,
            d.Status AS DeviceStatus,
            d.Active
        FROM Children c
        LEFT JOIN Devices d ON c.ChildId = d.ChildId
        WHERE c.ParentId = ?
        ORDER BY c.ChildId DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            ChildRecord cr = new ChildRecord();
            cr.childId = rs.getInt("ChildId");
            cr.name = rs.getString("Name");
            cr.age = rs.getInt("Age");
            cr.deviceId = (Integer) rs.getObject("DeviceId"); // null-safe
            cr.deviceStatus = rs.getString("DeviceStatus");
            cr.active = rs.getBoolean("Active");

            list.add(cr);
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return list;
}
public static boolean updateChild(int childId, String name, int age) {
    String sql = """
        UPDATE Children
        SET Name = ?, Age = ?
        WHERE ChildId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, name);
        ps.setInt(2, age);
        ps.setInt(3, childId);

        return ps.executeUpdate() > 0;

    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
public static boolean deleteChild(int childId) {
    String sql = "DELETE FROM Children WHERE ChildId = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        return ps.executeUpdate() > 0;

    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}

//Location
public static class LocationRecord {
    public double latitude;
    public double longitude;
    public java.time.LocalDateTime timestamp;
}

public static LocationRecord getLatestLocation(int childId) {

    String sql = """
        SELECT TOP 1 L.Latitude, L.Longitude, L.Timestamp
        FROM Locations L
        INNER JOIN Devices D ON L.DeviceId = D.DeviceId
        WHERE D.ChildId = ?
        ORDER BY L.Timestamp DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            LocationRecord rec = new LocationRecord();
            rec.latitude = rs.getDouble("Latitude");
            rec.longitude = rs.getDouble("Longitude");
            rec.timestamp = rs.getTimestamp("Timestamp").toLocalDateTime();
            return rec;
        }

    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}
public static Integer createDevice(String deviceSerial) {

    String sql = """
        INSERT INTO Devices (DeviceSerial, ChildId, BatteryLevel, Status, Active)
        OUTPUT INSERTED.DeviceId
        VALUES (?, NULL, 100.00, 'OK', 1)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, deviceSerial.trim());
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            return rs.getInt("DeviceId");
        }

    } catch (Exception e) {
        System.out.println("createDevice() failed: " + e.getMessage());
    }

    return null;
}


public static List<LocationRecord> getLocationHistory(int childId) {
    List<LocationRecord> list = new ArrayList<>();

    String sql = """
        SELECT L.Latitude, L.Longitude, L.Timestamp
        FROM Locations L
        INNER JOIN Devices D ON L.DeviceId = D.DeviceId
        WHERE D.ChildId = ?
        ORDER BY L.Timestamp DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            LocationRecord rec = new LocationRecord();
            rec.latitude = rs.getDouble("Latitude");
            rec.longitude = rs.getDouble("Longitude");
            rec.timestamp = rs.getTimestamp("Timestamp").toLocalDateTime();
            list.add(rec);
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return list;
}
//Alerts
public static class AlertRecord {
    public int alertId;
    public Integer childId;
    public Integer deviceId;
    public String type;
    public String description;
    public LocalDateTime timestamp;
}
public static List<AlertRecord> getAlertsByParent(int parentId) {
    List<AlertRecord> list = new ArrayList<>();

    String sql = """
        SELECT AlertId, ChildId, DeviceId, AlertType, Description, Timestamp
        FROM Alerts
        WHERE ParentId = ?
        ORDER BY Timestamp DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);

        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            AlertRecord a = new AlertRecord();
            a.alertId = rs.getInt("AlertId");
            a.childId = rs.getObject("ChildId", Integer.class);
            a.deviceId = rs.getObject("DeviceId", Integer.class);
            a.type = rs.getString("AlertType");
            a.description = rs.getString("Description");
            a.timestamp = rs.getTimestamp("Timestamp").toLocalDateTime();
            list.add(a);
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return list;
}


//messages
public static int saveMessage(int parentId, int childId, String content, String senderRole) {
    String sql = """
        INSERT INTO Messages (ParentId, ChildId, Content, Status, SenderRole)
        VALUES (?, ?, ?, 'pending', ?)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        ps.setInt(1, parentId);
        ps.setInt(2, childId);
        ps.setString(3, content);
        ps.setString(4, senderRole);

        int rows = ps.executeUpdate();
        if (rows == 0) return -1;

        ResultSet rs = ps.getGeneratedKeys();
        if (rs.next()) return rs.getInt(1);

    } catch (Exception e) {
        e.printStackTrace();
    }
    return -1;
}
public static class MessageRecord {
    public int messageId;
    public String content;
    public LocalDateTime timestamp;
    public String status;
    public String senderRole;

    public MessageRecord(int messageId, String content, LocalDateTime timestamp,
                         String status, String senderRole) {
        this.messageId = messageId;
        this.content = content;
        this.timestamp = timestamp;
        this.status = status;
        this.senderRole = senderRole;
    }
}


public static List<MessageRecord> getMessages(int parentId, int childId) {
    List<MessageRecord> list = new ArrayList<>();

    String sql = """
        SELECT MessageId, Content, Timestamp, Status, SenderRole
        FROM Messages
        WHERE ParentId = ? AND ChildId = ?
        ORDER BY Timestamp DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ps.setInt(2, childId);

        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            list.add(new MessageRecord(
                rs.getInt("MessageId"),
                rs.getString("Content"),
                rs.getTimestamp("Timestamp").toLocalDateTime(),
                rs.getString("Status"),
                rs.getString("SenderRole")
            ));
        }

    } catch (Exception e) {
        e.printStackTrace();
    }

    return list;
}

public static class EmergencyContactRecord {
    public int contactId;
    public String name;
    public String phone;
    public String relation;

    public EmergencyContactRecord(int contactId, String name, String phone, String relation) {
        this.contactId = contactId;
        this.name = name;
        this.phone = phone;
        this.relation = relation;
    }
}
public static List<EmergencyContactRecord> listEmergencyContacts(int childId) {
    List<EmergencyContactRecord> out = new ArrayList<>();

    String sql = """
        SELECT ContactId, Name, Phone, Relation
        FROM EmergencyContacts
        WHERE ChildId = ?
        ORDER BY ContactId DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            out.add(new EmergencyContactRecord(
                    rs.getInt("ContactId"),
                    rs.getString("Name"),
                    rs.getString("Phone"),
                    rs.getString("Relation")
            ));
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return out;
}
public static int addEmergencyContact(int childId, String name, String phone, String relation) {
    String sql = """
        INSERT INTO EmergencyContacts (ChildId, Name, Phone, Relation)
        VALUES (?, ?, ?, ?)
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        ps.setInt(1, childId);
        ps.setString(2, name);
        ps.setString(3, phone);
        ps.setString(4, relation);

        int rows = ps.executeUpdate();
        if (rows == 0) return -1;

        ResultSet rs = ps.getGeneratedKeys();
        if (rs.next()) return rs.getInt(1);

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return -1;
}
public static boolean updateEmergencyContact(
        int contactId, String name, String phone, String relation) {

    String sql = """
        UPDATE EmergencyContacts
        SET Name = ?, Phone = ?, Relation = ?
        WHERE ContactId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, name);
        ps.setString(2, phone);
        ps.setString(3, relation);
        ps.setInt(4, contactId);

        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}
public static boolean deleteEmergencyContact(int contactId) {
    String sql = "DELETE FROM EmergencyContacts WHERE ContactId = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, contactId);
        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
    }

    return false;
}

//-----------------------------------------------
//SAFE ZONE DB FUNCTIONS
//-----------------------------------------------
public static int addSafeZone(int childId, double lat, double lng, double radius) {
 String sql = """
     INSERT INTO SafeZones (ChildId, Latitude, Longitude, Radius)
     VALUES (?, ?, ?, ?)
 """;

 try (Connection conn = getConnection();
      PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

     ps.setInt(1, childId);
     ps.setDouble(2, lat);
     ps.setDouble(3, lng);
     ps.setDouble(4, radius);

     int rows = ps.executeUpdate();
     if (rows == 0) return -1;

     ResultSet rs = ps.getGeneratedKeys();
     if (rs.next()) return rs.getInt(1);

 } catch (Exception e) {
     e.printStackTrace();
 }
 return -1;
}

public static boolean deleteSafeZone(int zoneId) {
 String sql = "DELETE FROM SafeZones WHERE SafeZoneId = ?";

 try (Connection conn = getConnection();
      PreparedStatement ps = conn.prepareStatement(sql)) {

     ps.setInt(1, zoneId);
     return ps.executeUpdate() > 0;

 } catch (Exception e) {
     e.printStackTrace();
     return false;
 }
}

public static List<SafeZoneRecord> getSafeZones(int childId) {
 List<SafeZoneRecord> list = new ArrayList<>();

 String sql = """
     SELECT SafeZoneId, Latitude, Longitude, Radius
     FROM SafeZones
     WHERE ChildId = ?
     ORDER BY CreatedAt DESC
 """;

 try (Connection conn = getConnection();
      PreparedStatement ps = conn.prepareStatement(sql)) {

     ps.setInt(1, childId);
     ResultSet rs = ps.executeQuery();

     while (rs.next()) {
         SafeZoneRecord rec = new SafeZoneRecord();
         rec.id = rs.getInt("SafeZoneId");
         rec.latitude = rs.getDouble("Latitude");
         rec.longitude = rs.getDouble("Longitude");
         rec.radius = rs.getDouble("Radius");
         list.add(rec);
     }

 } catch (Exception e) {
     e.printStackTrace();
 }

 return list;
}

public static class SafeZoneRecord {
 public int id;
 public double latitude;
 public double longitude;
 public double radius;
}
public static boolean isChildOwnedByParent(int childId, int parentId) {

    String sql = "SELECT 1 FROM Children WHERE ChildId = ? AND ParentId = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ps.setInt(2, parentId);

        ResultSet rs = ps.executeQuery();
        return rs.next();

    } catch (Exception e) {
        e.printStackTrace();
        return false;
    }
}
public static Integer getDeviceIdForChild(int childId) throws Exception {
    String sql = "SELECT DeviceId FROM Devices WHERE ChildId = ? AND Active = 1";
    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) return rs.getInt("DeviceId");
    }
    return null;
}
public static int insertLocation(int deviceId, double lat, double lon) throws Exception {
    String sql = """
        INSERT INTO Locations(DeviceId, Latitude, Longitude, Timestamp)
        OUTPUT INSERTED.LocationId
        VALUES (?, ?, ?, SYSUTCDATETIME())
    """;
    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, deviceId);
        ps.setDouble(2, lat);
        ps.setDouble(3, lon);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) return rs.getInt(1);
    }
    throw new Exception("Failed to insert location");
}

public static List<SafeZone> getSafeZonesForChild(int childId) throws Exception {
    String sql = "SELECT * FROM SafeZones WHERE ChildId = ?";
    List<SafeZone> list = new ArrayList<>();

    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            list.add(new SafeZone(
                    rs.getInt("SafeZoneId"),
                    rs.getDouble("Latitude"),
                    rs.getDouble("Longitude"),
                    rs.getDouble("Radius")
            ));
        }
    }
    return list;
}

public static boolean isInsideAnySafeZone(double lat, double lon, List<SafeZone> zones) {
    for (SafeZone z : zones) {
        double dist = haversine(lat, lon, z.getLatitude(), z.getLongitude());
        if (dist <= z.getRadius()) return true;
    }
    return false;
}

private static double haversine(double lat1, double lon1, double lat2, double lon2) {
    double R = 6371000;
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    double a = Math.sin(dLat/2)*Math.sin(dLat/2) +
            Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2)) *
                    Math.sin(dLon/2)*Math.sin(dLon/2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
public static void saveSafeZoneExitAlert(int childId) throws Exception {
    String sql = """
        INSERT INTO Alerts(ChildId, ParentId, Type, Description, Timestamp)
        SELECT ?, ParentId, 'SafeZone', 'Child left safe zone', SYSUTCDATETIME()
        FROM Children WHERE ChildId = ?
    """;
    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, childId);
        ps.setInt(2, childId);
        ps.executeUpdate();
    }
}
public static boolean isWithinRadius(
        double lat1, double lon1,
        double lat2, double lon2,
        double radiusMeters
) {
    final double R = 6371000; // Earth radius in meters

    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);

    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    double distance = R * c; // distance in meters

    return distance <= radiusMeters;
}

public static Boolean getChildSafeZoneState(int childId) throws Exception {

    // 1. Get last location for child's device
    String sql = """
        SELECT TOP 1 L.Latitude, L.Longitude
        FROM Locations L
        JOIN Devices D ON D.DeviceId = L.DeviceId
        WHERE D.ChildId = ?
        ORDER BY L.Timestamp DESC
    """;

    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();
        if (!rs.next()) return null;

        double lat = rs.getDouble("Latitude");
        double lon = rs.getDouble("Longitude");

        // 2. Get safe zones for child
        List<SafeZone> zones = getSafeZonesForChild(childId);

        // 3. Check if inside any zone
        for (SafeZone z : zones) {
            if (isWithinRadius(lat, lon, z.getLatitude(), z.getLongitude(), z.getRadius())) {
                return true;
            }
        }

        return false;
    }
}


public static void updateChildSafeZoneState(int childId, boolean inZone) throws Exception {
   /* String sql = """
        MERGE ChildSafeZoneState AS t
        USING (SELECT ? AS ChildId, ? AS InSafeZone) AS s
        ON t.ChildId = s.ChildId
        WHEN MATCHED THEN UPDATE SET InSafeZone = s.InSafeZone
        WHEN NOT MATCHED THEN INSERT (ChildId, InSafeZone) VALUES (s.ChildId, s.InSafeZone);
    """;

    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, childId);
        ps.setBoolean(2, inZone);
        ps.executeUpdate();
    }*/
}
public static Location getLastLocationForChild(int childId) throws Exception {
    String sql = """
        SELECT TOP 1 L.Latitude, L.Longitude, L.Timestamp
        FROM Locations L
        JOIN Devices D ON L.DeviceId = D.DeviceId
        WHERE D.ChildId = ?
        ORDER BY L.Timestamp DESC
    """;

    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            return new Location(
                    rs.getDouble("Latitude"),
                    rs.getDouble("Longitude")
            );
        }
    }
    return null;
}
public static List<Location> getLocationHistoryForChild(int childId) throws Exception {
    String sql = """
        SELECT L.Latitude, L.Longitude, L.Timestamp
        FROM Locations L
        JOIN Devices D ON L.DeviceId = D.DeviceId
        WHERE D.ChildId = ?
        ORDER BY L.Timestamp DESC
    """;

    List<Location> list = new ArrayList<>();

    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql)) {
        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();
        while (rs.next()) {
            list.add(new Location(
                    rs.getDouble("Latitude"),
                    rs.getDouble("Longitude")
            ));
        }
    }
    return list;
}
public static class MessageDto {
    public int messageId; public String content; public String sentAt; public String status;
    public MessageDto(int id,String c,String s,String st){
        messageId=id; content=c; sentAt=s; status=st;
    }
}
public static List<MessageDto> getMessagesForChild(int childId) throws Exception {
    String sql = """
        SELECT MessageId, Content, Timestamp, Status
        FROM Messages
        WHERE ChildId = ? AND SenderRole = 'PARENT'
        ORDER BY Timestamp DESC
    """;

    String update = "UPDATE Messages SET Status = 'delivered' WHERE MessageId = ?";

    List<MessageDto> list = new ArrayList<>();

    try (Connection c = getConnection();
         PreparedStatement ps = c.prepareStatement(sql);
         PreparedStatement pu = c.prepareStatement(update)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            int id = rs.getInt("MessageId");
            list.add(new MessageDto(
                    id,
                    rs.getString("Content"),
                    rs.getString("Timestamp"),
                    rs.getString("Status")
            ));

            pu.setInt(1, id);
            pu.executeUpdate();
        }
    }
    return list;
}
public static Child getChildById(int childId) {
    String sql = """
        SELECT ChildId, ParentId, Name, Age
        FROM Children
        WHERE ChildId = ?
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            return new Child(
                rs.getInt("ChildId"),
                rs.getInt("ParentId"),
                rs.getString("Name"),
                rs.getInt("Age")
            );
        }

    } catch (Exception e) {
        e.printStackTrace();
    }
    return null; // child not found
}

public static List<Alert> getSosAlertHistory(int childId) {
    List<Alert> list = new ArrayList<>();

    String sql = """
        SELECT AlertId, ParentId, ChildId, DeviceId,
               AlertType, Description, Timestamp, IsAcknowledged
        FROM Alerts
        WHERE ChildId = ? AND AlertType = 'SOS'
        ORDER BY Timestamp DESC
    """;

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, childId);
        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            Alert a = new Alert(
                rs.getInt("AlertId"),
                rs.getInt("ParentId"),
                rs.getInt("ChildId"),
                rs.getObject("DeviceId") != null ? rs.getInt("DeviceId") : null,
                rs.getString("AlertType"),
                rs.getString("Description"),
                rs.getTimestamp("Timestamp"),
                rs.getBoolean("IsAcknowledged")
            );
            list.add(a);
        }

    } catch (Exception ex) {
        ex.printStackTrace();
    }

    return list;
}



}