package com.bleat.models;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DBHandler {

    private static final String URL =
        "jdbc:sqlserver://localhost:1433;" +
        "databaseName=BLEAT;" +
        "encrypt=false;" +
        "trustServerCertificate=true;";

    private static final String USER = "javauser1";
    private static final String PASS = "Please1";

    public static Connection getConnection() {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            return java.sql.DriverManager.getConnection(URL, USER, PASS);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    //====================== SIGN UP ======================
    public static boolean signup(String fullName, String email, String phone, String password, String role) {
    String checkSql = "SELECT COUNT(*) FROM Users WHERE Email = ? OR UserName = ?";
    String insertUserSql = "INSERT INTO Users (UserName, PasswordHash, Role, Email, Phone) VALUES (?, ?, ?, ?, ?)";
    String insertParentSql = "INSERT INTO Parents (ParentId) VALUES (?)"; // IsAuthenticated defaults to 0
    String insertAuthReqSql = "INSERT INTO ParentAuthRequests (ParentId) VALUES (?)"; // Admin approval request

    try (Connection conn = getConnection();
         PreparedStatement checkStmt = conn.prepareStatement(checkSql);
         PreparedStatement insertUserStmt = conn.prepareStatement(insertUserSql, PreparedStatement.RETURN_GENERATED_KEYS);
         PreparedStatement insertParentStmt = conn.prepareStatement(insertParentSql);
         PreparedStatement insertAuthReqStmt = conn.prepareStatement(insertAuthReqSql)) {

        // 1. Check if email or username exists
        checkStmt.setString(1, email);
        checkStmt.setString(2, fullName);
        ResultSet rs = checkStmt.executeQuery();
        if (rs.next() && rs.getInt(1) > 0) {
            System.out.println("Email or username already exists!");
            return false;
        }

        // 2. Insert into Users table
        insertUserStmt.setString(1, fullName);
        insertUserStmt.setString(2, password); // Hash in real app
        insertUserStmt.setString(3, role.toUpperCase());
        insertUserStmt.setString(4, email);
        insertUserStmt.setString(5, phone);

        int rows = insertUserStmt.executeUpdate();
        if (rows == 0) return false;

        // 3. Get generated UserId
        ResultSet generatedKeys = insertUserStmt.getGeneratedKeys();
        if (generatedKeys.next() && "PARENT".equalsIgnoreCase(role)) {
            int userId = generatedKeys.getInt(1);

            // Insert into Parents table with IsAuthenticated = 0
            insertParentStmt.setInt(1, userId);
            insertParentStmt.executeUpdate();

            // Insert authentication request for admin approval
            insertAuthReqStmt.setInt(1, userId);
            insertAuthReqStmt.executeUpdate();

            System.out.println("Parent signup successful. Awaiting admin authentication.");
        }

        return true;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}


    //====================== LOGIN ======================
    public static User login(String email, String password) {
    String sql = "SELECT u.UserId, u.UserName, u.Role, u.Phone, p.IsAuthenticated " +
                 "FROM Users u LEFT JOIN Parents p ON u.UserId = p.ParentId " +
                 "WHERE u.Email = ? AND u.PasswordHash = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, email);
        ps.setString(2, password); // Hash in real app

        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            int userId = rs.getInt("UserId");
            String userName = rs.getString("UserName");
            String role = rs.getString("Role");
            String phone = rs.getString("Phone");
            boolean isAuthenticated = rs.getBoolean("IsAuthenticated");

            if ("PARENT".equalsIgnoreCase(role)) {
                if (!isAuthenticated) {
                    System.out.println("Parent not yet authenticated by admin! Sending new authentication request...");
                    String reqSql = "INSERT INTO ParentAuthRequests (ParentId) VALUES (?)";
                    try (PreparedStatement reqStmt = conn.prepareStatement(reqSql)) {
                        reqStmt.setInt(1, userId);
                        reqStmt.executeUpdate();
                    }
                    return null;
                }
                System.out.println("Parent authentication verified. Login successful.");
                return new Parent(userId, userName, password, phone);
            } else {
                return new Admin(userId, userName, password);
            }
        } else {
            System.out.println("Invalid email or password!");
            return null;
        }

    } catch (SQLException e) {
        e.printStackTrace();
        return null;
    }
}


    //==================================================================================================
    // 4. Add Child method
    public static boolean addChild(int parentId, String childName, int age) {
        String insertSql = "INSERT INTO Children (ParentId, Name, Age) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
            PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {

            insertStmt.setInt(1, parentId);
            insertStmt.setString(2, childName);
            insertStmt.setInt(3, age);

            int rows = insertStmt.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    //==================================================================================================
    // 5. Update Child method
    public static boolean updateChild(int childId, int parentId, String newName, int newAge) {
        String updateSql = "UPDATE Children SET Name = ?, Age = ? WHERE ChildId = ? AND ParentId = ?";

        try (Connection conn = getConnection();
            PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {

            updateStmt.setString(1, newName);
            updateStmt.setInt(2, newAge);
            updateStmt.setInt(3, childId);
            updateStmt.setInt(4, parentId);

            int rows = updateStmt.executeUpdate();
            return rows > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    //==================================================================================================
    //==================================================================================================
    // 6. Pair Device to Child
    public static boolean pairDeviceToChild(int childId, String deviceSerial) {
        String checkSql = "SELECT DeviceId, Active FROM Devices WHERE DeviceSerial = ?";
        String insertSql = "INSERT INTO Devices (DeviceSerial, ChildId, Active) VALUES (?, ?, 1)";
        String updateSql = "UPDATE Devices SET ChildId = ?, Active = 1 WHERE DeviceSerial = ?";

        try (Connection conn = getConnection();
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            PreparedStatement insertStmt = conn.prepareStatement(insertSql);
            PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {

            // Check if device exists
            checkStmt.setString(1, deviceSerial);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next()) {
                // Device exists, update ChildId and set Active = 1
                updateStmt.setInt(1, childId);
                updateStmt.setString(2, deviceSerial);
                int rows = updateStmt.executeUpdate();
                return rows > 0;
            } else {
                // Device does not exist, insert new
                insertStmt.setString(1, deviceSerial);
                insertStmt.setInt(2, childId);
                int rows = insertStmt.executeUpdate();
                return rows > 0;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }


    //==================================================================================================
    // 7. Deactivate Device
    public static boolean deactivateDevice(int deviceId) {
        String sql = "UPDATE Devices SET ChildId = NULL, Active = 0 WHERE DeviceId = ?";

        try (Connection conn = getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, deviceId);
            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("Device deactivated successfully!");
                return true;
            } else {
                System.out.println("Device not found or already deactivated.");
                return false;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    //==================================================================================================
    // 8. Replace Device for a Child
    public static boolean replaceDevice(int childId, String newDeviceSerial) {
        String oldDeviceSql = "SELECT DeviceId FROM Devices WHERE ChildId = ?";
        String deactivateSql = "UPDATE Devices SET Active = 0, ChildId = NULL WHERE DeviceId = ?";

        try (Connection conn = getConnection();
            PreparedStatement oldDeviceStmt = conn.prepareStatement(oldDeviceSql);
            PreparedStatement deactivateStmt = conn.prepareStatement(deactivateSql)) {

            // Step 1: Find old device
            oldDeviceStmt.setInt(1, childId);
            ResultSet rs = oldDeviceStmt.executeQuery();

            if (rs.next()) {
                int oldDeviceId = rs.getInt("DeviceId");

                // Step 2: Deactivate old device
                deactivateStmt.setInt(1, oldDeviceId);
                deactivateStmt.executeUpdate();
            }

            // Step 3: Pair new device
            return pairDeviceToChild(childId, newDeviceSerial);

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    //==================================================================================================
    // 9. Sets or updates a safe zone for a child
    public static boolean setSafeZone(int childId, double latitude, double longitude, double radius) {
        String selectSql = "SELECT SafeZoneId FROM SafeZones WHERE ChildId = ?";
        String insertSql = "INSERT INTO SafeZones (ChildId, Latitude, Longitude, Radius) VALUES (?, ?, ?, ?)";
        String updateSql = "UPDATE SafeZones SET Latitude = ?, Longitude = ?, Radius = ? WHERE SafeZoneId = ?";

        try (Connection conn = getConnection()) {
            // 1. Check if a safe zone already exists
            int safeZoneId = -1;
            try (PreparedStatement psSelect = conn.prepareStatement(selectSql)) {
                psSelect.setInt(1, childId);
                ResultSet rs = psSelect.executeQuery();
                if (rs.next()) {
                    safeZoneId = rs.getInt("SafeZoneId");
                }
            }

            // 2. Insert or update accordingly
            if (safeZoneId == -1) {
                try (PreparedStatement psInsert = conn.prepareStatement(insertSql)) {
                    psInsert.setInt(1, childId);
                    psInsert.setDouble(2, latitude);
                    psInsert.setDouble(3, longitude);
                    psInsert.setDouble(4, radius);
                    psInsert.executeUpdate();
                }
            } else {
                try (PreparedStatement psUpdate = conn.prepareStatement(updateSql)) {
                    psUpdate.setDouble(1, latitude);
                    psUpdate.setDouble(2, longitude);
                    psUpdate.setDouble(3, radius);
                    psUpdate.setInt(4, safeZoneId);
                    psUpdate.executeUpdate();
                }
            }

            return true;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    //==================================================================================================
    // 10. Update device status (battery level)
    public static boolean updateDeviceStatus(int deviceId, double batteryLevel) {
        String sql = "UPDATE Devices SET BatteryLevel = ? WHERE DeviceId = ?";

        try (Connection conn = getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setDouble(1, batteryLevel);
            ps.setInt(2, deviceId);

            int rows = ps.executeUpdate();
            if (rows > 0) {
                System.out.println("Device status updated successfully.");
                return true;
            } else {
                System.out.println("Device not found.");
                return false;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    //==================================================================================================
    //11. View child details by ChildId
    public static void viewChildDetails(int childId) {
        String sql = """
            SELECT c.ChildId, c.Name AS ChildName, c.Age, c.Status,
                d.DeviceId, d.DeviceSerial, d.BatteryLevel, d.Status AS DeviceStatus, d.Active,
                u.UserName AS ParentName
            FROM Children c
            JOIN Parents p ON c.ParentId = p.ParentId
            JOIN Users u ON p.ParentId = u.UserId
            LEFT JOIN Devices d ON c.ChildId = d.ChildId
            WHERE c.ChildId = ?
            """;

        try (Connection conn = getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, childId);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                System.out.println("=== Child Details ===");
                System.out.println("Child ID: " + rs.getInt("ChildId"));
                System.out.println("Name: " + rs.getString("ChildName"));
                System.out.println("Age: " + rs.getInt("Age"));
                System.out.println("Status: " + rs.getString("Status"));
                System.out.println("Parent Name: " + rs.getString("ParentName"));

                int deviceId = rs.getInt("DeviceId");
                if (rs.wasNull()) {
                    System.out.println("No device paired.");
                } else {
                    System.out.println("--- Device Info ---");
                    System.out.println("Device ID: " + deviceId);
                    System.out.println("Serial: " + rs.getString("DeviceSerial"));
                    System.out.println("Battery Level: " + rs.getDouble("BatteryLevel"));
                    System.out.println("Status: " + rs.getString("DeviceStatus"));
                    System.out.println("Active: " + (rs.getBoolean("Active") ? "Yes" : "No"));
                }

            } else {
                System.out.println("Child not found!");
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    //==================================================================================================
//12.Parent sends a message to a child
public static boolean sendMessage(int parentId, int childId, String content) {
    String sql = "INSERT INTO Messages (ParentId, ChildId, Content, Status, SenderRole) " +
                 "VALUES (?, ?, ?, 'pending', 'PARENT')";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);
        ps.setInt(2, childId);
        ps.setString(3, content);

        int rows = ps.executeUpdate();
        return rows > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}


//==================================================================================================
// Child sends a message to its parent
public static boolean sendMessageFromChild(int childId, int parentId, String content) {
    String sql = "INSERT INTO Messages (ParentId, ChildId, Content, Status, SenderRole) " +
                 "VALUES (?, ?, ?, 'pending', 'CHILD')";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, parentId);  // recipient parent
        ps.setInt(2, childId);   // sender child
        ps.setString(3, content);

        int rows = ps.executeUpdate();
        return rows > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}

//=================================================================================
//Parent views childs messages
public static void viewMessagesForParent(int parentId) {
    String selectSql = "SELECT m.MessageId, c.Name AS ChildName, m.Content, m.Timestamp, m.Status " +
                       "FROM Messages m " +
                       "JOIN Children c ON m.ChildId = c.ChildId " +
                       "WHERE m.ParentId = ? AND m.SenderRole = 'CHILD'";

    String updateSql = "UPDATE Messages SET Status = 'delivered' WHERE MessageId = ?";

    try (Connection conn = getConnection();
         PreparedStatement psSelect = conn.prepareStatement(selectSql);
         PreparedStatement psUpdate = conn.prepareStatement(updateSql)) {

        psSelect.setInt(1, parentId);
        ResultSet rs = psSelect.executeQuery();

        while (rs.next()) {
            int messageId = rs.getInt("MessageId");
            String childName = rs.getString("ChildName");
            String content = rs.getString("Content");
            String timestamp = rs.getString("Timestamp");
            String status = rs.getString("Status");

            System.out.println("ID: " + messageId + " | Child: " + childName + 
                               " | Message: " + content + " | Time: " + timestamp + 
                               " | Status: " + status);

            // Update status to delivered
            psUpdate.setInt(1, messageId);
            psUpdate.executeUpdate();
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
}



// Parent acknowledging a message
public static boolean acknowledgeMessageByParent(int messageId) {
    String sql = "UPDATE Messages SET Status = 'delivered' WHERE MessageId = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, messageId);
        int updated = ps.executeUpdate();
        return updated > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}

// Child viewing messages from parent
public static void viewMessagesForChild(int childId) {
    String selectSql = "SELECT m.MessageId, u.UserName AS ParentName, m.Content, m.Timestamp, m.Status " +
                       "FROM Messages m " +
                       "JOIN Users u ON m.ParentId = u.UserId " +
                       "WHERE m.ChildId = ? AND m.SenderRole = 'PARENT'";

    String updateSql = "UPDATE Messages SET Status = 'delivered' WHERE MessageId = ?";

    try (Connection conn = getConnection();
         PreparedStatement psSelect = conn.prepareStatement(selectSql);
         PreparedStatement psUpdate = conn.prepareStatement(updateSql)) {

        psSelect.setInt(1, childId);
        ResultSet rs = psSelect.executeQuery();

        while (rs.next()) {
            int messageId = rs.getInt("MessageId");
            String parentName = rs.getString("ParentName");
            String content = rs.getString("Content");
            String timestamp = rs.getString("Timestamp");
            String status = rs.getString("Status");

            System.out.println("ID: " + messageId + " | Parent: " + parentName + 
                               " | Message: " + content + " | Time: " + timestamp + 
                               " | Status: " + status);

            // Update status to delivered
            psUpdate.setInt(1, messageId);
            psUpdate.executeUpdate();
        }

    } catch (SQLException e) {
        e.printStackTrace();
    }
}


// Child acknowledging a message
public static boolean acknowledgeMessageByChild(int messageId) {
    String sql = "UPDATE Messages SET Status = 'delivered' WHERE MessageId = ?";

    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, messageId);
        int updated = ps.executeUpdate();
        return updated > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}

}
