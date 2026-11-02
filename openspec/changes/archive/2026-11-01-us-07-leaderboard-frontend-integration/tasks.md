# Tasks: US-07 Leaderboard Frontend Integration & Score Submission Flow

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/US-07-leaderboard-frontend-integration` from `main` and verify with `git branch --show-current`

## 1. Frontend Leaderboard Utilities, API Client & LeaderboardPanel (TDD)

- [x] 1.1 Write unit tests in `frontend/src/game/leaderboardUtils.test.ts` and `frontend/src/services/scoreService.test.ts` covering `isScoreEligibleForTopFive`, `validatePlayerName`, `getTopScores()`, and `submitScore()`
- [x] 1.2 Implement `frontend/src/game/leaderboardUtils.ts` and `frontend/src/services/scoreService.ts`, and verify unit tests pass with 100% coverage
- [x] 1.3 Update `frontend/src/components/LeaderboardPanel/LeaderboardPanel.test.tsx` and `frontend/src/components/LeaderboardPanel/LeaderboardPanel.tsx` (plus `LeaderboardPanel.css`) to render live Top 5 items with `-` placeholder slots, loading indicator, non-blocking error banner (`"Unable to load leaderboard"`), status notice, and highlighted newly saved row (`highlightedScoreId`)

## 2. Frontend ScoreSubmissionModal & SnakeGame Integration (TDD)

- [x] 2.1 Write component tests in `frontend/src/components/ScoreSubmissionModal/ScoreSubmissionModal.test.tsx` covering auto-focus, client-side validation error display (`data-testid="submit-score-error"`), double-submit button lock (`isSubmitting`), and form submission
- [x] 2.2 Implement `frontend/src/components/ScoreSubmissionModal/ScoreSubmissionModal.tsx` and `frontend/src/components/ScoreSubmissionModal/ScoreSubmissionModal.css`, and verify component tests pass with 100% coverage
- [x] 2.3 Update `frontend/src/components/SnakeGame/SnakeGame.tsx` and `frontend/src/components/SnakeGame/SnakeGame.test.tsx` to load Top 5 scores on mount, open `ScoreSubmissionModal` on qualifying `GAME_OVER`, update and highlight the leaderboard on `201 Created`, handle `200 OK` (`saved: false`) and network errors gracefully, and reset submission state on `Reset`

## 3. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 3.1 Step N: Review and Update Existing Unit Tests - Run `npm --prefix frontend test` and `npm --prefix backend test` to confirm all test suites pass
- [x] 3.2 Step N+1: Run Unit Tests & Database State Verification - Execute `npm --prefix frontend run test:coverage` and `npm --prefix backend run test:coverage`, verify pre/post persistence state invariants, and generate report at `openspec/changes/us-07-leaderboard-frontend-integration/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 3.3 Step N+2: Manual Endpoint Testing - Verify `/api/scores` integration and generate report at `openspec/changes/us-07-leaderboard-frontend-integration/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 3.4 Step N+3: End-to-End (E2E) Testing - Verify full-stack leaderboard load, Game Over score submission, Top 5 table update, and database state restoration, and generate report at `openspec/changes/us-07-leaderboard-frontend-integration/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 3.5 Step N+4: Update Technical Documentation - Update `docs/development_guide.md` and `README.md` with complete full-stack startup and testing instructions

## Workflow follow-up

- Verify all change requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`

