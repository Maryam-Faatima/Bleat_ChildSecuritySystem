// package com.bleat.models;

// import java.util.Scanner;

// public class TestDB {

//     private static void testSignup() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter full name: ");
//         String fullName = sc.nextLine();

//         System.out.print("Enter email: ");
//         String email = sc.nextLine();

//         System.out.print("Enter phone number: ");
//         String phone = sc.nextLine();

//         System.out.print("Enter password: ");
//         String password = sc.nextLine();

//         System.out.print("Enter role (PARENT, ADMIN): ");
//         String role = sc.nextLine();

//         System.out.println("\nAttempting signup...");
//         com.bleat.services.AuthenticationManager.SignupResult sr = com.bleat.services.AuthenticationManager
//                 .getInstance().signup(fullName, email, phone, password, role);

//         if (sr != null && sr.success) {
//             System.out.println("Signup successful! UserId=" + sr.userId);
//         } else {
//             System.out.println("Signup failed: " + (sr != null ? sr.message : "unknown"));
//         }
//     }

//     private static void testLogin() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter email: ");
//         String email = sc.nextLine();

//         System.out.print("Enter password: ");
//         String password = sc.nextLine();

//         System.out.println("\nAttempting login...");
//         com.bleat.services.AuthenticationManager.LoginResult lr = com.bleat.services.AuthenticationManager.getInstance()
//                 .login(email, password);

//         if (lr == null || !lr.success) {
//             System.out.println("Login failed: " + (lr != null ? lr.message : "unknown"));
//             return;
//         }

//         System.out.println("\nLogin successful!");
//         System.out.println("ID: " + lr.id);
//         System.out.println("Name: " + lr.name);
//         System.out
//                 .println("Role: " + lr.role + ("CHILD".equalsIgnoreCase(lr.role) ? (" parentId=" + lr.parentId) : ""));
//     }

//     private static void testAddChild() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter your Parent ID: ");
//         int parentId = sc.nextInt();
//         sc.nextLine(); // consume newline

//         System.out.print("Enter child's name: ");
//         String childName = sc.nextLine();

//         System.out.print("Enter child's age: ");
//         int age = sc.nextInt();

//         System.out.println("\nAdding child...");

//         boolean ok = DBHandler.addChild(parentId, childName, age);

//         if (ok) {
//             System.out.println("Child added successfully!");
//         } else {
//             System.out.println("Failed to add child.");
//         }
//     }

//     private static void testUpdateChild() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter your Parent ID: ");
//         int parentId = sc.nextInt();
//         sc.nextLine(); // consume newline

//         System.out.print("Enter Child ID to update: ");
//         int childId = sc.nextInt();
//         sc.nextLine(); // consume newline

//         System.out.print("Enter new child name: ");
//         String newName = sc.nextLine();

//         System.out.print("Enter new age: ");
//         int newAge = sc.nextInt();

//         System.out.println("\nUpdating child info...");

//         boolean ok = DBHandler.updateChild(childId, parentId, newName, newAge);

//         if (ok) {
//             System.out.println("Child information updated successfully!");
//         } else {
//             System.out.println("Failed to update child. Make sure Child ID is correct and belongs to you.");
//         }
//     }

//     private static void testPairDevice() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Child ID: ");
//         int childId = sc.nextInt();
//         sc.nextLine(); // consume newline

//         System.out.print("Enter Device Serial: ");
//         String deviceSerial = sc.nextLine();

//         System.out.println("\nAttempting to pair device...");

//         boolean ok = DBHandler.pairDeviceToChild(childId, deviceSerial);

//         if (ok) {
//             System.out.println("Device successfully paired to child.");
//         } else {
//             System.out.println("Failed to pair device.");
//         }
//     }

//     private static void testDeactivateDevice() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Device ID to deactivate: ");
//         int deviceId = sc.nextInt();

//         boolean ok = DBHandler.deactivateDevice(deviceId);
//         if (ok) {
//             System.out.println("Device deactivated successfully!");
//         } else {
//             System.out.println("Failed to deactivate device.");
//         }
//     }

//     private static void testSetSafeZone() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Child ID: ");
//         int childId = sc.nextInt();

//         System.out.print("Enter Latitude (-90 to 90): ");
//         double latitude = sc.nextDouble();

//         System.out.print("Enter Longitude (-180 to 180): ");
//         double longitude = sc.nextDouble();

//         System.out.print("Enter Radius (meters): ");
//         double radius = sc.nextDouble();

//         System.out.println("\nSetting safe zone...");

//         boolean ok = DBHandler.setSafeZone(childId, latitude, longitude, radius);

//         if (ok) {
//             System.out.println("Safe zone set successfully!");
//         } else {
//             System.out.println("Failed to set safe zone.");
//         }
//     }

//     private static void testUpdateDeviceStatus() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Device ID: ");
//         int deviceId = sc.nextInt();

//         System.out.print("Enter new battery level (0-100): ");
//         double batteryLevel = sc.nextDouble();

