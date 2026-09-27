package com.example.pomodoro.controller;

import com.example.pomodoro.model.TimerSettings;
import com.example.pomodoro.service.TimerSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/timer/settings")
public class TimerSettingsController {

    private final TimerSettingsService timerSettingsService;

    public TimerSettingsController(TimerSettingsService timerSettingsService) {
        this.timerSettingsService = timerSettingsService;
    }

    // GET /api/timer/settings
    @GetMapping
    public TimerSettings getSettings() {
        return timerSettingsService.getSettings();
    }

    // PUT /api/timer/settings
    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody TimerSettings settings) {
        try {
            TimerSettings updated = timerSettingsService.updateSettings(settings);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
