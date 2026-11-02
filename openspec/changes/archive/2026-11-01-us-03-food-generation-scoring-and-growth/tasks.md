# Tasks: US-03 Food Generation, Scoring, and Snake Growth

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/US-03-food-scoring-and-growth` from `main`

## 1. Constants & Type Definitions

- [x] 1.1 Update `frontend/src/game/constants.ts` with `POINTS_PER_APPLE = 100` and verify in `constants.test.ts`
- [x] 1.2 Extend `GameState` in `frontend/src/game/types.ts` with `apple: Position | null`

## 2. Deterministic Apple Spawner (TDD)

- [x] 2.1 Write unit tests in `frontend/src/game/appleSpawner.test.ts` covering `getAvailableCells` and `spawnApple` (non-overlap with snake, deterministic `rng` selection, and `null` return when all 25 grid cells are occupied)
- [x] 2.2 Implement `getAvailableCells` and `spawnApple` in `frontend/src/game/appleSpawner.ts` and verify 100% test coverage

## 3. Snake Engine Growth & Consumption Helpers (TDD)

- [x] 3.1 Write unit tests in `frontend/src/game/snakeEngine.test.ts` for `isEatingApple(head, apple)` and `advanceSnake(snake, direction, grow = true)`
- [x] 3.2 Implement `isEatingApple` and the `grow` parameter on `advanceSnake` in `frontend/src/game/snakeEngine.ts`, verifying 100% test coverage

## 4. Game State Reducer Updates (TDD)

- [x] 4.1 Write unit tests in `frontend/src/game/gameStateReducer.test.ts` for initial apple state, eating an apple (+100 score, +1 segment length, immediate respawn), non-eating tick preservation, and full-board 25-segment `GAME_OVER` transition
- [x] 4.2 Update `frontend/src/game/gameStateReducer.ts` to handle apple spawning on `START`/`RESET` and apple consumption/growth/scoring on `TICK`, verifying 100% test coverage

## 5. Canvas Apple Rendering & UI Integration

- [x] 5.1 Write unit tests in `frontend/src/game/boardRenderer.test.ts` for `drawApple(ctx, apple)` (renders 30px x 30px in `#ef4444` when non-null; no-op when `null`)
- [x] 5.2 Implement `drawApple` in `frontend/src/game/boardRenderer.ts` and verify tests pass
- [x] 5.3 Update `frontend/src/components/GameBoard/GameBoard.tsx` and `frontend/src/components/SnakeGame/SnakeGame.tsx` to pass `apple` and call `drawApple`, verifying `GameBoard.test.tsx` and `SnakeGame.test.tsx` pass

## 6. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 6.1 Step N: Review and Update Existing Unit Tests - Ensure all frontend test suites adapt to `GameState.apple` and pass
- [x] 6.2 Step N+1: Run Unit Tests and Generate Report - Run `npm --prefix frontend run test:coverage` and write verification report to `openspec/changes/us-03-food-generation-scoring-and-growth/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 6.3 Step N+2: Manual Endpoint Testing - Generate report documenting N/A for frontend-only change at `openspec/changes/us-03-food-generation-scoring-and-growth/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 6.4 Step N+3: E2E Integration Testing - Implement and execute automated E2E test verifying apple consumption, +100 score update on `ScoreBoard`, snake elongation, and apple respawn, writing report to `openspec/changes/us-03-food-generation-scoring-and-growth/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 6.5 Step N+4: Update Technical Documentation - Update `docs/development_guide.md` with apple spawner and scoring mechanics

## Workflow follow-up

- Verify all change requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`
