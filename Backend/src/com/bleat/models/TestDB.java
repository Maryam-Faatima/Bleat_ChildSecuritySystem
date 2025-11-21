package com.bleat.models;

import java.util.Scanner;

public class TestDB {

    private static void testSignup() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter full name: ");
        String fullName = sc.nextLine();

        System.out.print("Enter email: ");
        String email = sc.nextLine();

        System.out.print("Enter phone number: ");
        String phone = sc.nextLine();

        System.out.print("Enter password: ");
        String password = sc.nextLine();

        System.out.print("Enter role (PARENT, ADMIN): ");
        String role = sc.nextLine();

        System.out.println("\nAttempting signup...");
        boolean ok = DBHandler.signup(fullName, email, phone, password, role);

        if (ok) {
            System.out.println("Signup successful!");
        } else {
            System.out.println("Signup failed.");
        }
    }

    private static void testLogin() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter email: ");
        String email = sc.nextLine();

        System.out.print("Enter password: ");
        String password = sc.nextLine();

        System.out.println("\nAttempting login...");
        User user = DBHandler.login(email, password);

        if (user == null) {
            System.out.println("Login failed.");
            return;
        }

        System.out.println("\nLogin successful!");
        System.out.println("User ID: " + user.getUserId());
        System.out.println("Name: " + user.getName());

        if (user instanceof Parent) {
            Parent p = (Parent) user;
            System.out.println("Role: PARENT");
            System.out.println("Phone Number: " + p.getPhoneNumber());
        } else if (user instanceof Admin) {
            System.out.println("Role: ADMIN");
        }
    }



    private static void testAddChild() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter your Parent ID: ");
        int parentId = sc.nextInt();
        sc.nextLine(); // consume newline

        System.out.print("Enter child's name: ");
        String childName = sc.nextLine();

        System.out.print("Enter child's age: ");
        int age = sc.nextInt();

        System.out.println("\nAdding child...");

        boolean ok = DBHandler.addChild(parentId, childName, age);

        if (ok) {
            System.out.println("Child added successfully!");
        } else {
            System.out.println("Failed to add child.");
        }
    }

    private static void testUpdateChild() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter your Parent ID: ");
        int parentId = sc.nextInt();
        sc.nextLine(); // consume newline

        System.out.print("Enter Child ID to update: ");
        int childId = sc.nextInt();
        sc.nextLine(); // consume newline

        System.out.print("Enter new child name: ");
        String newName = sc.nextLine();

        System.out.print("Enter new age: ");
        int newAge = sc.nextInt();

        System.out.println("\nUpdating child info...");

        boolean ok = DBHandler.updateChild(childId, parentId, newName, newAge);

        if (ok) {
            System.out.println("Child information updated successfully!");
        } else {
            System.out.println("Failed to update child. Make sure Child ID is correct and belongs to you.");
        }
    }

    private static void testPairDevice() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Child ID: ");
        int childId = sc.nextInt();
        sc.nextLine(); // consume newline

        System.out.print("Enter Device Serial: ");
        String deviceSerial = sc.nextLine();

        System.out.println("\nAttempting to pair device...");

        boolean ok = DBHandler.pairDeviceToChild(childId, deviceSerial);

        if (ok) {
            System.out.println("Device successfully paired to child.");
        } else {
            System.out.println("Failed to pair device.");
        }
    }
    private static void testDeactivateDevice() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Device ID to deactivate: ");
        int deviceId = sc.nextInt();

        boolean ok = DBHandler.deactivateDevice(deviceId);
        if (ok) {
            System.out.println("Device deactivated successfully!");
        } else {
            System.out.println("Failed to deactivate device.");
        }
    }
    private static void testSetSafeZone() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Child ID: ");
        int childId = sc.nextInt();

        System.out.print("Enter Latitude (-90 to 90): ");
        double latitude = sc.nextDouble();

        System.out.print("Enter Longitude (-180 to 180): ");
        double longitude = sc.nextDouble();

        System.out.print("Enter Radius (meters): ");
        double radius = sc.nextDouble();

        System.out.println("\nSetting safe zone...");

        boolean ok = DBHandler.setSafeZone(childId, latitude, longitude, radius);

        if (ok) {
            System.out.println("Safe zone set successfully!");
        } else {
            System.out.println("Failed to set safe zone.");
        }
    }

    private static void testUpdateDeviceStatus() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Device ID: ");
        int deviceId = sc.nextInt();

        System.out.print("Enter new battery level (0-100): ");
        double batteryLevel = sc.nextDouble();

        System.out.println("\nUpdating device status...");

        boolean ok = DBHandler.updateDeviceStatus(deviceId, batteryLevel);

        if (ok) {
            System.out.println("Device status updated successfully!");
        } else {
            System.out.println("Failed to update device status.");
        }
    }

    private static void testViewChildDetails() {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Child ID to view details: ");
        int childId = sc.nextInt();

        System.out.println("\nFetching child details...");
        DBHandler.viewChildDetails(childId);
    }
