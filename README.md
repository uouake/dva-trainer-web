# dva-trainer-web

[![CI/CD Pipeline](https://github.com/uouake/dva-trainer-web/actions/workflows/ci.yml/badge.svg)](https://github.com/uouake/dva-trainer-web/actions/workflows/ci.yml)

Web-only DVA-C02 trainer.

- Frontend: Angular (latest) + Vitest
- Backend: NestJS (hexagonal-ish structure: domain + application + adapters) + Jest
- DB: Postgres via Docker (Colima-compatible)
- CI/CD: GitHub Actions

## Prerequisites

- Node.js 20+
- Docker engine (via Colima works)

## Quick start

### 1) Start Postgres

From repo root:

```bash
docker compose up -d
```

DB will be available on `localhost:5433`.

Credentials (dev):
- user: `dva`
- password: `dva`
- db: `dva_trainer`

### 2) Start backend

```bash
cd backend
cp .env.example .env
npm install

# 1) Create/update DB schema (dev-only)
npm run db:schema

# 2) Seed questions (expects a JSON question bank)
# If needed, set QUESTIONS_JSON_PATH=/absolute/path/to/dva-c02.questions.fr.enriched.json
npm run db:seed

# Start API
npm run start:dev
```

Backend will run on `http://localhost:3000`.

### 3) Start frontend

```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:4200`.

## Testing

### Backend Tests

```bash
cd backend

# Install dependencies
npm install

# Run all unit tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run e2e tests (non-régression)
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

**Tests de non-régression critiques :**
- ✅ `GET /api/health` → retourne `{ok: true}`
- ✅ `GET /api/questions` → retourne 557 questions
- ✅ `POST /api/daily-session/start` → crée une session avec questions
- ✅ Structure des questions validée (champs requis présents)

### Frontend Tests

```bash
cd frontend

# Install dependencies
npm install

# Run all tests (Vitest)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Tests frontend minimum vital :**
- ✅ Dashboard component renders correctly
- ✅ Navigation entre pages fonctionne
- ✅ Bouton "Commencer" sur routine démarre une session

### Run all tests (from root)

```bash
# Backend tests
cd backend && npm test && npm run test:e2e

# Frontend tests
cd frontend && npm test
```

## CI/CD Pipeline

Le projet utilise GitHub Actions pour l'intégration continue :

- **Triggers** : Push sur `main`, `master`, `develop` + Pull Requests
- **Jobs** :
  1. **Backend Tests** : Unit tests + E2E tests avec PostgreSQL
  2. **Frontend Tests** : Tests Vitest + Build verification
  3. **Build Verification** : Build backend + frontend
  4. **Deploy** : Auto-deploy sur Render (sur push main)

### Workflow status

Voir `.github/workflows/ci.yml`

## Project structure

```
dva-trainer-web/
├── .github/workflows/ci.yml    # CI/CD Pipeline
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── health/             # Health check endpoint
│   │   ├── questions/          # Questions API
│   │   ├── sessions/           # Daily session API
│   │   └── ...
│   └── test/
│       └── app.non-regression.e2e-spec.ts  # Tests non-régression
├── frontend/                    # Angular app
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/  # Dashboard page + tests
│   │   │   │   ├── routine/    # Routine page + tests
│   │   │   │   └── exam/       # Exam page
│   │   │   └── ...
│   └── vitest.config.ts        # Vitest configuration
├── docker-compose.yml          # Local Postgres
└── render.yaml                 # Render deployment config
```

## Deployment

Le projet est déployé sur Render via Blueprint :

- **API** : `dva-trainer-api` (Node.js)
- **Web** : `dva-trainer-web` (Static site)
- **Database** : `dva-trainer-db` (PostgreSQL)

Le déploiement est automatique sur chaque push vers `main`.

## Notes

This repo is now a working local V1:
- Daily routine + exam runner
- Attempts persistence
- Dashboard KPIs + weak concepts
- Domain breakdown (requires enriched question bank with `domainKey`)
- Tests de non-régression automatiques
- CI/CD Pipeline complète

Notes:
- The question bank can be enriched (domainKey + beginner-friendly FR explanations) via:
  `cd backend && npm run questions:enrich`
