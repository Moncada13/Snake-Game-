# Design: Expand Game Board to 300px x 300px

## Context

The Snake Game currently configures its playing grid in `frontend/src/game/constants.ts` with `CELL_SIZE = 30`, `BOARD_COLUMNS = 5`, and `BOARD_ROWS = 5`, generating a 150px × 150px arena with 25 total cells. See `proposal.md` for motivation and `specs/game-board-ui/spec.md` for the updated normative requirements.

## Goals / Non-Goals

**Goals:**
- Update `BOARD_COLUMNS` and `BOARD_ROWS` from 5 to 10, resulting in `BOARD_WIDTH = 300` and `BOARD_HEIGHT = 300`.
- Maintain `CELL_SIZE = 30`, preserving the visual fidelity and physics of the snake segments and apples.
- Ensure `GameBoard.tsx`, `appleSpawner.ts`, and `collisionDetector.ts` compute available cells (100 cells) and boundaries (0..270 in bounds; >= 300 or < 0 collision) accurately.
- Ensure the layout in `GameBoard.css` and `SnakeGame.css` accommodates the 300px × 300px arena gracefully beside the Leaderboard sidebar.

**Non-Goals:**
- Changing tick interval (`TICK_INTERVAL_MS = 150`), points per apple (`100`), or Top-5 qualification rules.
- Modifying backend persistence, Prisma schemas, or REST API endpoints.

## Decisions

### 1. Maintain `CELL_SIZE = 30` with `BOARD_COLUMNS = 10` & `BOARD_ROWS = 10`
- **Decision**: Keep `CELL_SIZE = 30` and increase grid dimensions from `5 × 5` to `10 × 10`.
- **Rationale**: Keeps existing segment rendering math, speed per tick (`30px` per `150ms`), and visual aesthetics intact while scaling the board directly to `300px × 300px` (100 total cells).
- **Alternatives Considered**: Keeping 5×5 and scaling `CELL_SIZE` to 60px. Rejected because 25 cells is too cramped for engaging snake gameplay; 100 cells provides a balanced playfield.

### 2. Pure Functional Dynamic Bounds Calculation
- **Decision**: `appleSpawner.ts` already calculates available cells dynamically via `getAvailableCells(snake, boardWidth, boardHeight, cellSize)`. Setting `BOARD_WIDTH = 300` and `BOARD_HEIGHT = 300` automatically expands the cell pool from 25 to 100 without architectural changes.
- **Rationale**: Zero code changes required in the engine algorithms; updates to constants propagate throughout the pure geometry functions.

## Risks / Trade-offs

- **[Risk: Hardcoded 150px in existing unit and E2E test assertions]**: Existing tests in `GameBoard.test.tsx`, `collisionDetector.test.ts`, `appleSpawner.test.ts`, and `e2e-workflow.test.tsx` specifically test `150` boundaries and `25` cell counts.
  - *Mitigation*: Systematically update test fixtures to verify `300px` boundaries, 100 available cells, and wall collisions at `x = 300` or `y = 300`.

