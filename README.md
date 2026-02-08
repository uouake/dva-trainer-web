# dva-trainer-web

Web-only DVA-C02 trainer.

- Frontend: Angular (latest)
- Backend: NestJS (hexagonal-ish structure: domain + application + adapters)
- DB: Postgres via Docker (Colima-compatible)

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

## Project structure

- `frontend/` Angular app
- `backend/` NestJS app
- `docker-compose.yml` local Postgres

## Notes

This repo is now a working local V1:
- Daily routine + exam runner
- Attempts persistence
- Dashboard KPIs + weak concepts
- Domain breakdown (requires enriched question bank with `domainKey`)

Notes:
- The question bank can be enriched (domainKey + beginner-friendly FR explanations) via:
  `cd backend && npm run questions:enrich`
