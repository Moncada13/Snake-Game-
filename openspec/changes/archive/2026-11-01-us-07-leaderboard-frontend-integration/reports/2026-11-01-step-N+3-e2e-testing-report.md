# Step N+3: End-to-End (E2E) Testing Report — US-07 Leaderboard Frontend Integration

- **Date**: 2026-11-01
- **Change**: `us-07-leaderboard-frontend-integration`
- **Branch**: `feature/US-07-leaderboard-frontend-integration`
- **Status**: PASSED

---

## 1. E2E User Journey Scenarios Verified

All 6 Acceptance Criteria scenarios from `US-07` were verified across `frontend/src/components/SnakeGame/SnakeGame.test.tsx` and `frontend/src/__tests__/e2e-workflow.test.tsx`:

1. **Scenario 1 — Initial Leaderboard Load on Mount**:
   - `SnakeGame` fetches `GET /api/scores` on mount and renders populated ranks `#1..#k` alongside `-` placeholders up to rank `#5`.
2. **Scenario 2 — Qualifying Score Triggers Name Input Modal on Game Over**:
   - When `status === 'GAME_OVER'` and `isScoreEligibleForTopFive(score, leaderboard)` is `true` (`score >= 100` and either `leaderboard.length < 5` or `score > leaderboard[4].score`), `ScoreSubmissionModal` (`data-testid="score-submission-modal"`) opens automatically and auto-focuses `data-testid="player-name-input"`.
3. **Scenario 3 — Submitting Valid Player Name Updates Leaderboard**:
   - Submitting `"Elena"` calls `POST /api/scores`, disables the submit button while in flight (`Saving...`), closes the modal on `201 Created`, updates `LeaderboardPanel` from `response.leaderboard`, and highlights the new entry (`data-highlighted="true"`).
4. **Scenario 4 — Non-Qualifying Score Skips Name Input Modal**:
   - When `score === 0` or `leaderboard.length === 5 && score <= leaderboard[4].score`, `ScoreSubmissionModal` does not open on Game Over.
5. **Scenario 5 — Empty or Oversized Player Name Validation**:
   - Submitting `""` or `"   "` displays `"Player name is required"` without calling `POST /api/scores`; `maxLength={30}` and `validatePlayerName` enforce the 30-character cap.
6. **Scenario 6 — Graceful Error Handling When Backend Is Unreachable**:
   - When `GET /api/scores` rejects on mount, `LeaderboardPanel` displays `"Unable to load leaderboard"` (`data-testid="leaderboard-error"`) while allowing the player to click `Start` and play normally.

