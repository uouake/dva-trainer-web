# Implémentation Histoire Manga AWS (Onboarding)

## Résumé

Cette implémentation ajoute la fonctionnalité "Histoire Manga AWS" à l'application DVA Trainer, permettant aux utilisateurs d'apprendre les concepts AWS à travers une histoire interactive.

## Fichiers créés/modifiés

### Backend (NestJS)

**Entités:**
- `src/infrastructure/db/chapter.entities.ts` - Entités Chapter et UserChapterProgress

**Module Onboarding:**
- `src/onboarding/onboarding.module.ts` - Module principal
- `src/onboarding/onboarding.service.ts` - Service métier
- `src/onboarding/onboarding.controller.ts` - API endpoints (JWT protégés)
- `src/onboarding/chapters.seeder.ts` - Seeder pour insérer les 7 chapitres

**Tests:**
- `src/onboarding/onboarding.service.spec.ts` - Tests unitaires

**Migration:**
- `src/infrastructure/db/migrations/002-add-onboarding-tables.sql` - Script SQL

**Scripts:**
- `src/scripts/seed-chapters.ts` - Script pour exécuter le seeder

**Modifications:**
- `src/app.module.ts` - Ajout du OnboardingModule

### Frontend (Angular)

**Module Onboarding:**
- `src/app/pages/onboarding/onboarding.service.ts` - Service API
- `src/app/pages/onboarding/onboarding.ts` - Page liste des chapitres
- `src/app/pages/onboarding/onboarding.html` - Template liste
- `src/app/pages/onboarding/onboarding.scss` - Styles liste

- `src/app/pages/onboarding/chapter-reader.ts` - Lecteur de chapitre
- `src/app/pages/onboarding/chapter-reader.html` - Template lecteur
- `src/app/pages/onboarding/chapter-reader.scss` - Styles lecteur

- `src/app/pages/onboarding/quiz.ts` - Quiz
- `src/app/pages/onboarding/quiz.html` - Template quiz
- `src/app/pages/onboarding/quiz.scss` - Styles quiz

- `src/app/pages/onboarding/architecture.ts` - Page architecture
- `src/app/pages/onboarding/architecture.html` - Template architecture
- `src/app/pages/onboarding/architecture.scss` - Styles architecture

- `src/app/pages/onboarding/index.ts` - Exports du module

**Modifications:**
- `src/app/app.routes.ts` - Ajout des routes onboarding (protégées par authGuard)
- `src/app/app.html` - Ajout du lien "📖 Histoire AWS" dans la sidebar
- `src/app/core/auth.guard.ts` - Ajout du functional guard `authGuard`

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/onboarding/chapters` | GET | Liste tous les chapitres |
| `/api/onboarding/chapters/:id` | GET | Détail d'un chapitre |
| `/api/onboarding/chapters/:id/quiz` | GET | Quiz du chapitre (5 questions) |
| `/api/onboarding/progress` | POST | Marquer comme lu / Enregistrer score |
| `/api/onboarding/progress` | GET | Progression utilisateur |

## Routes Frontend

| Route | Component | Description |
|-------|-----------|-------------|
| `/onboarding` | OnboardingPage | Liste des chapitres |
| `/onboarding/chapter/:id` | ChapterReaderPage | Lecture d'un chapitre |
| `/onboarding/quiz/:chapterId` | QuizPage | Quiz du chapitre |
| `/onboarding/architecture` | ArchitecturePage | Schéma d'architecture |

Toutes les routes sont protégées par `authGuard` (JWT requis).

## Chapitres (histoire)

1. **Prologue** (0) - Bienvenue au Cloud
2. **Chapitre 1** - Le Robot Cuisinier (Lambda + IAM + API Gateway)
3. **Chapitre 2** - Le Casier Scolaire Infini (S3 + DynamoDB)
4. **Chapitre 3** - Le Piège du Hacker (Secrets Manager + API Keys)
5. **Chapitre 4** - Les Messagers du Lycée (SQS + SNS)
6. **Chapitre 5** - L'Armée des Robots (CloudWatch + Auto-Scaling + DDOS)
7. **Épilogue** (6) - Architecture de l'App

## Concepts AWS mappés

- `lambda_execution`, `iam_roles`, `least_privilege`, `api_gateway`
- `s3_buckets`, `s3_keys`, `dynamodb_keys`, `dynamodb_indexes`
- `secrets_manager`, `api_keys`, `credentials`
- `sqs_queue`, `sqs_dlq`, `sns_topic`
- `cloudwatch_logs`, `cloudwatch_alarms`, `autoscaling`, `aws_security`

## Déploiement

1. **Base de données:** Exécuter la migration SQL
2. **Seeder:** Lancer `npm run seed-chapters` (à créer dans package.json)
3. **Build:** `npm run build` dans backend et frontend

## Tests

- Backend: `npm test -- --testPathPatterns=onboarding`
- Tests: 4 passés
