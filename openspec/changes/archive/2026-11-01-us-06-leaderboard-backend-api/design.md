# Design: Leaderboard REST API (`GET /api/scores` & `POST /api/scores`)

## Context

With the DDD `Score` entity and `PrismaScoreRepository` (`US-05`) in place, `US-06` adds the Application and Presentation layers for the leaderboard REST API. See `proposal.md` for motivation and `specs/leaderboard-backend-api/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Implement the DDD Application (`scoreDtos.ts`, `validator.ts`, `scoreService.ts`) and Presentation (`scoreController.ts`, `scoreRoutes.ts`, `app.ts`, `index.ts`) layers for `GET /api/scores` and `POST /api/scores`.
- Enforce strict request validation (`playerName` `1..30` trimmed characters without `<` or `>`, `score` integer multiple of `100` in `100..100000`), `express.json({ limit: '10kb' })`, CORS headers, and structured error logging without leaking stack traces.
- Document `GET /api/scores` and `POST /api/scores` in `docs/api-spec.yml`.

**Non-Goals:**
- Prisma schema and database migrations (completed in `US-05`).
- Frontend React components and API client integration (`US-07`).

## Decisions

### 1. Layered DDD Backend Architecture & Injectable Express App Factory
- **Decision**: Separate `createApp(scoreService?)` in `backend/src/app.ts` from the HTTP server bootstrap in `backend/src/index.ts`.
  - `validateCreateScorePayload(body)` in `backend/src/application/validator.ts` returns `{ valid: boolean; errors: string[]; sanitized?: CreateScoreRequestDTO }` so the controller can return all validation errors at once in `400 Bad Request` (`{ error: 'ValidationError', message: 'Invalid score submission payload', details: errors }`).
  - `ScoreService` (`backend/src/application/services/scoreService.ts`) accepts `IScoreRepository` via constructor injection and maps `RankedScore` (`Date`) to `ScoreItemDTO` (`createdAt.toISOString()`).
  - `ScoreController` (`backend/src/presentation/controllers/scoreController.ts`) returns `200 OK` (`{ data }`) for `GET /api/scores`, `201 Created` when `result.saved === true`, `200 OK` with `message: "Score does not qualify for Top 5"` when `result.saved === false`, `400 Bad Request` on validation failure, and `500 Internal Server Error` on unexpected exceptions.
- **Rationale**: Separating `createApp` from `app.listen` enables fast in-process `supertest` integration tests and allows `index.ts` to auto-select `InMemoryPrismaClient` when `USE_IN_MEMORY_DB=true` for live `curl` (Step N+2) verification when no external PostgreSQL daemon is running on the host machine.
- **Alternatives Considered**: Putting validation and Prisma queries directly inside route handlers. Rejected because it violates DDD layered separation (`docs/backend-standards.md`).

### 2. HTTP Status Code Semantics for `POST /api/scores` (`201 Created` vs `200 OK`)
- **Decision**: Return `201 Created` when the submitted score qualifies and is persisted in the Top 5 (`saved: true`), and `200 OK` with `saved: false`, `rank: null`, `entry: null`, `message: "Score does not qualify for Top 5"`, and the current `leaderboard` when the payload is valid but does not beat the 5th-place score.
- **Rationale**: Distinguishes a newly created resource (`201`) from a valid evaluation that did not mutate the Top-5 table (`200`), while returning the latest `leaderboard` in a single round-trip.
- **Alternatives Considered**: Returning `422 Unprocessable Entity` for non-qualifying scores. Rejected because a non-qualifying score is a valid domain outcome, not a malformed client request.

## Risks / Trade-offs

- **[Risk: Host Environment Without Running PostgreSQL Daemon During `curl` Verification]** If Docker/PostgreSQL is not installed on the machine, starting the backend with a live PostgreSQL connection string would fail on `/api/scores`.
  - *Mitigation*: `getPrismaClient()` supports `USE_IN_MEMORY_DB=true` (using the transactional `InMemoryPrismaClient` verified in `US-05`), allowing the Express backend to serve full transactional Top-5 persistence over HTTP on port `3010` during local `curl` tests.