private static void testSendMessageFromParent() {
    Scanner sc = new Scanner(System.in);

    System.out.print("Enter your Parent ID: ");
    int parentId = sc.nextInt();

    System.out.print("Enter Child ID: ");
    int childId = sc.nextInt();
    sc.nextLine(); // consume newline

    System.out.print("Enter message content: ");
    String content = sc.nextLine();

    boolean ok = DBHandler.sendMessage(parentId, childId, content);

    if (ok) {
        System.out.println("Message sent successfully!");
    } else {
        System.out.println("Failed to send message.");
    }
}
private static void testSendMessageFromChild() {
    Scanner sc = new Scanner(System.in);

    System.out.print("Enter Child ID: ");
    int childId = sc.nextInt();

    System.out.print("Enter Parent ID: ");
    int parentId = sc.nextInt();
    sc.nextLine(); // consume newline

    System.out.print("Enter message content: ");
    String content = sc.nextLine();

    boolean ok = DBHandler.sendMessageFromChild(childId, parentId, content);

    if (ok) {
        System.out.println("Message sent successfully from child to parent!");
    } else {
        System.out.println("Failed to send message.");
    }
}
// Parent viewing messages
private static void testViewMessagesParent(int parentId) {
    System.out.println("Messages for Parent ID: " + parentId);
    DBHandler.viewMessagesForParent(parentId);

    Scanner sc = new Scanner(System.in);
    System.out.print("Enter Message ID to acknowledge (or 0 to skip): ");
    int msgId = sc.nextInt();
    if (msgId != 0) {
        boolean ok = DBHandler.acknowledgeMessageByParent(msgId);
        System.out.println(ok ? "Message acknowledged." : "Failed to acknowledge.");
    }
}

// Child viewing messages
private static void testViewMessagesChild(int childId) {
    System.out.println("Messages for Child ID: " + childId);
    DBHandler.viewMessagesForChild(childId);

    Scanner sc = new Scanner(System.in);
    System.out.print("Enter Message ID to acknowledge (or 0 to skip): ");
    int msgId = sc.nextInt();
    if (msgId != 0) {
        boolean ok = DBHandler.acknowledgeMessageByChild(msgId);
        System.out.println(ok ? "Message acknowledged." : "Failed to acknowledge.");
    }
}

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Choose test:");
        System.out.println("1. Signup");
        System.out.println("2. Login");
        System.out.println("3. Add Child");
        System.out.println("4. Update Child");
        System.out.println("5. Pair Device");
        System.out.println("6. Deactivate Device");
        System.out.println("7. Set Safe Zone");
        System.out.println("8. Update Device Status");
        System.out.println("9. View Child Details");
        System.out.println("10. Send Message from Parent to Child");
        System.out.println("11. Send Message from Child to Parent");
        System.out.println("12. View Messages for Parent");
        System.out.println("13. View Messages for Child");
        System.out.print("Enter choice: ");
        int ch = sc.nextInt();

        if (ch == 1) {
            testSignup();
        } else if (ch == 2) {
            testLogin();
        } else if (ch == 3) {
            testAddChild();
        } else if (ch == 4) {
            testUpdateChild();
        } else if (ch == 5) {
            testPairDevice();
        } else if (ch == 6) {
            testDeactivateDevice();
        } else if(ch==7){
            testSetSafeZone();
        }else if(ch==8){
            testUpdateDeviceStatus();
        }else if(ch==9){
            testViewChildDetails();
        }else if(ch==10){
            testSendMessageFromParent();
        } else if(ch==11){
            testSendMessageFromChild();
        } else if(ch==12){
            System.out.print("Enter Parent ID to view messages: ");
            int parentId = sc.nextInt();
            testViewMessagesParent(parentId);
        } else if(ch==13){
            System.out.print("Enter Child ID to view messages: ");
            int childId = sc.nextInt();
            testViewMessagesChild(childId);
        }
        else {
          System.out.println("Invalid choice.");
        }

    }

}
