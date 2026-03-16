package com.example.taskmanager.unit;

import com.example.taskmanager.exception.TaskNotFoundException;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires de TaskService.
 *
 * Aucun contexte Spring — exécution en quelques millisecondes.
 * Le repository est mocké avec Mockito.
 *
 * Commande : mvn test
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService — Tests Unitaires")
class TaskServiceTest {

    @Mock
    TaskRepository repository;

    @InjectMocks
    TaskService service;

    // ────────────────────────────────────────────────────────────────────────
    // findById
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("retourne la tâche quand elle existe")
        void findById_existingTask_returnsTask() {
            Task task = new Task("Apprendre DevOps", Task.Status.TODO);
            task.setId(1L);
            when(repository.findById(1L)).thenReturn(Optional.of(task));

            Task result = service.findById(1L);

            assertThat(result.getTitle()).isEqualTo("Apprendre DevOps");
            assertThat(result.getStatus()).isEqualTo(Task.Status.TODO);
            verify(repository, times(1)).findById(1L);
            verifyNoMoreInteractions(repository);
        }

        @Test
        @DisplayName("lève TaskNotFoundException quand la tâche est absente")
        void findById_missingTask_throwsTaskNotFoundException() {
            when(repository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.findById(99L))
                    .isInstanceOf(TaskNotFoundException.class)
                    .hasMessageContaining("99");

            verify(repository).findById(99L);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // create
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("create()")
    class Create {

        @ParameterizedTest
        @EnumSource(Task.Status.class)
        @DisplayName("crée une tâche avec n'importe quel statut valide")
        void create_anyStatus_persistsAndReturns(Task.Status status) {
            Task input = new Task("Titre", status);
            when(repository.save(any(Task.class))).thenAnswer(inv -> {
                Task saved = inv.getArgument(0);
                saved.setId(42L);
                return saved;
            });

            Task result = service.create(input);

            assertThat(result.getId()).isEqualTo(42L);
            assertThat(result.getStatus()).isEqualTo(status);
            verify(repository).save(input);
        }

        @Test
        @DisplayName("délègue la persistance au repository")
        void create_delegatesToRepository() {
            Task task = new Task("Configurer CI", Task.Status.TODO);
            when(repository.save(task)).thenReturn(task);

            service.create(task);

            verify(repository, times(1)).save(task);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // update
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("met à jour titre, description et statut")
        void update_existingTask_updatesFields() {
            Task existing = new Task("Ancien titre", Task.Status.TODO);
            existing.setId(1L);
            when(repository.findById(1L)).thenReturn(Optional.of(existing));

            Task patch = new Task("Nouveau titre", "Nouvelle description", Task.Status.IN_PROGRESS);

            Task result = service.update(1L, patch);

            assertThat(result.getTitle()).isEqualTo("Nouveau titre");
            assertThat(result.getDescription()).isEqualTo("Nouvelle description");
            assertThat(result.getStatus()).isEqualTo(Task.Status.IN_PROGRESS);
            // Dirty-checking JPA — save() ne doit PAS être appelé explicitement
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("lève TaskNotFoundException si la tâche n'existe pas")
        void update_missingTask_throwsException() {
            when(repository.findById(99L)).thenReturn(Optional.empty());
            Task patch = new Task("Patch", Task.Status.DONE);

            assertThatThrownBy(() -> service.update(99L, patch))
                    .isInstanceOf(TaskNotFoundException.class);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // delete
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("supprime la tâche quand elle existe")
        void delete_existingTask_callsRepositoryDelete() {
            Task task = new Task("À supprimer", Task.Status.DONE);
            task.setId(5L);
            when(repository.findById(5L)).thenReturn(Optional.of(task));

            service.delete(5L);

            verify(repository).delete(task);
        }

        @Test
        @DisplayName("lève TaskNotFoundException si la tâche est absente")
        void delete_missingTask_throwsException() {
            when(repository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(99L))
                    .isInstanceOf(TaskNotFoundException.class)
                    .hasMessageContaining("99");

            verify(repository, never()).delete(any());
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // getStats
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getStats()")
    class GetStats {

        @Test
        @DisplayName("retourne les compteurs agrégés par statut")
        void getStats_returnsAggregatedCounts() {
            when(repository.countByStatus(Task.Status.TODO)).thenReturn(3L);
            when(repository.countByStatus(Task.Status.IN_PROGRESS)).thenReturn(1L);
            when(repository.countByStatus(Task.Status.DONE)).thenReturn(5L);

            var stats = service.getStats();

            assertThat(stats.todo()).isEqualTo(3L);
            assertThat(stats.inProgress()).isEqualTo(1L);
            assertThat(stats.done()).isEqualTo(5L);
            assertThat(stats.total()).isEqualTo(9L);
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // findAll / findByStatus
    // ────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll() délègue au repository et retourne la liste")
    void findAll_delegatesToRepository() {
        List<Task> tasks = List.of(
                new Task("Tâche 1", Task.Status.TODO),
                new Task("Tâche 2", Task.Status.DONE)
        );
        when(repository.findAll()).thenReturn(tasks);

        List<Task> result = service.findAll();

        assertThat(result).hasSize(2);
        verify(repository).findAll();
    }

    @Test
    @DisplayName("findByStatus() filtre les tâches par statut")
    void findByStatus_filtersCorrectly() {
        List<Task> todos = List.of(new Task("T1", Task.Status.TODO));
        when(repository.findByStatus(Task.Status.TODO)).thenReturn(todos);

        List<Task> result = service.findByStatus(Task.Status.TODO);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(Task.Status.TODO);
    }
}
