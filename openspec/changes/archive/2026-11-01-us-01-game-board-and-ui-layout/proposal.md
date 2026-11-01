# Proposal

## Why

The Snake web application currently has no frontend scaffold or interactive user interface. Establishing the game board arena, control lifecycle (`IDLE`, `RUNNING`, `GAME_OVER`), score display, and Top 5 leaderboard shell is the foundational step (`US-01`) required before snake movement (`US-02`), apple mechanics (`US-03`), collision detection (`US-04`), and leaderboard API integration (`US-07`) can be built.

## What Changes

- Scaffold the `frontend/` React 18 + TypeScript application aligned with `docs/frontend-standards.md`.
- Introduce shared game constants (`CELL_SIZE = 30`, `BOARD_COLUMNS = 5`, `BOARD_ROWS = 5` producing a `150px × 150px` arena, and visual palette constants for the green snake `#22c55e`, red apple `#ef4444`, dark arena `#111827`, grid lines `#1f2937`, and border `#f9fafb`).
- Implement a pure, deterministic state machine reducer (`gameStateReducer`) governing transitions across `IDLE`, `RUNNING`, and `GAME_OVER` via `START`, `RESET`, and `GAME_OVER` actions.
- Implement HTML5 Canvas rendering utilities (`drawBoard`, `drawCell`) with HiDPI (`window.devicePixelRatio`) support.
- Create the core UI components:
  - `SnakeGame`: Root layout orchestrating the board, controls, score HUD, and leaderboard panel.
  - `GameBoard`: `150px × 150px` `<canvas>` with 30px grid lines, visible wall boundaries, accessibility attributes, and a `Game Over` overlay when `status === 'GAME_OVER'`.
  - `ControlPanel`: `Start` button (enabled only in `IDLE`) and `Reset` button (always enabled), both immediately blurring focus on click (`event.currentTarget.blur()`) so subsequent keyboard presses do not accidentally re-trigger button clicks.
  - `ScoreBoard`: Live score counter initialized at `0` with `aria-live="polite"`.
  - `LeaderboardPanel`: Static `Top 5 Leaderboard` shell rendering 5 placeholder slots (`#1` to `#5` with `-`) without performing network requests (API integration is deferred to `US-07`).

## Capabilities

### New Capabilities
- `game-board-ui`: Browser-based game arena layout, 30px-grid HTML5 Canvas board (`150px × 150px`), Start/Reset control panel with keyboard focus protection, live score HUD, Game Over overlay, and Top 5 leaderboard shell container.

### Modified Capabilities
<!-- None - no existing capabilities are modified in this foundational change. -->

## Impact

- **Codebase**: Creates the `frontend/` package (`frontend/package.json`, `frontend/tsconfig.json`, `frontend/src/game/*`, `frontend/src/components/*`, and unit/component/E2E test suites).
- **APIs**: None. Zero HTTP requests are made in `US-01`.
- **Dependencies**: React 18, TypeScript, Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`), Jest, and Playwright for E2E verification.
- **Documentation**: Updates `docs/development_guide.md` with frontend setup, development server, and test execution instructions.

