package com.example.pomodoro.repository;

import com.example.pomodoro.model.Task;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

// The Repository layer's only job is to store and retrieve data.
// Right now that means an in-memory Map. In Stage 6 we will replace the
// INSIDE of this class with real MySQL queries (using Spring Data JPA) —
// but the Service layer that uses this class won't need to change at all,
// because the method names and behavior will stay the same.
@Repository
public class TaskRepository {

    // ConcurrentHashMap is just a Map that's safe to use even if multiple
    // web requests hit the server at the same time.
    private final Map<Long, Task> tasks = new ConcurrentHashMap<>();

    // Generates a new unique ID each time a task is saved for the first time.
    private final AtomicLong idCounter = new AtomicLong(1);

    public List<Task> findAll() {
        return List.copyOf(tasks.values());
    }

    public Optional<Task> findById(Long id) {
        return Optional.ofNullable(tasks.get(id));
    }

    public Task save(Task task) {
        if (task.getId() == null) {
            // New task — assign it the next available ID
            task.setId(idCounter.getAndIncrement());
        }
        tasks.put(task.getId(), task);
        return task;
    }

    public void deleteById(Long id) {
        tasks.remove(id);
    }

    public boolean existsById(Long id) {
        return tasks.containsKey(id);
    }
}
