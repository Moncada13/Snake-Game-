# Tasks: Expand Game Board Dimensions to 300px x 300px

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/resize-game-board-300x300` from `main` and verify with `git branch --show-current`

## 1. Board Constants & Engine Boundaries (TDD)

- [x] 1.1 Update `frontend/src/game/constants.ts` to set `BOARD_COLUMNS = 10` and `BOARD_ROWS = 10` (`BOARD_WIDTH = 300`, `BOARD_HEIGHT = 300`)
- [x] 1.2 Update unit tests in `frontend/src/game/constants.test.ts`, `frontend/src/game/appleSpawner.test.ts`, and `frontend/src/game/collisionDetector.test.ts` to verify 100 available grid cells and 300px collision boundaries

## 2. GameBoard Component & Layout Styles (TDD)

- [x] 2.1 Update `frontend/src/components/GameBoard/GameBoard.tsx` to set canvas attributes `width={300}`, `height={300}`, styles, and aria-label to `"Snake game board, 300 by 300 pixels"`
- [x] 2.2 Update `frontend/src/components/GameBoard/GameBoard.test.tsx` and `frontend/src/components/GameBoard/GameBoard.css` (and `SnakeGame.css` if needed) to ensure the 300px × 300px canvas renders crisp and responsive
- [x] 2.3 Update `frontend/src/__tests__/e2e-workflow.test.tsx` and `frontend/src/components/SnakeGame/SnakeGame.test.tsx` to assert against the 300px board dimensions

## 3. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 3.1 Step N: Review and Update Existing Unit Tests - Run `npm --prefix frontend test` and `npm --prefix backend test` to confirm all test suites pass
- [x] 3.2 Step N+1: Run Unit Tests & Database State Verification - Execute `npm --prefix frontend run test:coverage` and `npm --prefix backend run test:coverage`, and generate report at `openspec/changes/resize-game-board-300x300/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 3.3 Step N+2: Manual Endpoint Testing - Verify frontend and backend compatibility and generate report at `openspec/changes/resize-game-board-300x300/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 3.4 Step N+3: End-to-End (E2E) Testing - Verify full 300px board gameplay, snake steering, apple consumption, wall collision at 300px, and score submission, and generate report at `openspec/changes/resize-game-board-300x300/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 3.5 Step N+4: Update Technical Documentation - Update `docs/development_guide.md` and `README.md` reflecting the 300px × 300px board size

## Workflow follow-up

- Apply changes using `/opsx-apply`
- Verify all requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`
- Commit and push changes using `/commit`