//         System.out.println("\nUpdating device status...");

       
//     }

//     private static void testViewChildDetails() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Child ID to view details: ");
//         int childId = sc.nextInt();

//         System.out.println("\nFetching child details...");
//        // DBHandler.viewChildDetails(childId);
//     }

//     private static void testSendMessageFromParent() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter your Parent ID: ");
//         int parentId = sc.nextInt();

//         System.out.print("Enter Child ID: ");
//         int childId = sc.nextInt();
//         sc.nextLine(); // consume newline

//         System.out.print("Enter message content: ");
//         String content = sc.nextLine();

       
//     }

//     private static void testSendMessageFromChild() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Child ID: ");
//         int childId = sc.nextInt();

//         System.out.print("Enter Parent ID: ");
//         int parentId = sc.nextInt();
//         sc.nextLine(); // consume newline

//         System.out.print("Enter message content: ");
//         String content = sc.nextLine();

       

//     }

//     // Parent viewing messages
//     private static void testViewMessagesParent(int parentId) {
//         System.out.println("Messages for Parent ID: " + parentId);
       
//         Scanner sc = new Scanner(System.in);
//         System.out.print("Enter Message ID to acknowledge (or 0 to skip): ");
//         int msgId = sc.nextInt();
//         if (msgId != 0) {
//             boolean ok = DBHandler.acknowledgeMessageByParent(msgId);
//             System.out.println(ok ? "Message acknowledged." : "Failed to acknowledge.");
//         }
//     }

//     // Child viewing messages
//     private static void testViewMessagesChild(int childId) {
//         System.out.println("Messages for Child ID: " + childId);
        

//         Scanner sc = new Scanner(System.in);
//         System.out.print("Enter Message ID to acknowledge (or 0 to skip): ");
//         int msgId = sc.nextInt();
//         if (msgId != 0) {
//             boolean ok = DBHandler.acknowledgeMessageByChild(msgId);
//             System.out.println(ok ? "Message acknowledged." : "Failed to acknowledge.");
//         }
//     }
//     // ...existing code...

//     private static void testStoreLocation() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Device ID: ");
//         int deviceId = sc.nextInt();

//         System.out.print("Enter Latitude (-90 to 90): ");
//         double latitude = sc.nextDouble();

//         System.out.print("Enter Longitude (-180 to 180): ");
//         double longitude = sc.nextDouble();

//         System.out.println("\nStoring location data...");

       
//     }

//     // Parent viewing thte childs location
//     private static void testViewChildLocation() {
//         Scanner sc = new Scanner(System.in);

//         System.out.print("Enter Parent ID: ");
//         int parentId = sc.nextInt();

//         System.out.print("Enter Child ID to view location: ");
//         int childId = sc.nextInt();

      
//     }

//     public static void main(String[] args) {
//         Scanner sc = new Scanner(System.in);

//         System.out.println("Choose test:");
//         System.out.println("1. Signup");
//         System.out.println("2. Login");
//         System.out.println("3. Add Child");
//         System.out.println("4. Update Child");
//         System.out.println("5. Pair Device");
//         System.out.println("6. Deactivate Device");
//         System.out.println("7. Set Safe Zone");
//         System.out.println("8. Update Device Status");
//         System.out.println("9. View Child Details");
//         System.out.println("10. Send Message from Parent to Child");
//         System.out.println("11. Send Message from Child to Parent");
//         System.out.println("12. View Messages for Parent");
//         System.out.println("13. View Messages for Child");
//         System.out.println("14. Store Location Data");
//         System.out.println("15. View Child Location");
//         System.out.print("Enter choice: ");
//         int ch = sc.nextInt();

//         if (ch == 1) {
//             testSignup();
//         } else if (ch == 2) {
//             testLogin();
//         } else if (ch == 3) {
//             testAddChild();
//         } else if (ch == 4) {
//             testUpdateChild();
//         } else if (ch == 5) {
//             testPairDevice();
//         } else if (ch == 6) {
//             testDeactivateDevice();
//         } else if (ch == 7) {
//             testSetSafeZone();
//         } else if (ch == 8) {
//             testUpdateDeviceStatus();
//         } else if (ch == 9) {
//             testViewChildDetails();
//         } else if (ch == 10) {
//             testSendMessageFromParent();
//         } else if (ch == 11) {
//             testSendMessageFromChild();
//         } else if (ch == 12) {
//             System.out.print("Enter Parent ID to view messages: ");
//             int parentId = sc.nextInt();
//             testViewMessagesParent(parentId);
//         } else if (ch == 13) {
//             System.out.print("Enter Child ID to view messages: ");
//             int childId = sc.nextInt();
//             testViewMessagesChild(childId);
//         } else if (ch == 14) {
//             testStoreLocation();
//         } else if (ch == 15) {
//             testViewChildLocation();
//         } else {
//             System.out.println("Invalid choice.");
//         }

//     }

// }
