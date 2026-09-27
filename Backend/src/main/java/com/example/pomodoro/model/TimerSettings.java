package com.example.pomodoro.model;

// Represents the user's custom timer durations.
// Matches the "timer_settings" table from Stage 6.
// We only ever keep ONE row of settings (this app has a single user), so
// there's no list of these anywhere — just one shared settings object.
public class TimerSettings {

    private Long id;
    private int focusMinutes;
    private int shortBreakMinutes;
    private int longBreakMinutes;
    private int sessionsBeforeLongBreak;

    public TimerSettings() {
    }

    public TimerSettings(Long id, int focusMinutes, int shortBreakMinutes,
                          int longBreakMinutes, int sessionsBeforeLongBreak) {
        this.id = id;
        this.focusMinutes = focusMinutes;
        this.shortBreakMinutes = shortBreakMinutes;
        this.longBreakMinutes = longBreakMinutes;
        this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getFocusMinutes() {
        return focusMinutes;
    }

    public void setFocusMinutes(int focusMinutes) {
        this.focusMinutes = focusMinutes;
    }

    public int getShortBreakMinutes() {
        return shortBreakMinutes;
    }

    public void setShortBreakMinutes(int shortBreakMinutes) {
        this.shortBreakMinutes = shortBreakMinutes;
    }

    public int getLongBreakMinutes() {
        return longBreakMinutes;
    }

    public void setLongBreakMinutes(int longBreakMinutes) {
        this.longBreakMinutes = longBreakMinutes;
    }

    public int getSessionsBeforeLongBreak() {
        return sessionsBeforeLongBreak;
    }

    public void setSessionsBeforeLongBreak(int sessionsBeforeLongBreak) {
        this.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
    }
}
