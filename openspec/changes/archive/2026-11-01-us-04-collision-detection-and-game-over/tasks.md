# Tasks: US-04 Collision Detection & Game Over Conditions

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/US-04-collision-and-game-over` from `main` and verify with `git branch --show-current`

## 1. Type Definitions

- [x] 1.1 Add `GameOverReason = 'WALL' | 'SELF' | 'BOARD_FULL' | null` and extend `GameState` with `gameOverReason: GameOverReason` in `frontend/src/game/types.ts`, verifying `npm --prefix frontend run typecheck`

## 2. Pure Collision Detector Module (TDD)

- [x] 2.1 Write unit tests in `frontend/src/game/collisionDetector.test.ts` covering `checkWallCollision` (left, right, top, bottom boundaries and valid interior cells) and `checkSelfCollision` (body collision, non-collision, and empty body)
- [x] 2.2 Implement `checkWallCollision` and `checkSelfCollision` in `frontend/src/game/collisionDetector.ts` and verify all tests in `collisionDetector.test.ts` pass with 100% coverage

## 3. Game State Reducer Collision & Freeze Integration (TDD)

- [x] 3.1 Write unit tests in `frontend/src/game/gameStateReducer.test.ts` for wall collisions (all 4 walls setting `status: 'GAME_OVER'`, `gameOverReason: 'WALL'`, and freezing in-bounds `snake`/`score`), self-collision (`gameOverReason: 'SELF'`), tail-vacating non-collision on a 4-segment loop, full-board `gameOverReason: 'BOARD_FULL'`, and `RESET` clearing `gameOverReason` to `null`
- [x] 3.2 Update `frontend/src/game/gameStateReducer.ts` to evaluate `checkWallCollision` and `checkSelfCollision` (with tail-vacating slice on non-eating ticks) on `TICK` prior to advancing the snake, and verify `gameStateReducer.test.ts` passes with 100% coverage

## 4. Game Over Overlay & Component Integration

- [x] 4.1 Update `frontend/src/components/GameBoard/GameBoard.tsx`, `frontend/src/components/GameBoard/GameBoard.test.tsx`, `frontend/src/components/SnakeGame/SnakeGame.tsx`, and `frontend/src/components/SnakeGame/SnakeGame.test.tsx` to pass/render `gameOverReason` and verify wall collision $\rightarrow$ `GAME_OVER` overlay $\rightarrow$ `Reset` recovery in component tests

## 5. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 5.1 Step N: Review and Update Existing Unit Tests - Ensure all frontend test suites adapt to `GameState.gameOverReason` and pass via `npm --prefix frontend test`
- [x] 5.2 Step N+1: Run Unit Tests and Generate Report - Run `npm --prefix frontend run test:coverage` and write verification report to `openspec/changes/us-04-collision-detection-and-game-over/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 5.3 Step N+2: Manual Endpoint Testing - Generate report documenting N/A for frontend-only change at `openspec/changes/us-04-collision-detection-and-game-over/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 5.4 Step N+3: E2E Integration Testing - Add and execute automated E2E test in `frontend/src/__tests__/e2e-workflow.test.tsx` verifying wall collision after ticks, `Game Over` overlay appearance with locked score, and `Reset` recovery, writing report to `openspec/changes/us-04-collision-detection-and-game-over/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 5.5 Step N+4: Update Technical Documentation - Update `docs/development_guide.md` with collision detection architecture and tail-vacating rule

## Workflow follow-up

- Verify all change requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`
