package com.example.pomodoro.service;

import com.example.pomodoro.model.Goal;
import com.example.pomodoro.repository.GoalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class GoalService {

    private final GoalRepository goalRepository;

    // A sensible default so the Dashboard always has something to show
    // even before the student sets a real goal.
    private static final int DEFAULT_TARGET_MINUTES = 120;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    // Returns today's goal, creating one with the default target if none exists yet.
    public Goal getTodayGoal() {
        LocalDate today = LocalDate.now();
        Optional<Goal> existing = goalRepository.findByDate(today);

        if (existing.isPresent()) {
            return existing.get();
        }

        Goal newGoal = new Goal(null, today, DEFAULT_TARGET_MINUTES, 0);
        return goalRepository.save(newGoal);
    }

    public Goal createGoal(Goal goal) {
        // ---- Validation: target must be a sensible positive number ----
        if (goal.getTargetMinutes() <= 0 || goal.getTargetMinutes() > 1440) {
            throw new IllegalArgumentException("Target minutes must be between 1 and 1440 (24 hours).");
        }
        if (goal.getDate() == null) {
            goal.setDate(LocalDate.now());
        }
        goal.setCompletedMinutes(0);
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, Goal updatedGoal) {
        Optional<Goal> existing = goalRepository.findById(id);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Goal with id " + id + " was not found.");
        }

        Goal goal = existing.get();

        if (updatedGoal.getTargetMinutes() > 0) {
            goal.setTargetMinutes(updatedGoal.getTargetMinutes());
        }
        // completedMinutes can never be negative
        goal.setCompletedMinutes(Math.max(0, updatedGoal.getCompletedMinutes()));

        return goalRepository.save(goal);
    }

    // Called by SessionService (in Stage 8) whenever a focus session completes,
    // so today's goal progress updates automatically.
    public void addMinutesToTodayGoal(int minutes) {
        Goal goal = getTodayGoal();
        goal.setCompletedMinutes(goal.getCompletedMinutes() + minutes);
        goalRepository.save(goal);
    }
}
