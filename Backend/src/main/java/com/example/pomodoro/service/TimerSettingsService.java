package com.example.pomodoro.service;

import com.example.pomodoro.model.TimerSettings;
import com.example.pomodoro.repository.TimerSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class TimerSettingsService {

    private final TimerSettingsRepository timerSettingsRepository;

    public TimerSettingsService(TimerSettingsRepository timerSettingsRepository) {
        this.timerSettingsRepository = timerSettingsRepository;
    }

    public TimerSettings getSettings() {
        return timerSettingsRepository.find();
    }

    public TimerSettings updateSettings(TimerSettings newSettings) {
        // ---- Validation: keep values within sensible, non-extreme ranges ----
        if (newSettings.getFocusMinutes() < 1 || newSettings.getFocusMinutes() > 180) {
            throw new IllegalArgumentException("Focus minutes must be between 1 and 180.");
        }
        if (newSettings.getShortBreakMinutes() < 1 || newSettings.getShortBreakMinutes() > 60) {
            throw new IllegalArgumentException("Short break minutes must be between 1 and 60.");
        }
        if (newSettings.getLongBreakMinutes() < 1 || newSettings.getLongBreakMinutes() > 90) {
            throw new IllegalArgumentException("Long break minutes must be between 1 and 90.");
        }
        if (newSettings.getSessionsBeforeLongBreak() < 1 || newSettings.getSessionsBeforeLongBreak() > 10) {
            throw new IllegalArgumentException("Sessions before long break must be between 1 and 10.");
        }

        return timerSettingsRepository.save(newSettings);
    }
}
