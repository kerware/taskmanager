package com.example.taskmanager.controller;

import com.example.taskmanager.dto.StatsDto;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // ── GET /api/tasks ────────────────────────────────────────────────────────
    @GetMapping
    public List<Task> getAll(
            @RequestParam(required = false) Task.Status status,
            @RequestParam(required = false) String search
    ) {
        if (status != null) return service.findByStatus(status);
        if (search != null && !search.isBlank()) return service.search(search);
        return service.findAll();
    }

    // ── GET /api/tasks/{id} ───────────────────────────────────────────────────
    @GetMapping("/{id}")
    public Task getById(@PathVariable Long id) {
        return service.findById(id);
    }

    // ── POST /api/tasks ───────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Task> create(@Valid @RequestBody Task task) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(task));
    }

    // ── PUT /api/tasks/{id} ───────────────────────────────────────────────────
    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @Valid @RequestBody Task task) {
        return service.update(id, task);
    }

    // ── DELETE /api/tasks/{id} ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/tasks/stats ──────────────────────────────────────────────────
    @GetMapping("/stats")
    public StatsDto getStats() {
        return service.getStats();
    }
}
