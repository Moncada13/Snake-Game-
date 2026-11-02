# Step N+2: Manual Endpoint & Frontend API Client Testing Report — US-07 Leaderboard Frontend Integration

- **Date**: 2026-11-01
- **Change**: `us-07-leaderboard-frontend-integration`
- **Branch**: `feature/US-07-leaderboard-frontend-integration`
- **Status**: PASSED

---

## 1. Frontend `scoreService` ↔ Backend `/api/scores` Contract Verification

| Case | Frontend Action | HTTP Request | Backend Response | UI State |
| --- | --- | --- | --- | --- |
| **1. Initial Load (Empty DB)** | `scoreService.getTopScores()` on `SnakeGame` mount | `GET /api/scores` | `200 OK` `{ "data": [] }` | Renders 5 placeholder rows (`#1`..`#5` with `-`) |
| **2. Initial Load (Populated DB)** | `scoreService.getTopScores()` on `SnakeGame` mount | `GET /api/scores` | `200 OK` `{ "data": [{ "rank": 1, "playerName": "Alice", "score": 900 }, ...] }` | Populates `#1..#k` and pads remaining slots up to `#5` with `-` |
| **3. Qualifying Score Submission** | `scoreService.submitScore("Elena", 700)` | `POST /api/scores` `{"playerName":"Elena","score":700}` | `201 Created` `{ "data": { "saved": true, "rank": 2, "entry": {...}, "leaderboard": [...] } }` | Closes modal, updates `LeaderboardPanel`, highlights new entry (`data-highlighted="true"`) |
| **4. Concurrent Tie / Non-Qualifying Submission** | `scoreService.submitScore("Carlos", 100)` when 5th spot was just taken | `POST /api/scores` `{"playerName":"Carlos","score":100}` | `200 OK` `{ "data": { "saved": false, "rank": null, "entry": null, "message": "Score does not qualify for Top 5", "leaderboard": [...] } }` | Closes modal, refreshes `LeaderboardPanel`, displays notice (`data-testid="leaderboard-notice"`) |
| **5. Client-Side Validation** | Submit empty/whitespace name or `> 30` chars | Blocked before `fetch` | N/A | Displays inline error (`data-testid="submit-score-error"`) and keeps modal open |
| **6. Backend Unreachable** | `scoreService.getTopScores()` rejects | `GET /api/scores` network error | Connection refused / 500 | Displays `Unable to load leaderboard` (`data-testid="leaderboard-error"`) without blocking gameplay |

