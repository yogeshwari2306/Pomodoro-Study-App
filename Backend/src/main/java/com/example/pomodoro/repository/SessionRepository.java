package com.example.pomodoro.repository;

import com.example.pomodoro.model.StudySession;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class SessionRepository {

    private final Map<Long, StudySession> sessions = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public List<StudySession> findAll() {
        return List.copyOf(sessions.values());
    }

    public StudySession save(StudySession session) {
        if (session.getId() == null) {
            session.setId(idCounter.getAndIncrement());
        }
        sessions.put(session.getId(), session);
        return session;
    }
}
