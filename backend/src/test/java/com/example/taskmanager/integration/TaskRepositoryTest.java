package com.example.taskmanager.integration;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests d'intégration de la couche JPA.
 *
 * @DataJpaTest démarre UNIQUEMENT la couche JPA (pas de contexte HTTP).
 * Utilise H2 en mémoire configuré automatiquement par Spring Boot Test.
 * Chaque test s'exécute dans une transaction rollbackée → isolation garantie.
 *
 * Commande : mvn test  (Surefire inclut les @DataJpaTest)
 */
@DataJpaTest
@DisplayName("TaskRepository — Tests d'Intégration JPA")
class TaskRepositoryTest {

    @Autowired
    TaskRepository repository;

    @Autowired
    TestEntityManager em; // Utile pour insérer des données de test sans passer par le service

    @BeforeEach
    void setUp() {
        // TestEntityManager assure que les entités sont persistées et flushées
        em.persist(new Task("Configurer CI",       "Pipeline GitHub Actions", Task.Status.TODO));
        em.persist(new Task("Écrire les tests",    "JUnit 5 + Mockito",       Task.Status.IN_PROGRESS));
        em.persist(new Task("Mettre en production","Déploiement automatisé",   Task.Status.DONE));
        em.persist(new Task("Optimiser le cache",  "Cache Maven et npm",       Task.Status.TODO));
        em.flush();
    }

    // ────────────────────────────────────────────────────────────────────────
    // findByStatus
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findByStatus()")
    class FindByStatus {

        @Test
        @DisplayName("retourne uniquement les tâches TODO")
        void findByStatus_todo_returnsOnlyTodoTasks() {
            List<Task> result = repository.findByStatus(Task.Status.TODO);

            assertThat(result)
                    .hasSize(2)
                    .allMatch(t -> t.getStatus() == Task.Status.TODO)
                    .extracting(Task::getTitle)
                    .containsExactlyInAnyOrder("Configurer CI", "Optimiser le cache");
        }

        @Test
        @DisplayName("retourne uniquement les tâches IN_PROGRESS")
        void findByStatus_inProgress_returnsOnlyInProgressTasks() {
            List<Task> result = repository.findByStatus(Task.Status.IN_PROGRESS);

            assertThat(result)
                    .hasSize(1)
                    .first()
                    .extracting(Task::getTitle)
                    .isEqualTo("Écrire les tests");
        }

        @Test
        @DisplayName("retourne liste vide si aucune tâche dans ce statut")
        void findByStatus_noMatch_returnsEmptyList() {
            repository.deleteAll();
            em.flush();

            List<Task> result = repository.findByStatus(Task.Status.DONE);

            assertThat(result).isEmpty();
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // findByTitleContainingIgnoreCase
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findByTitleContainingIgnoreCase()")
    class Search {

        @Test
        @DisplayName("recherche insensible à la casse")
        void search_caseInsensitive_returnsMatches() {
            List<Task> result = repository.findByTitleContainingIgnoreCase("CI");

            assertThat(result)
                    .hasSize(1)
                    .first()
                    .extracting(Task::getTitle)
                    .isEqualTo("Configurer CI");
        }

        @Test
        @DisplayName("retourne plusieurs résultats pour une recherche partielle")
        void search_partialMatch_returnsMultiple() {
            List<Task> result = repository.findByTitleContainingIgnoreCase("e");

            // "Écrire les tests", "Mettre en production", "Optimiser le cache"
            assertThat(result).hasSizeGreaterThan(1);
        }

        @Test
        @DisplayName("retourne liste vide si aucune correspondance")
        void search_noMatch_returnsEmptyList() {
            List<Task> result = repository.findByTitleContainingIgnoreCase("XXXX_INEXISTANT");

            assertThat(result).isEmpty();
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // countByStatus
    // ────────────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("countByStatus()")
    class CountByStatus {

        @Test
        @DisplayName("compte correctement les tâches TODO")
        void countByStatus_todo_returns2() {
            assertThat(repository.countByStatus(Task.Status.TODO)).isEqualTo(2L);
        }

        @Test
        @DisplayName("compte correctement les tâches DONE")
        void countByStatus_done_returns1() {
            assertThat(repository.countByStatus(Task.Status.DONE)).isEqualTo(1L);
        }

        @Test
        @DisplayName("retourne 0 quand aucune tâche dans ce statut n'est persistée")
        void countByStatus_emptyStatus_returns0() {
            repository.deleteAll();
            em.flush();

            assertThat(repository.countByStatus(Task.Status.TODO)).isZero();
        }
    }

    // ────────────────────────────────────────────────────────────────────────
    // CRUD de base
    // ────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("save() génère un ID auto-incrémenté")
    void save_newTask_generatesId() {
        Task task = new Task("Nouvelle tâche", Task.Status.TODO);

        Task saved = repository.save(task);

        assertThat(saved.getId()).isNotNull().isPositive();
    }

    @Test
    @DisplayName("save() renseigne createdAt et updatedAt via @PrePersist")
    void save_newTask_setsAuditFields() {
        Task task = new Task("Audit test", Task.Status.TODO);
        Task saved = repository.saveAndFlush(task);

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("delete() supprime la tâche de la base")
    void delete_existingTask_removesFromDb() {
        Task task = em.persist(new Task("À supprimer", Task.Status.DONE));
        em.flush();
        Long id = task.getId();

        repository.deleteById(id);
        em.flush();

        assertThat(repository.findById(id)).isEmpty();
    }
}
