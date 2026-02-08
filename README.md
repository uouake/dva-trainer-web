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

DB will be available on `localhost:5432`.

Credentials (dev):
- user: `dva`
- password: `dva`
- db: `dva_trainer`

### 2) Start backend

```bash
cd backend
npm install
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

This is an MVP scaffold. Next steps:
- add Postgres ORM (likely Prisma) behind repositories (adapters)
- import question bank (`dva-c02.questions.fr.json`)
- implement Dashboard + Daily routine + Exam mode
