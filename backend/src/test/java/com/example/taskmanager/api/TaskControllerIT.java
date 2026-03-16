package com.example.taskmanager.api;

import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

/**
 * Tests d'integration API — bout en bout. Integration
 *
 * @SpringBootTest demarre le contexte complet sur un port aleatoire.
 * @TestPropertySource charge application-test.properties (H2 create-drop, pas de data.sql)
 * pour garantir un etat propre a chaque run.
 *
 * Commande : mvn verify  (Failsafe execute les classes *IT.java)
 *
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("TaskController — Tests API (bout en bout)")
class TaskControllerIT {

    @LocalServerPort
    int port;

    @Autowired
    TaskRepository repository;

    @BeforeEach
    void setUp() {
        RestAssured.port    = port;
        RestAssured.basePath = "/api";
        repository.deleteAll();
    }

    // ── GET /api/tasks ────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("GET /tasks -> 200 avec liste vide si aucune tache")
    void getAllTasks_empty_returns200WithEmptyList() {
        given()
            .when().get("/tasks")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("$", hasSize(0));
    }

    @Test
    @Order(2)
    @DisplayName("GET /tasks -> 200 avec toutes les taches")
    void getAllTasks_withData_returnsAllTasks() {
        repository.save(new Task("Tache A", Task.Status.TODO));
        repository.save(new Task("Tache B", Task.Status.DONE));

        given()
            .when().get("/tasks")
            .then()
                .statusCode(200)
                .body("$", hasSize(2))
                .body("title", hasItems("Tache A", "Tache B"));
    }

    @Test
    @DisplayName("GET /tasks?status=TODO -> filtre par statut")
    void getAllTasks_filteredByStatus_returnsOnlyMatchingTasks() {
        repository.save(new Task("A faire",  Task.Status.TODO));
        repository.save(new Task("En cours", Task.Status.IN_PROGRESS));
        repository.save(new Task("Termine",  Task.Status.DONE));

        given()
            .queryParam("status", "TODO")
            .when().get("/tasks")
            .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].status", equalTo("TODO"));
    }

    @Test
    @DisplayName("GET /tasks?search=CI -> recherche par mot-cle")
    void getAllTasks_searchByKeyword_returnsMatches() {
        repository.save(new Task("Configurer CI", Task.Status.TODO));
        repository.save(new Task("Ecrire tests",  Task.Status.TODO));

        given()
            .queryParam("search", "CI")
            .when().get("/tasks")
            .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].title", equalTo("Configurer CI"));
    }

    // ── GET /api/tasks/{id} ───────────────────────────────────────────────────

    @Test
    @DisplayName("GET /tasks/{id} -> 200 si la tache existe")
    void getById_existingTask_returns200() {
        Task saved = repository.save(new Task("Ma tache", Task.Status.TODO));

        given()
            .when().get("/tasks/" + saved.getId())
            .then()
                .statusCode(200)
                .body("title",  equalTo("Ma tache"))
                .body("status", equalTo("TODO"))
                .body("id",     equalTo(saved.getId().intValue()));
    }

    @Test
    @DisplayName("GET /tasks/{id} -> 404 si la tache n'existe pas")
    void getById_missingTask_returns404() {
        given()
            .when().get("/tasks/99999")
            .then()
                .statusCode(404)
                .body("error", containsString("99999"));
    }

    // ── POST /api/tasks ───────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /tasks -> 201 avec la tache creee")
    void createTask_validPayload_returns201() {
        String payload = """
                {
                  "title": "Premiere tache de test",
                  "description": "Creee via API REST",
                  "status": "TODO"
                }
                """;

        given()
            .contentType(ContentType.JSON)
            .body(payload)
            .when().post("/tasks")
            .then()
                .statusCode(201)
                .body("title",       equalTo("Premiere tache de test"))
                .body("description", equalTo("Creee via API REST"))
                .body("status",      equalTo("TODO"))
                .body("id",          notNullValue())
                .body("createdAt",   notNullValue());
    }

    @Test
    @DisplayName("POST /tasks -> 400 si le titre est vide")
    void createTask_blankTitle_returns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                    {"title": "", "status": "TODO"}
                    """)
            .when().post("/tasks")
            .then()
                .statusCode(400)
                .body("fields.title", notNullValue());
    }

    @Test
    @DisplayName("POST /tasks -> 400 si le titre est absent")
    void createTask_missingTitle_returns400() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                    {"status": "TODO"}
                    """)
            .when().post("/tasks")
            .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("POST puis GET -> round-trip complet")
    void createAndFetch_roundTrip_succeeds() {
        Integer id = given()
            .contentType(ContentType.JSON)
            .body("""
                    {"title": "Ecrire le pipeline", "status": "TODO"}
                    """)
            .when().post("/tasks")
            .then()
                .statusCode(201)
                .extract().path("id");

        given()
            .when().get("/tasks/" + id)
            .then()
                .statusCode(200)
                .body("title", equalTo("Ecrire le pipeline"));
    }

    // ── PUT /api/tasks/{id} ───────────────────────────────────────────────────

    @Test
    @DisplayName("PUT /tasks/{id} -> 200 avec les nouvelles valeurs")
    void updateTask_existingTask_returns200() {
        Task saved = repository.save(new Task("Ancien titre", Task.Status.TODO));

        given()
            .contentType(ContentType.JSON)
            .body("""
                    {
                      "title": "Nouveau titre",
                      "description": "Mise a jour via API",
                      "status": "IN_PROGRESS"
                    }
                    """)
            .when().put("/tasks/" + saved.getId())
            .then()
                .statusCode(200)
                .body("title",  equalTo("Nouveau titre"))
                .body("status", equalTo("IN_PROGRESS"))
                .body("id",     equalTo(saved.getId().intValue()));
    }

    @Test
    @DisplayName("PUT /tasks/{id} -> 404 si la tache n'existe pas")
    void updateTask_missingTask_returns404() {
        given()
            .contentType(ContentType.JSON)
            .body("""
                    {"title": "Patch", "status": "DONE"}
                    """)
            .when().put("/tasks/99999")
            .then()
                .statusCode(404);
    }

    // ── DELETE /api/tasks/{id} ────────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /tasks/{id} -> 204 + tache absente apres suppression")
    void deleteTask_existingTask_returns204ThenGone() {
        Task saved = repository.save(new Task("A supprimer", Task.Status.TODO));

        given()
            .when().delete("/tasks/" + saved.getId())
            .then()
                .statusCode(204);

        given()
            .when().get("/tasks/" + saved.getId())
            .then()
                .statusCode(404);
    }

    @Test
    @DisplayName("DELETE /tasks/{id} -> 404 si la tache n'existe pas")
    void deleteTask_missingTask_returns404() {
        given()
            .when().delete("/tasks/99999")
            .then()
                .statusCode(404);
    }

    // ── GET /api/tasks/stats ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /tasks/stats -> 200 avec les compteurs corrects")
    void getStats_returnsCorrectCounts() {
        repository.save(new Task("T1", Task.Status.TODO));
        repository.save(new Task("T2", Task.Status.TODO));
        repository.save(new Task("T3", Task.Status.IN_PROGRESS));
        repository.save(new Task("T4", Task.Status.DONE));

        given()
            .when().get("/tasks/stats")
            .then()
                .statusCode(200)
                .body("todo",       equalTo(2))
                .body("inProgress", equalTo(1))
                .body("done",       equalTo(1))
                .body("total",      equalTo(4));
    }

    @Test
    @DisplayName("GET /tasks/stats -> tous les compteurs a 0 si aucune tache")
    void getStats_empty_returnsZeros() {
        given()
            .when().get("/tasks/stats")
            .then()
                .statusCode(200)
                .body("total", equalTo(0));
    }

    // ── Actuator ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /actuator/health -> 200 UP")
    void actuatorHealth_returns200Up() {
        given()
            .basePath("")
            .when().get("/actuator/health")
            .then()
                .statusCode(200)
                .body("status", equalTo("UP"));
    }
}
