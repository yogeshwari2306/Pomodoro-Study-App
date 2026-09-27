package com.example.pomodoro.service;

import com.example.pomodoro.model.StudySession;
import com.example.pomodoro.repository.SessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<StudySession> getAllSessions() {
        return sessionRepository.findAll();
    }

    public StudySession recordSession(StudySession session) {
        // ---- Validation: reject negative or zero durations ----
        if (session.getDuration() <= 0) {
            throw new IllegalArgumentException("Session duration must be greater than zero.");
        }
        if (session.getSessionType() == null || session.getSessionType().trim().isEmpty()) {
            throw new IllegalArgumentException("Session type is required (focus, short, or long).");
        }

        session.setCompletedAt(LocalDateTime.now());
        return sessionRepository.save(session);
    }
}
