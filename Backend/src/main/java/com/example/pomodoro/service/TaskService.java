package com.example.pomodoro.service;

import com.example.pomodoro.model.Task;
import com.example.pomodoro.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// The Service layer holds the "business rules" — validation, decisions,
// anything beyond simple storage. Controllers call into here; this class
// calls into the Repository.
@Service
public class TaskService {

    private final TaskRepository taskRepository;

    // Spring automatically supplies the TaskRepository here — this pattern
    // is called "dependency injection". You don't need to `new` it yourself.
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(Task task) {
        // ---- Validation: don't allow empty task titles ----
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Task title cannot be empty.");
        }
        task.setTitle(task.getTitle().trim());
        task.setCompleted(false);
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task updatedTask) {
        Optional<Task> existing = taskRepository.findById(id);
        if (existing.isEmpty()) {
            throw new TaskNotFoundException(id);
        }

        Task task = existing.get();

        if (updatedTask.getTitle() != null && !updatedTask.getTitle().trim().isEmpty()) {
            task.setTitle(updatedTask.getTitle().trim());
        }
        task.setPriority(updatedTask.getPriority());
        task.setCompleted(updatedTask.isCompleted());

        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
    }

    // A small custom exception so the Controller can return a clean 404
    // response when someone tries to update/delete a task that doesn't exist.
    public static class TaskNotFoundException extends RuntimeException {
        public TaskNotFoundException(Long id) {
            super("Task with id " + id + " was not found.");
        }
    }
}
