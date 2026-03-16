package com.example.taskmanager.service;

import com.example.taskmanager.dto.StatsDto;
import com.example.taskmanager.exception.TaskNotFoundException;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    // ── Queries ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Task> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Task findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<Task> findByStatus(Task.Status status) {
        return repository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Task> search(String keyword) {
        return repository.findByTitleContainingIgnoreCase(keyword);
    }

    @Transactional(readOnly = true)
    public StatsDto getStats() {
        return StatsDto.of(
                repository.countByStatus(Task.Status.TODO),
                repository.countByStatus(Task.Status.IN_PROGRESS),
                repository.countByStatus(Task.Status.DONE)
        );
    }

    // ── Commands ─────────────────────────────────────────────────────────────

    public Task create(Task task) {
        return repository.save(task);
    }

    public Task update(Long id, Task patch) {
        Task existing = findById(id);
        existing.setTitle(patch.getTitle());
        existing.setDescription(patch.getDescription());
        existing.setStatus(patch.getStatus());
        // Dirty-checking JPA — pas besoin d'appeler save() explicitement
        return existing;
    }

    public void delete(Long id) {
        Task task = findById(id); // lève TaskNotFoundException si absent
        repository.delete(task);
    }
}
