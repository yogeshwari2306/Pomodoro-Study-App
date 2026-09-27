package com.example.pomodoro.controller;

import com.example.pomodoro.model.StudySession;
import com.example.pomodoro.service.SessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    // GET /api/sessions
    @GetMapping
    public List<StudySession> getAllSessions() {
        return sessionService.getAllSessions();
    }

    // POST /api/sessions
    @PostMapping
    public ResponseEntity<?> recordSession(@RequestBody StudySession session) {
        try {
            StudySession saved = sessionService.recordSession(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
