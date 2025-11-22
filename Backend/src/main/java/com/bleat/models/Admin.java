package com.bleat.models;

import com.bleat.services.AuthenticationManager;

public class Admin extends User {

    public Admin(int userId, String name, String password) {
        super(userId, name, password);
    }

    public boolean authenticateUser(int userid) {
        // simple delegation to AuthenticationManager
        return AuthenticationManager.getInstance().authenticate(userid);
    }

    public void manageParent(Parent parent) {
        // placeholder to manage a parent profile (create/update/delete)
        System.out.println("Admin " + name + " managing parent " + parent.getName());
    }

    public void viewAuditLog() {
        for (AuditLog log : AuditLog.getLogs()) {
            System.out.println(log);
        }
    }
}
