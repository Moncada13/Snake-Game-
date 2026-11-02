# Design: Leaderboard Frontend Integration & Score Submission Flow (US-07)

## Context

With client-side Snake gameplay (`US-01`..`US-04`) and the backend Top-5 Leaderboard REST API (`US-05`..`US-06`), `US-07` connects the React frontend to `GET /api/scores` and `POST /api/scores`. See `proposal.md` for motivation and `specs/leaderboard-frontend-integration/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Implement `frontend/src/services/scoreService.ts` (`getTopScores` and `submitScore`) and `frontend/src/game/leaderboardUtils.ts` (`isScoreEligibleForTopFive` and `validatePlayerName`).
- Enhance `LeaderboardPanel` to render 5 ranked slots (`#1`..`#5`) with populated entries and `-` placeholders, loading state, non-blocking error banner (`"Unable to load leaderboard"`), status notice, and highlighted newly saved row (`highlightedScoreId`).
- Implement `ScoreSubmissionModal` with auto-focused player name input (`maxLength={30}`), client-side validation, double-submit lock (`isSubmitting`), and error display.
- Integrate leaderboard lifecycle into `SnakeGame` on mount, `GAME_OVER`, and `Reset`.

**Non-Goals:**
- Modifying core snake movement, apple spawning, or collision mechanics (`US-02`..`US-04`).
- Modifying backend database schema or API contracts (`US-05`..`US-06`).

## Decisions

### 1. Frontend Leaderboard State & Non-Blocking Error Isolation in `SnakeGame`
- **Decision**: Manage leaderboard state inside `SnakeGame` (`items`, `isLoading`, `loadError`, `isSubmitting`, `submitError`, `hasSubmitted`, `highlightedScoreId`, `statusNotice`) and pass pure props down to `LeaderboardPanel` and `ScoreSubmissionModal`.
  - On mount, `SnakeGame` calls `scoreService.getTopScores()`. If it rejects, `loadError` is set to `"Unable to load leaderboard"` and rendered inside `LeaderboardPanel` (`data-testid="leaderboard-error"`), while game loop and controls remain 100% functional.
  - When `state.status === 'GAME_OVER'`, `isScoreEligibleForTopFive(state.score, items)` checks `score >= 100 && score % 100 === 0 && (items.length < 5 || score > items[4].score)`. If `true` and `!hasSubmitted`, `ScoreSubmissionModal` is rendered.
  - Clicking `Reset` clears `hasSubmitted`, `submitError`, `statusNotice`, and closes the modal.
- **Rationale**: Keeps `gameStateReducer` pure and synchronous while isolating async network state in the container component (`docs/frontend-standards.md`).
- **Alternatives Considered**: Embedding async network calls inside `gameStateReducer`. Rejected because React reducers must be pure and side-effect free.

### 2. Single-Round-Trip Leaderboard Sync on Submission
- **Decision**: Update `items` directly from `response.leaderboard` returned by `POST /api/scores` (`201 Created` or `200 OK`) and set `highlightedScoreId = response.entry?.id ?? null`.
- **Rationale**: Avoids an extra `GET /api/scores` network round-trip after submission and immediately highlights the player's newly achieved rank.

## Risks / Trade-offs

- **[Risk: Concurrent Player Claims 5th Place Before Modal Submit]** Between `GAME_OVER` and the player clicking `Submit`, another player might submit a higher score, causing `POST /api/scores` to return `200 OK` (`saved: false`).
  - *Mitigation*: Handle `saved === false` gracefully by updating `items` from `response.leaderboard`, closing the modal, and displaying `"Score no longer qualifies for Top 5"`.

