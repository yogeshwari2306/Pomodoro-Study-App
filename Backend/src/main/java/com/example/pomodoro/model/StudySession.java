package com.example.pomodoro.model;

import java.time.LocalDateTime;

// Represents one completed Pomodoro session (a focus session, short break, or long break).
// Matches the "sessions" table from Stage 6.
// (Named "StudySession" instead of "Session" to avoid confusion with other
// unrelated "Session" classes that exist elsewhere in Java libraries.)
public class StudySession {

    private Long id;
    private Long taskId;          // which task this session was for (can be null)
    private int duration;         // in minutes
    private String sessionType;   // "focus", "short", or "long"
    private LocalDateTime completedAt;

    public StudySession() {
    }

    public StudySession(Long id, Long taskId, int duration, String sessionType, LocalDateTime completedAt) {
        this.id = id;
        this.taskId = taskId;
        this.duration = duration;
        this.sessionType = sessionType;
        this.completedAt = completedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
