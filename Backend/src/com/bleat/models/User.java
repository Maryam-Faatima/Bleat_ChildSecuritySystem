package com.bleat.models;

public abstract class User {
    protected int userId;
    protected String name;
    protected String password;

    public User(int userId, String name, String password) {
        this.userId = userId;
        this.name = name;
        this.password = password;
    }

    public boolean login(String uname, String password) {
        // simple check (demo). Real system must hash password.
        return this.name.equals(uname) && this.password.equals(password);
    }

    public void logout() {
        // In a real app we'd clear session tokens. Here, just print.
        System.out.println(name + " logged out.");
    }

    public boolean validateEmailFormat(String email) {
        if (email == null) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    // getters
    public int getUserId() { return userId; }
    public String getName() { return name; }
}
