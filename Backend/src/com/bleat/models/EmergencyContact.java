package com.bleat.models;

public class EmergencyContact {
    private int contactId;
    private String name;
    private String phone;
    private String relation;

    public EmergencyContact(int contactId, String name, String phone, String relation) {
        this.contactId = contactId;
        this.name = name;
        this.phone = phone;
        this.relation = relation;
    }

    public void updateContact(String name, String phone, String relation) {
        this.name = name;
        this.phone = phone;
        this.relation = relation;
    }

    public int getContactId() { return contactId; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getRelation() { return relation; }

    @Override
    public String toString() {
        return "EmergencyContact{" +
                "contactId=" + contactId +
                ", name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", relation='" + relation + '\'' +
                '}';
    }
}
