# Proposal: US-06 Leaderboard REST API (`GET /api/scores` & `POST /api/scores`)

## Why

With the PostgreSQL `scores` schema and `PrismaScoreRepository` completed in `US-05`, the backend needs an HTTP Application and Presentation layer (`GET /api/scores` and `POST /api/scores`) so client applications can retrieve the live Top 5 leaderboard and submit validated player scores with deterministic HTTP status codes.

## What Changes

- **Application Layer DTOs, Validator & Service (`backend/src/application/`)**:
  - Add DTO interfaces (`backend/src/application/dtos/scoreDtos.ts`) for `CreateScoreRequestDTO`, `ScoreItemDTO`, `GetScoresResponseDTO`, and `SubmitScoreResponseDTO`.
  - Add payload validator (`backend/src/application/validator.ts`) enforcing `playerName` (`1..30` trimmed characters, no `<` or `>` HTML angle brackets) and `score` (integer multiple of `100` between `100` and `100,000`).
  - Add `ScoreService` (`backend/src/application/services/scoreService.ts`) orchestrating `IScoreRepository` and ISO-8601 DTO mapping.
- **Presentation Layer Controller, Routes & Express Server (`backend/src/presentation/`, `backend/src/routes/`, `backend/src/app.ts`, `backend/src/index.ts`)**:
  - Add `ScoreController` (`backend/src/presentation/controllers/scoreController.ts`) and `scoreRoutes` (`backend/src/routes/scoreRoutes.ts`) mounted at `/api/scores` with CORS, `express.json({ limit: '10kb' })`, and structured error logging (`backend/src/infrastructure/logger.ts`).
- **OpenAPI 3.0 Documentation (`docs/api-spec.yml`)**:
  - Document `GET /api/scores` (`200 OK`) and `POST /api/scores` (`201 Created`, `200 OK`, `400 Bad Request`, `500 Internal Server Error`) and their component schemas.

## Capabilities

### New Capabilities
- `leaderboard-backend-api`: Covers `GET /api/scores` and `POST /api/scores` HTTP endpoints, input validation (`validateCreateScorePayload`), XSS angle-bracket rejection, status code semantics (`201 Created` when saved in Top 5, `200 OK` when valid but not in Top 5, `400 Bad Request` on invalid input), and error handling (`US-06`).

### Modified Capabilities
<!-- None. -->

## Impact

- **Backend**: `backend/src/application/`, `backend/src/presentation/`, `backend/src/routes/`, `backend/src/infrastructure/logger.ts`, `backend/src/app.ts`, `backend/src/index.ts`.
- **Documentation**: `docs/api-spec.yml` and `docs/development_guide.md`.

