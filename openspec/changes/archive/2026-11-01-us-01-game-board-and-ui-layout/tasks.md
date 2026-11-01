# Tasks

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create and switch to feature branch `feature/US-01-game-board-layout` from `main` and verify current branch with `git branch --show-current`

## 1. Frontend Project Scaffolding & Configuration

- [x] 1.1 Create `frontend/package.json`, `frontend/tsconfig.json` (`strict: true`), and Jest + React Testing Library setup (`frontend/src/setupTests.ts`), then verify installation and type-checking succeed with `npm --prefix frontend run typecheck`
- [x] 1.2 Create `frontend/public/index.html`, `frontend/src/index.tsx`, and `frontend/src/index.css` base styles, and verify the project compiles cleanly

## 2. Game Constants, Types & State Machine Reducer (TDD)

- [x] 2.1 Define shared constants (`CELL_SIZE = 30`, `BOARD_COLUMNS = 5`, `BOARD_ROWS = 5`, `BOARD_WIDTH = 150`, `BOARD_HEIGHT = 150`, `SNAKE_COLOR = '#22c55e'`, `APPLE_COLOR = '#ef4444'`, `BOARD_BACKGROUND_COLOR = '#111827'`, `GRID_LINE_COLOR = '#1f2937'`, `BOARD_BORDER_COLOR = '#f9fafb'`) in `frontend/src/game/constants.ts` and types (`GameStatus`, `Position`, `GameState`, `GameAction`) in `frontend/src/game/types.ts`, verifying compilation with `tsc --noEmit`
- [x] 2.2 Write failing unit tests in `frontend/src/game/gameStateReducer.test.ts` covering `INITIAL_GAME_STATE` and all transitions across `IDLE`, `RUNNING`, and `GAME_OVER` for `START`, `RESET`, and `GAME_OVER` actions, then implement `frontend/src/game/gameStateReducer.ts` and verify all reducer tests pass with 100% branch coverage

## 3. Canvas Board Renderer Utilities (TDD)

- [x] 3.1 Write failing unit tests in `frontend/src/game/boardRenderer.test.ts` using a mocked `CanvasRenderingContext2D` to verify `drawBoard` fills the arena background, draws the 30px grid lines, and strokes the outer border, and `drawCell` fills a `30px × 30px` square at `(x, y)`
- [x] 3.2 Implement `drawBoard` and `drawCell` in `frontend/src/game/boardRenderer.ts` and verify `boardRenderer.test.ts` passes with ≥ 90% coverage

## 4. UI Components: ScoreBoard, ControlPanel, LeaderboardPanel & GameBoard (TDD)

- [x] 4.1 Write failing component tests in `frontend/src/components/ScoreBoard/ScoreBoard.test.tsx` and implement `ScoreBoard.tsx` (`data-testid="score-value"`, `aria-live="polite"`), verifying the tests pass
- [x] 4.2 Write failing component tests in `frontend/src/components/ControlPanel/ControlPanel.test.tsx` (verifying `Start` enabled only in `IDLE`, `Reset` always enabled, and `blur()` called on click for both buttons) and implement `ControlPanel.tsx`, verifying all tests pass
- [x] 4.3 Write failing component tests in `frontend/src/components/LeaderboardPanel/LeaderboardPanel.test.tsx` (verifying heading `Top 5 Leaderboard` and 5 ranked placeholder rows `#1`–`#5` with `-`) and implement `LeaderboardPanel.tsx`, verifying all tests pass
- [x] 4.4 Write failing component tests in `frontend/src/components/GameBoard/GameBoard.test.tsx` (verifying `<canvas>` dimensions `150px × 150px`, `role="img"`, `aria-label`, HiDPI scaling, and `data-testid="game-over-overlay"` rendered when `status === 'GAME_OVER'`) and implement `GameBoard.tsx`, verifying all tests pass

## 5. Root SnakeGame Integration & App Entry (TDD)

- [x] 5.1 Write failing integration tests in `frontend/src/components/SnakeGame/SnakeGame.test.tsx` covering initial render (`IDLE`, score `0`, `Start` enabled), clicking `Start` (`RUNNING`, `Start` disabled), and clicking `Reset` (`IDLE`, score `0`, `Start` re-enabled), then implement `SnakeGame.tsx` and `frontend/src/App.tsx` and verify all tests pass

## 6. Review and Update Existing Unit Tests (MANDATORY)

- [x] 6.1 Review all unit and component test suites under `frontend/src/**/*.test.{ts,tsx}` to ensure edge cases, accessibility roles, and all scenarios in `specs/game-board-ui/spec.md` are covered

## 7. Run Unit Tests and Verify Database State (MANDATORY - AGENT MUST EXECUTE)

- [x] 7.1 Execute the full frontend test suite with coverage (`npm --prefix frontend run test:coverage`), verify ≥ 90% coverage across statements, branches, functions, and lines, confirm zero unintended database/environment mutations (no backend DB writes in `US-01`), and generate report `openspec/changes/us-01-game-board-and-ui-layout/reports/YYYY-MM-DD-step-N+1-unit-test-and-db-verification.md`

## 8. Manual Endpoint Verification with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Verify via `curl` against the local dev server that the frontend application serves `HTTP 200 OK` and confirm no backend API endpoints are invoked during `US-01`, documenting the command and output in the verification report

## 9. Frontend: E2E Testing with Playwright MCP (MANDATORY - AGENT MUST EXECUTE)

- [x] 9.1 Start the frontend server, navigate to the application URL using Playwright MCP (`browser_navigate`), take a snapshot (`browser_snapshot`), and verify the `150px × 150px` canvas board, `Score: 0`, `Top 5 Leaderboard` with 5 placeholder rows, and `Start`/`Reset` buttons are rendered
- [x] 9.2 Execute the interactive workflow with Playwright MCP (`browser_click` on `Start` → verify `Start` becomes disabled and loses focus; `browser_click` on `Reset` → verify `Start` is re-enabled and score reads `0`) and document the E2E results in the change `reports/` folder

## 10. Update Technical Documentation (MANDATORY)

- [x] 10.1 Update `docs/development_guide.md` with the Snake Game frontend setup, start, build, and test commands and verify all documented commands run as written

## Workflow follow-up

- Run `/verify us-01-game-board-and-ui-layout` (or `/opsx-verify`) and `/adversarial-review us-01-game-board-and-ui-layout` before archiving.
- Archive the completed change with `/opsx-archive us-01-game-board-and-ui-layout` and commit via `/commit`.

