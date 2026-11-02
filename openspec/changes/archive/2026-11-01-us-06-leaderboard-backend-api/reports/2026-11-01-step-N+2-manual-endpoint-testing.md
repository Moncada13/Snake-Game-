# Step N+2: Manual Endpoint Testing Report (`curl` - US-06)

- **Change**: `us-06-leaderboard-backend-api`
- **Date**: 2026-11-01
- **Server**: `http://localhost:3010` (`node backend/dist/index.js` with `USE_IN_MEMORY_DB=true`)

## 1. Executed `curl` Test Cases

| # | Method & Endpoint | Request Payload | Expected Status | Actual Status | Result |
|---|---|---|---|---|---|
| 1 | `GET /api/scores` | None | `200 OK` (`{"data":[]}`) | `200 OK` | PASS |
| 2 | `POST /api/scores` (x5) | `Alice` (`1000`), `Bob` (`900`), `Carlos` (`800`), `Diana` (`700`), `Elena` (`500`) | `201 Created` (`saved: true`, `rank: 1..5`) | `201 Created` | PASS |
| 3 | `POST /api/scores` (Non-Qualifying) | `{"playerName":"Frank","score":300}` | `200 OK` (`saved: false`, `rank: null`, `message: "Score does not qualify for Top 5"`) | `200 OK` | PASS |
| 4 | `POST /api/scores` (Qualifying Overflow Eviction) | `{"playerName":"Grace","score":600}` | `201 Created` (`saved: true`, `rank: 5`, evicts `Elena` `500`) | `201 Created` | PASS |
| 5 | `GET /api/scores` | None | `200 OK` (5 entries: `[1000, 900, 800, 700, 600]`) | `200 OK` | PASS |
| 6 | `POST /api/scores` (Invalid XSS & Score) | `{"playerName":"<script>","score":250}` | `400 Bad Request` (`ValidationError`, 2 details) | `400 Bad Request` | PASS |

## 2. Database State Restoration

- The test server process was cleanly terminated after `curl` verification, restoring the persistence state to its pre-test baseline with zero residual test records.

