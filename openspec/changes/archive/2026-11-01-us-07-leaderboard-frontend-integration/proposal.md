# Proposal: US-07 Leaderboard Frontend Integration & Score Submission Flow

## Why

With the client-side Snake game mechanics (`US-01`..`US-04`) and the backend Top-5 Leaderboard REST API (`US-05`..`US-06`), the browser game needs to fetch and render the live Top 5 leaderboard on startup, prompt players for their name when a game ends with a qualifying score, submit the score via `POST /api/scores`, and highlight newly recorded scores in real time.

## What Changes

- **Frontend HTTP Service & Eligibility Utilities (`frontend/src/services/scoreService.ts`, `frontend/src/game/leaderboardUtils.ts`)**:
  - Implement `scoreService.getTopScores()` (`GET /api/scores`) and `scoreService.submitScore(playerName, score)` (`POST /api/scores`).
  - Implement `isScoreEligibleForTopFive(score, leaderboard)` and client-side `validatePlayerName(playerName)` (`1..30` trimmed characters, no `<` or `>` characters).
- **Live `LeaderboardPanel` Component (`frontend/src/components/LeaderboardPanel/LeaderboardPanel.tsx`)**:
  - Render always 5 ranked rows (`#1`..`#5`) displaying populated entries and `-` placeholder rows for unfilled slots, loading state, non-blocking error banner (`"Unable to load leaderboard"`), status notice, and highlighted newly saved row (`highlightedScoreId`).
- **`ScoreSubmissionModal` & `SnakeGame` Integration (`frontend/src/components/ScoreSubmissionModal/`, `frontend/src/components/SnakeGame/`)**:
  - Render `ScoreSubmissionModal` automatically when `status === 'GAME_OVER'`, `isScoreEligibleForTopFive` is `true`, and `!hasSubmitted`.
  - Disable input and Submit button while `POST /api/scores` is in flight, update and highlight the leaderboard on `201 Created`, handle `200 OK` (`saved: false`) and network errors gracefully, and clear submission state on `Reset`.

## Capabilities

### New Capabilities
- `leaderboard-frontend-integration`: Covers initial leaderboard fetch and 5-row rendering on mount, non-blocking offline degradation, Top-5 eligibility detection on `GAME_OVER`, `ScoreSubmissionModal` submission lifecycle, newly saved row highlighting, and reset state cleanup (`US-07`).

### Modified Capabilities
<!-- None. -->

## Impact

- **Frontend**: `frontend/src/services/scoreService.ts`, `frontend/src/game/leaderboardUtils.ts`, `frontend/src/components/LeaderboardPanel/`, `frontend/src/components/ScoreSubmissionModal/`, `frontend/src/components/SnakeGame/`.
- **Documentation**: `docs/development_guide.md` and `README.md`.

