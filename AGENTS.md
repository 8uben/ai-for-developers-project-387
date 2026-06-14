# Call Booking Contract (AI for Developers Project 386)

## Project overview

Booking service where an Owner configures event types and Guests book slots.

- **Backend**: Ruby on Rails 8.1 (API-only), SQLite3, RSpec + FactoryBot
- **Frontend**: React 19 + Vite 6 + TypeScript + Mantine UI 7
- **E2E**: Playwright
- **API contract**: TypeSpec → OpenAPI 3.0

## Available make targets

| Target | Description |
|---|---|
| `make setup` | Build images, create DB, run migrations, seed data |
| `make start` | Start backend + frontend via Docker Compose |
| `make build` | Rebuild Docker images |
| `make bash` | Open bash inside backend container |
| `make test` | Run backend RSpec tests |
| `make test-e2e` | Run Playwright e2e tests (uses test DB) |
| `make lint` | Run all linters (RuboCop + ESLint) |
| `make lint-backend` | Run RuboCop |
| `make lint-frontend` | Run ESLint |

## Key directories

- `backend/` — Rails API application
- `frontend/` — React SPA
- `e2e/` — Playwright test specs and fixtures
- `main.tsp` — TypeSpec API contract (source of truth for OpenAPI)

## Notes for agents

- Always run `make lint` before submitting changes.
- The API contract is defined in `main.tsp`; `openapi.yaml` is generated.
- Backend tests use RSpec (`bundle exec rspec`).
- The root `package.json` manages the API contract and e2e tests.
- Frontend uses `openapi-fetch` with types generated from `openapi.yaml`.
- Database: SQLite3.

## Docker / Deploy

- **Production Dockerfile**: `/Dockerfile` (multi-stage: builds frontend, then backend).
- При запуске контейнера автоматически выполняются миграции (`db:prepare`) и стартует Puma.
- Порт задаётся через переменную окружения `PORT` (по умолчанию 3000).
- Фронтенд (React SPA) встроен в образ и отдаётся Rails из `public/`.
- **SPA fallback**: middleware `SpaFallback` отдаёт `index.html` для всех не-API маршрутов (React Router).

### Публичный URL

**Текущий деплой**: https://call-booking-4je6.onrender.com
