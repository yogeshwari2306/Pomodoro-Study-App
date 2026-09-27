package com.example.pomodoro.model;

import java.time.LocalDate;

// Represents a daily study-time goal. Matches the "goals" table from Stage 6.
public class Goal {

    private Long id;
    private LocalDate date;
    private int targetMinutes;
    private int completedMinutes;

    public Goal() {
    }

    public Goal(Long id, LocalDate date, int targetMinutes, int completedMinutes) {
        this.id = id;
        this.date = date;
        this.targetMinutes = targetMinutes;
        this.completedMinutes = completedMinutes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getTargetMinutes() {
        return targetMinutes;
    }

    public void setTargetMinutes(int targetMinutes) {
        this.targetMinutes = targetMinutes;
    }

    public int getCompletedMinutes() {
        return completedMinutes;
    }

    public void setCompletedMinutes(int completedMinutes) {
        this.completedMinutes = completedMinutes;
    }
}
