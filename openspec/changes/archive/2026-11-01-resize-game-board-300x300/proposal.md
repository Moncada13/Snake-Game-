# Proposal: Expand Game Board Dimensions to 300px x 300px

## Why

The original 150px × 150px game arena (5×5 grid with 30px cell size) provides only 25 total cells, severely restricting maneuverability and quickly crowding the board as the snake grows. Expanding the game board to 300px × 300px (10×10 grid with 30px cells) enlarges the playing arena to 100 cells, giving players significantly more space for steering, growth, and competitive scoring while preserving the 30px cell physics.

## What Changes

- **Board Dimensions & Constants (`frontend/src/game/constants.ts`)**:
  - Update `BOARD_COLUMNS` from `5` to `10` and `BOARD_ROWS` from `5` to `10`.
  - Calculate `BOARD_WIDTH` (`10 * 30 = 300px`) and `BOARD_HEIGHT` (`10 * 30 = 300px`).
- **Game Board Canvas & Layout (`frontend/src/components/GameBoard/`)**:
  - Render HTML5 Canvas with `width={300}` and `height={300}` (both in inline style and canvas element attributes).
  - Update canvas accessibility label to `"Snake game board, 300 by 300 pixels"`.
- **Apple Spawner & Collision Boundary (`frontend/src/game/appleSpawner.ts`, `frontend/src/game/collisionDetector.ts`)**:
  - The cell spawner pool expands from 25 cells to 100 cells (`x, y ∈ [0, 30, 60, 90, 120, 150, 180, 210, 240, 270]`).
  - Wall collision boundaries extend from `0..120` to `0..270` (`x, y < 0 || x, y >= 300`).
- **Tests & Documentation**:
  - Update unit and E2E test suites to assert against the 300px × 300px board boundaries.
  - Update `docs/development_guide.md` and `README.md`.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `game-board-ui`: Update the grid-aligned game arena specification to require 300px × 300px canvas dimensions (10 columns by 10 rows of 30px cells).

## Impact

- **Frontend**: `frontend/src/game/constants.ts`, `frontend/src/components/GameBoard/GameBoard.tsx`, `frontend/src/components/GameBoard/GameBoard.css`, `frontend/src/game/appleSpawner.ts`, and test files.
- **Backend / Database**: No breaking changes; backend score submission and Top 5 persistence remain completely compatible.
- **Documentation**: `docs/development_guide.md`, `README.md`.

