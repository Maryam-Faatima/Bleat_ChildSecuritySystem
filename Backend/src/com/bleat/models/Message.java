package com.bleat.models;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

public class Message {
    private static final AtomicInteger ID_GEN = new AtomicInteger(1);

    private int messageId;
    private String content;
    private LocalDateTime timestamp;
    private String status; // e.g., "pending","delivered"

    public Message(String content) {
        this.messageId = ID_GEN.getAndIncrement();
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.status = "pending";
    }

    public boolean validateMessage() {
        return content != null && !content.trim().isEmpty();
    }

    public boolean sendToDevice(ChildDevice device) {
        if (!validateMessage()) return false;
        if (device == null || !device.isActive()) return false;
        // In real system we would push through network; here we just mark delivered
        markDelivered();
        return true;
    }

    public void markDelivered() {
        this.status = "delivered";
    }

    // getters
    public int getMessageId() { return messageId; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getStatus() { return status; }

    @Override
    public String toString() {
        return "Message{" +
                "id=" + messageId +
                ", content='" + content + '\'' +
                ", ts=" + timestamp +
                ", status='" + status + '\'' +
                '}';
    }
}
