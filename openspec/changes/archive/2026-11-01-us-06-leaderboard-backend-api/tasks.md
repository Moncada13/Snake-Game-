# Tasks: US-06 Leaderboard REST API (`GET /api/scores` & `POST /api/scores`)

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/US-06-leaderboard-backend-api` from `main` and verify with `git branch --show-current`

## 1. Backend Application Layer: DTOs, Validator & ScoreService (TDD)

- [x] 1.1 Write unit tests in `backend/src/application/__tests__/validator.test.ts` and `backend/src/application/services/__tests__/scoreService.test.ts` covering payload validation (`playerName` 1..30 chars, `<` / `>` rejection, `score` integer multiple of 100 in `100..100000`) and DTO mapping
- [x] 1.2 Implement `backend/src/application/dtos/scoreDtos.ts`, `backend/src/application/validator.ts`, and `backend/src/application/services/scoreService.ts`, and verify unit tests pass with 100% coverage

## 2. Backend Presentation Layer: Controller, Routes, Express Server & OpenAPI Spec (TDD)

- [x] 2.1 Write unit and `supertest` integration tests in `backend/src/presentation/controllers/__tests__/scoreController.test.ts` covering `GET /api/scores` (`200 OK`), `POST /api/scores` (`201 Created` when saved, `200 OK` when non-qualifying, `400 Bad Request` on validation failure, and `500 Internal Server Error` on unexpected repository errors)
- [x] 2.2 Implement `backend/src/infrastructure/logger.ts`, `backend/src/presentation/controllers/scoreController.ts`, `backend/src/routes/scoreRoutes.ts`, `backend/src/app.ts`, and `backend/src/index.ts`, and verify all backend tests pass with $\ge 90\%$ coverage
- [x] 2.3 Document `GET /api/scores` and `POST /api/scores` paths and schemas (`ScoreItemDTO`, `GetScoresResponseDTO`, `CreateScoreRequestDTO`, `SubmitScoreResponseDTO`, `ValidationErrorResponse`, `InternalErrorResponse`) in `docs/api-spec.yml`

## 3. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 3.1 Step N: Review and Update Existing Unit Tests - Run `npm --prefix backend test` and `npm --prefix frontend test` to confirm all test suites pass
- [x] 3.2 Step N+1: Run Unit Tests & Database State Verification - Execute `npm --prefix backend run test:coverage`, verify pre/post persistence state invariants, and generate report at `openspec/changes/us-06-leaderboard-backend-api/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 3.3 Step N+2: Manual Endpoint Testing with `curl` - Start the backend server, execute live HTTP requests (`GET /api/scores`, `POST /api/scores` `201 Created`, `POST /api/scores` `200 OK` non-qualifying, `POST /api/scores` `400 Bad Request`), restore pre-test database state, and generate report at `openspec/changes/us-06-leaderboard-backend-api/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 3.4 Step N+3: End-to-End (E2E) Testing Report - Document backend API E2E request/response lifecycle verification (browser E2E in `US-07`) at `openspec/changes/us-06-leaderboard-backend-api/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 3.5 Step N+4: Update Technical Documentation - Verify `docs/api-spec.yml` and update `docs/development_guide.md` with backend API startup and `curl` usage instructions

## Workflow follow-up

- Verify all change requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`

