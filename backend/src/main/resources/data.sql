-- data.sql : données d'exemple pour le développement
-- Chargé APRÈS la création du schéma grâce à :
--   spring.jpa.defer-datasource-initialization=true
--
-- On NE fixe PAS les IDs : on laisse la séquence auto-increment gérer
-- pour éviter tout conflit lors des INSERT ultérieurs via l'API.
-- Le IF NOT EXISTS évite les doublons au restart (ddl-auto=update).

INSERT INTO tasks (title, description, status, created_at, updated_at)
SELECT 'Configurer le pipeline CI',
       'Créer .github/workflows/ci.yml avec GitHub Actions',
       'DONE',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configurer le pipeline CI');

INSERT INTO tasks (title, description, status, created_at, updated_at)
SELECT 'Écrire les tests unitaires',
       'Couvrir TaskService avec JUnit 5 + Mockito',
       'IN_PROGRESS',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Écrire les tests unitaires');

INSERT INTO tasks (title, description, status, created_at, updated_at)
SELECT 'Ajouter le cache Maven',
       'Utiliser actions/cache@v4 pour ~/.m2/repository',
       'TODO',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Ajouter le cache Maven');

INSERT INTO tasks (title, description, status, created_at, updated_at)
SELECT 'Configurer JaCoCo',
       'Seuil minimum 70% de couverture en lignes',
       'TODO',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configurer JaCoCo');

INSERT INTO tasks (title, description, status, created_at, updated_at)
SELECT 'Déployer sur staging',
       'Pipeline CD déclenché sur merge dans main',
       'TODO',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Déployer sur staging');
