# Design

## Context

See `proposal.md` for motivation. This change establishes the greenfield `frontend/` React + TypeScript application and implements `US-01` (Game Board Layout, Controls & Game State Shell) following `docs/base-standards.md` and `docs/frontend-standards.md`. Because `US-02` (movement), `US-03` (apple/scoring), `US-04` (collisions), and `US-07` (leaderboard API) build directly on top of `US-01`, the state management and rendering abstractions introduced here must be extensible without refactoring component boundaries later.

## Goals / Non-Goals

**Goals:**
- Provide a clean separation between pure game state transitions (`frontend/src/game/gameStateReducer.ts`), pure canvas rendering utilities (`frontend/src/game/boardRenderer.ts`), and declarative React UI components (`frontend/src/components/*`).
- Centralize all geometry and color constants in `frontend/src/game/constants.ts` (`CELL_SIZE = 30`, `BOARD_COLUMNS = 5`, `BOARD_ROWS = 5`, `BOARD_WIDTH = 150`, `BOARD_HEIGHT = 150`, `SNAKE_COLOR = '#22c55e'`, `APPLE_COLOR = '#ef4444'`) so board dimensions can scale solely by changing constants.
- Guarantee 100% deterministic unit testability of state transitions and canvas drawing operations without requiring a real browser layout engine for unit tests.

**Non-Goals:**
- Implementing the `setInterval` game tick loop or arrow key event listeners (`US-02`).
- Spawning apples or incrementing scores on consumption (`US-03`).
- Detecting wall or self-collisions (`US-04`).
- Making HTTP requests to `/api/scores` (`US-07`).

## Decisions

### 1. HTML5 `<canvas>` vs. DOM Grid Cells for the Game Arena
- **Decision**: Render the game arena using an HTML5 `<canvas>` element (`GameBoard.tsx`) backed by pure helper functions in `boardRenderer.ts` (`drawBoard`, `drawCell`).
- **Rationale**: `<canvas>` provides deterministic pixel geometry (`150px × 150px` with exact `30px × 30px` cells), zero DOM reconciliation overhead on future `150ms` ticks (`US-02`), and clean HiDPI scaling via `window.devicePixelRatio`. Extracting `drawBoard(ctx)` and `drawCell(ctx, position, color)` into a pure module allows unit tests to pass a lightweight mock `CanvasRenderingContext2D` and assert exact `fillRect` / `strokeRect` calls.
- **Alternatives Considered**:
  - *CSS Grid of 25 `<div>` elements*: Simple for a 5×5 board, but couples rendering to React DOM diffing on every tick and makes coordinate pixel math (`x: 0..120`, `y: 0..120`) less direct.

### 2. `useReducer` State Machine vs. Multiple `useState` Hooks
- **Decision**: Manage game status and score via a single pure reducer (`gameStateReducer(state, action)`) consumed with `useReducer` in `SnakeGame.tsx`.
- **Rationale**: In `US-01`, the reducer handles `START`, `RESET`, and `GAME_OVER`. In `US-02`–`US-04`, `TICK` and `CHANGE_DIRECTION` actions will be added to the exact same reducer. A pure reducer function `(state, action) => nextState` can be unit-tested exhaustively in isolation without mounting React components.
- **Alternatives Considered**:
  - *Multiple `useState` hooks (`status`, `score`, `snake`, `direction`)*: Prone to stale closures inside interval callbacks in `US-02` and impossible to update atomically on a single tick.

### 3. Automatic Button Focus Blur on Click
- **Decision**: Call `event.currentTarget.blur()` inside the `onClick` handlers of both the `Start` and `Reset` buttons in `ControlPanel.tsx`.
- **Rationale**: In web browsers, clicking a `<button>` leaves keyboard focus on that button. When the player subsequently presses keyboard keys during gameplay (or `Space` / `Enter`), a focused `Reset` button could be triggered unintentionally. Blurring immediately on click prevents focus-trap bugs before `US-02` introduces keyboard controls.

## Risks / Trade-offs

- **[Risk] JSDOM in Jest does not implement `<canvas>` 2D context natively** → **Mitigation**: `GameBoard.tsx` safely checks `if (!ctx) return;` when `canvas.getContext('2d')` returns `null` in JSDOM, while `boardRenderer.test.ts` tests all drawing primitives directly with a typed mock `CanvasRenderingContext2D`, and Playwright MCP verifies real browser canvas rendering in E2E tests.
- **[Risk] Hard-coded `150` pixel assumptions in components** → **Mitigation**: Export `BOARD_WIDTH = BOARD_COLUMNS * CELL_SIZE` and `BOARD_HEIGHT = BOARD_ROWS * CELL_SIZE` from `constants.ts` and test dynamic grid dimensions in `boardRenderer.test.ts`.

