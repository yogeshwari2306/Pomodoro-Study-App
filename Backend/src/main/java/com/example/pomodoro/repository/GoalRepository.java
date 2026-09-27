package com.example.pomodoro.repository;

import com.example.pomodoro.model.Goal;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class GoalRepository {

    private final Map<Long, Goal> goals = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public Optional<Goal> findByDate(LocalDate date) {
        return goals.values().stream()
                .filter(goal -> goal.getDate().equals(date))
                .findFirst();
    }

    public Optional<Goal> findById(Long id) {
        return Optional.ofNullable(goals.get(id));
    }

    public Goal save(Goal goal) {
        if (goal.getId() == null) {
            goal.setId(idCounter.getAndIncrement());
        }
        goals.put(goal.getId(), goal);
        return goal;
    }
}
