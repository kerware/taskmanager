# 📋 TaskManager — Projet Fil Rouge DevOps M1

[![CI](https://github.com/VOTRE_LOGIN/taskmanager/actions/workflows/ci.yml/badge.svg)](https://github.com/VOTRE_LOGIN/taskmanager/actions/workflows/ci.yml)

Application de gestion de tâches construite avec **Spring Boot 3** (backend) et **React 18** (frontend).
Projet fil rouge pour le cours *Pipeline DevOps — RNCP 39765 BC03*.

---

## 🏗 Architecture

```
taskmanager/
├── backend/          # API REST Spring Boot 3 + Java 21
├── frontend/         # SPA React 18 + Vite
├── .github/          # GitHub Actions CI/CD
├── .gitlab-ci.yml    # GitLab CI/CD
└── Jenkinsfile       # Jenkins Declarative Pipeline
```

## 🚀 Démarrage rapide

### Backend

```bash
cd backend
mvn spring-boot:run
# API disponible sur http://localhost:8080
# H2 Console : http://localhost:8080/h2-console
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Interface disponible sur http://localhost:3000
```

---

## 🧪 Tests

### Backend — Pyramide de tests

| Niveau | Fichier | Commande |
|--------|---------|----------|
| Unitaire | `TaskServiceTest.java` | `mvn test` |
| Intégration JPA | `TaskRepositoryTest.java` | `mvn test` |
| API bout-en-bout | `TaskControllerIT.java` | `mvn verify` |

```bash
# Tous les tests (unitaires + intégration + API) + rapport JaCoCo
cd backend && mvn verify

# Tests unitaires uniquement (rapide)
cd backend && mvn test
```

### Frontend — Vitest + Testing Library + MSW

```bash
cd frontend && npm test          # Exécution unique
cd frontend && npm run test:watch # Mode watch (développement)
cd frontend && npm run test:coverage # Avec couverture de code
```

---

## 🔌 API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/tasks` | Liste toutes les tâches |
| `GET` | `/api/tasks?status=TODO` | Filtre par statut |
| `GET` | `/api/tasks?search=CI` | Recherche par titre |
| `GET` | `/api/tasks/{id}` | Détail d'une tâche |
| `POST` | `/api/tasks` | Crée une tâche |
| `PUT` | `/api/tasks/{id}` | Met à jour une tâche |
| `DELETE` | `/api/tasks/{id}` | Supprime une tâche |
| `GET` | `/api/tasks/stats` | Statistiques par statut |
| `GET` | `/actuator/health` | Santé de l'application |

### Exemple — Créer une tâche

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Configurer le pipeline CI", "status": "TODO"}'
```

---

## 🛠 Pipelines CI/CD

Trois configurations sont fournies — choisissez selon votre infrastructure :

### GitHub Actions (`.github/workflows/ci.yml`)

- **Déclencheur** : push sur `main`/`develop`, toute Pull Request vers `main`
- **Jobs parallèles** : `test-backend` + `test-frontend`
- **Déploiement** : `deploy-staging` sur `main` uniquement, après les deux jobs
- **Artefacts** : rapports Surefire, Failsafe, JaCoCo, bundle frontend

### GitLab CI (`.gitlab-ci.yml`)

- **Stages** : `build` → `test` → `deploy`
- **Parallélisme** : `build-backend` et `build-frontend` dans le même stage
- **Rapport JUnit** intégré à l'interface GitLab (onglet Tests des MR)
- **Déploiement production** : manuel (`when: manual`)

### Jenkins (`Jenkinsfile`)

- **Pipeline Declaratif** avec 5 stages
- **Parallélisme** : blocs `parallel` pour build et tests
- **Rapports** : JUnit + HTML Publisher (JaCoCo)
- **Déploiement production** : approbation interactive via `input`

---

## ⚙️ Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `SPRING_DATASOURCE_URL` | URL JDBC PostgreSQL (prod) | H2 en mémoire |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur BDD | `sa` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe BDD | _(vide)_ |
| `SPRING_PROFILES_ACTIVE` | Profil Spring (`prod`) | _(dev)_ |
| `VITE_API_URL` | URL de base de l'API | _(proxy Vite)_ |

---

## 📚 Stack technique

| Couche | Technologie |
|--------|-------------|
| Langage backend | Java 21 (records, text blocks, pattern matching) |
| Framework backend | Spring Boot 3.3 |
| Persistance | Spring Data JPA + Hibernate |
| Base de données | H2 (dev/test) · PostgreSQL 15 (prod) |
| Validation | Jakarta Bean Validation |
| Tests backend | JUnit 5 · Mockito · RestAssured · @DataJpaTest |
| Couverture | JaCoCo (seuil 70%) |
| Framework frontend | React 18 + Vite |
| Client HTTP | Axios |
| Tests frontend | Vitest · Testing Library · MSW |
| CI/CD | GitHub Actions · GitLab CI · Jenkins |

---

*Formation 2025-2026 — RNCP 39765 BC03 — Groupe 3iL*
