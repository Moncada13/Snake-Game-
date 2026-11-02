# Step N+3: End-to-End (E2E) Testing Report (US-06)

- **Change**: `us-06-leaderboard-backend-api`
- **Date**: 2026-11-01
- **Scope**: Backend REST API E2E Lifecycle (`GET /api/scores` and `POST /api/scores`)

## 1. Backend API E2E Lifecycle Verification

`US-06` is a backend-only change exposing `GET /api/scores` and `POST /api/scores` (browser UI integration is scoped to `US-07`). The full HTTP request-to-persistence-to-response E2E lifecycle was verified via both `supertest` (`scoreController.test.ts`) and live `curl` HTTP requests against the running Express server (`Step N+2`):

1. Initial `GET /api/scores` returns `200 OK` with `{ "data": [] }`.
2. Submitting 5 qualifying scores via `POST /api/scores` returns `201 Created` and populates ranks `1..5`.
3. Submitting a non-qualifying score (`300` when 5th place is `500`) returns `200 OK` with `saved: false` and leaves the database untouched.
4. Submitting a higher qualifying score (`600`) returns `201 Created`, atomically evicts the previous 5th-place score (`500`), and maintains strictly 5 rows (`[1000, 900, 800, 700, 600]`).
5. Submitting invalid payloads (XSS angle brackets `<script>`, malformed JSON, or non-multiples of 100) returns `400 Bad Request` with structured validation details.

