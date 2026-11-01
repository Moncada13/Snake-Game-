# Tasks: US-02 Snake Movement & Keyboard Controls

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/US-02-snake-movement-controls` from `main` (or active base)

## 1. Type Definitions & Constants

- [x] 1.1 Extend `frontend/src/game/types.ts` with `Direction` (`'UP' | 'DOWN' | 'LEFT' | 'RIGHT'`), update `GameState` (`snake: Position[]`, `direction: Direction`, `nextDirection: Direction`), and add actions (`TICK`, `CHANGE_DIRECTION`)
- [x] 1.2 Update `frontend/src/game/constants.ts` with `TICK_INTERVAL_MS = 150`, `INITIAL_SNAKE_POSITION = { x: 30, y: 60 }`, and `INITIAL_DIRECTION = 'RIGHT'`, verifying with `constants.test.ts`

## 2. Core Movement Engine (TDD)

- [x] 2.1 Write comprehensive unit tests in `frontend/src/game/snakeEngine.test.ts` covering `isOppositeDirection`, `getNextHeadPosition`, and `advanceSnake`
- [x] 2.2 Implement pure geometry logic in `frontend/src/game/snakeEngine.ts` and verify all tests pass with 100% coverage

## 3. Game State Reducer Updates (TDD)

- [x] 3.1 Write unit tests in `frontend/src/game/gameStateReducer.test.ts` covering initial snake state on `RESET`/initialization, `TICK` advancing head and committing `nextDirection`, valid `CHANGE_DIRECTION`, direct 180° rejection, and anti-glitch rapid double-key inputs
- [x] 3.2 Implement `TICK` and `CHANGE_DIRECTION` action handlers in `frontend/src/game/gameStateReducer.ts` and verify 100% test coverage

## 4. Canvas Snake Renderer & GameBoard

- [x] 4.1 Write unit tests in `frontend/src/game/boardRenderer.test.ts` for `drawSnake`
- [x] 4.2 Implement `drawSnake` in `frontend/src/game/boardRenderer.ts` rendering solid green 30px x 30px rectangles for each segment using `SNAKE_COLOR` (`#22c55e`)
- [x] 4.3 Update `frontend/src/components/GameBoard/GameBoard.tsx` to call `drawSnake` and verify `GameBoard.test.tsx` passes

## 5. Custom Hooks (Game Loop & Keyboard Steering)

- [x] 5.1 Write unit tests in `frontend/src/hooks/useKeyboardControls.test.ts` for arrow key handling, `event.preventDefault()` invocation, and action dispatching
- [x] 5.2 Implement `frontend/src/hooks/useKeyboardControls.ts` listening on `window` keydown events during `RUNNING` status
- [x] 5.3 Write unit tests in `frontend/src/hooks/useGameLoop.test.ts` using `jest.useFakeTimers()` to verify tick intervals and timer cleanup on unmount/status change
- [x] 5.4 Implement `frontend/src/hooks/useGameLoop.ts` managing the `setInterval` lifecycle
- [x] 5.5 Integrate `useGameLoop` and `useKeyboardControls` into `frontend/src/components/SnakeGame/SnakeGame.tsx` and verify `SnakeGame.test.tsx` passes

## 6. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 6.1 Step N: Review and Update Existing Unit Tests - Ensure all existing frontend test suites adapt cleanly to the new `GameState` properties and pass
- [x] 6.2 Step N+1: Run Unit Tests and Generate Report - Run `npm --prefix frontend run test:coverage` and write verification report to `openspec/changes/us-02-snake-movement-and-controls/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 6.3 Step N+2: Manual Endpoint Testing - Generate report documenting N/A for frontend-only change at `openspec/changes/us-02-snake-movement-and-controls/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 6.4 Step N+3: E2E Integration Testing - Implement and execute automated E2E test verifying tick loop movement and arrow steering, writing report to `openspec/changes/us-02-snake-movement-and-controls/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 6.5 Step N+4: Update Technical Documentation - Update `docs/development_guide.md` with new hooks and engine architecture

## Workflow follow-up

- Verify all change requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`

