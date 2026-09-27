package com.example.pomodoro.model;

import java.time.LocalDateTime;

// A simple Java class representing one study task.
// This matches the "tasks" table we'll create in the database in Stage 6.
public class Task {

    private Long id;
    private String title;
    private String priority;      // "low", "medium", "high", or null for no priority
    private boolean completed;
    private LocalDateTime createdAt;

    // Empty constructor — required so frameworks like Spring can build this
    // object automatically from incoming JSON.
    public Task() {
    }

    public Task(Long id, String title, String priority, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    // ---- Getters and setters ----
    // Spring uses these behind the scenes to convert this object to/from JSON.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
