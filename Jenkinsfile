// ── Jenkinsfile — TaskManager — Declarative Pipeline ─────────────────────────
//
// Prérequis Jenkins :
//   - Plugins : Pipeline, Git, JUnit, HTML Publisher, Blue Ocean (optionnel)
//   - Outil JDK 21  configuré dans Manage Jenkins > Tools > JDK Installations
//   - Outil Maven 3 configuré dans Manage Jenkins > Tools > Maven Installations
//   - Outil Node 20 configuré dans Manage Jenkins > Tools > NodeJS Installations
//
// Configuration du job :
//   New Item > Pipeline > Pipeline script from SCM > Git > URL du dépôt

pipeline {

    // ── Agent : utilise n'importe quel nœud disponible ───────────────────────
    agent any

    // ── Outils (configurés dans Jenkins > Global Tool Configuration) ─────────
    tools {
        maven 'Maven 3'
        jdk   'JDK 21'
        nodejs 'Node 20'
    }

    // ── Options globales ──────────────────────────────────────────────────────
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timestamps()
    }

    // ── Variables d'environnement ─────────────────────────────────────────────
    environment {
        MAVEN_OPTS = '-Dmaven.repo.local=${WORKSPACE}/.m2/repository -Dmaven.test.failure.ignore=false'
    }

    stages {

        // ════════════════════════════════════════════════════════════════════
        // Stage 1 — Checkout
        // ════════════════════════════════════════════════════════════════════
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code récupéré — branche : ${env.BRANCH_NAME} — commit : ${env.GIT_COMMIT.take(8)}"
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // Stage 2 — Build Backend + Frontend (parallèle)
        // ════════════════════════════════════════════════════════════════════
        stage('Build') {
            parallel {

                stage('Backend — Compilation') {
                    steps {
                        dir('backend') {
                            sh 'mvn package -DskipTests --no-transfer-progress'
                        }
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true
                        }
                    }
                }

                stage('Frontend — Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
                        }
                    }
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // Stage 3 — Tests (parallèle)
        // ════════════════════════════════════════════════════════════════════
        stage('Tests') {
            parallel {

                stage('Backend — Tests') {
                    steps {
                        dir('backend') {
                            // mvn verify = Surefire (*Test) + Failsafe (*IT) + JaCoCo check
                            sh 'mvn verify --no-transfer-progress'
                        }
                    }
                    post {
                        always {
                            // Publication des rapports JUnit dans l'interface Jenkins
                            junit(
                                testResults: 'backend/target/surefire-reports/*.xml',
                                allowEmptyResults: true
                            )
                            junit(
                                testResults: 'backend/target/failsafe-reports/*.xml',
                                allowEmptyResults: true
                            )
                            // Rapport de couverture JaCoCo (plugin HTML Publisher)
                            publishHTML(target: [
                                allowMissing:          true,
                                alwaysLinkToLastBuild: true,
                                keepAll:               true,
                                reportDir:             'backend/target/site/jacoco',
                                reportFiles:           'index.html',
                                reportName:            'Couverture JaCoCo'
                            ])
                        }
                    }
                }

                stage('Frontend — Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // Stage 4 — Déploiement Staging (seulement sur main)
        // ════════════════════════════════════════════════════════════════════
        stage('Deploy Staging') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 Déploiement sur staging..."
                echo "   Commit  : ${env.GIT_COMMIT.take(8)}"
                echo "   Build # : ${env.BUILD_NUMBER}"

                // Décommenter pour un vrai déploiement SSH :
                // sshagent(['staging-ssh-key']) {
                //     sh '''
                //         scp backend/target/taskmanager-*.jar user@staging-server:/opt/taskmanager/
                //         ssh user@staging-server "systemctl restart taskmanager"
                //     '''
                // }
                echo "✅ Déploiement staging réussi (simulé)"
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // Stage 5 — Déploiement Production (approbation manuelle)
        // ════════════════════════════════════════════════════════════════════
        stage('Deploy Production') {
            when {
                branch 'main'
            }
            input {
                message "Déployer en production ?"
                ok "Valider le déploiement"
                submitter "admin,lead-dev"
            }
            steps {
                echo "🏁 Déploiement production — commit ${env.GIT_COMMIT.take(8)}"
                // Commandes de déploiement production ici
                echo "✅ Déploiement production réussi (simulé)"
            }
        }
    }

    // ── Actions post-pipeline ─────────────────────────────────────────────────
    post {
        success {
            echo "✅ Pipeline réussi en ${currentBuild.durationString}"
        }
        failure {
            echo "❌ Pipeline échoué !"
            echo "   Branche : ${env.BRANCH_NAME}"
            echo "   Commit  : ${env.GIT_COMMIT}"
            echo "   Auteur  : ${env.GIT_AUTHOR_NAME}"
            echo "   URL     : ${env.BUILD_URL}"
            // Décommenter pour des notifications email :
            // emailext(
            //     subject: "❌ Build #${env.BUILD_NUMBER} échoué — ${env.JOB_NAME}",
            //     body: "Voir les logs : ${env.BUILD_URL}",
            //     to: 'equipe@example.com'
            // )
        }
        always {
            cleanWs() // Nettoyage du workspace Jenkins
        }
    }
}
