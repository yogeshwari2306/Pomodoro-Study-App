package com.example.pomodoro.repository;

import com.example.pomodoro.model.TimerSettings;
import org.springframework.stereotype.Repository;

// Unlike the other repositories, there is only ever ONE settings record
// for this app, so we just keep a single object in memory instead of a Map.
@Repository
public class TimerSettingsRepository {

    // Starts out with the default Pomodoro values from the spec:
    // 25 min focus / 5 min short break / 15 min long break / 4 sessions
    private TimerSettings settings = new TimerSettings(1L, 25, 5, 15, 4);

    public TimerSettings find() {
        return settings;
    }

    public TimerSettings save(TimerSettings newSettings) {
        newSettings.setId(1L); // always overwrite the single row, id = 1
        this.settings = newSettings;
        return settings;
    }
}
