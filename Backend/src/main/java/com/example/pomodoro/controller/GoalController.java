package com.example.pomodoro.controller;

import com.example.pomodoro.model.Goal;
import com.example.pomodoro.service.GoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    // GET /api/goals/today
    @GetMapping("/today")
    public Goal getTodayGoal() {
        return goalService.getTodayGoal();
    }

    // POST /api/goals
    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody Goal goal) {
        try {
            Goal created = goalService.createGoal(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/goals/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        try {
            Goal updated = goalService.updateGoal(id, goal);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
