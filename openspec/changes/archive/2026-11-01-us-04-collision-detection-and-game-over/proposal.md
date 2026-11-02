# Proposal: US-04 Collision Detection & Game Over Conditions

## Why

With the game board layout (US-01), continuous movement and steering (US-02), and apple spawning/scoring/growth (US-03) in place, the game currently lacks termination rules when the snake hits the outer arena boundary walls or collides with its own body. Implementing deterministic wall and self-collision detection completes the core Snake gameplay loop and locks the final score for Leaderboard evaluation.

## What Changes

- **Pure Collision Detection Module (`collisionDetector.ts`)**:
  - `checkWallCollision(nextHead, boardWidth, boardHeight)`: Detects when the candidate head coordinate moves outside `[0, BOARD_WIDTH - CELL_SIZE]` (`0..120`) horizontally or `[0, BOARD_HEIGHT - CELL_SIZE]` (`0..120`) vertically.
  - `checkSelfCollision(nextHead, activeBodySegments)`: Detects when the candidate head coordinate coincides with any active body segment, respecting the tail-vacating rule (on a non-eating tick, the last tail segment vacates its coordinate and is excluded from collision checks).
- **Game State & Tick Evaluation Order (`types.ts` & `gameStateReducer.ts`)**:
  - Extend `GameState` with `gameOverReason: 'WALL' | 'SELF' | 'BOARD_FULL' | null`.
  - Evaluate wall collision and self-collision on `TICK` *before* advancing the snake so that on `GAME_OVER`, the snake and score freeze at their last valid in-bounds state (`gameOverReason: 'WALL'` or `'SELF'`), while full-board victory sets `gameOverReason: 'BOARD_FULL'`.
- **Game Over Overlay & Reset Recovery (`GameBoard.tsx` & `SnakeGame.tsx`)**:
  - Display the Game Over overlay (`data-testid="game-over-overlay"`) with the final score and termination reason when `status === 'GAME_OVER'`, halting the tick loop and allowing full reset via the `Reset` button.

## Capabilities

### New Capabilities
- `collision-and-game-over`: Covers 4-wall boundary collision detection, body self-collision detection with tail-vacating accuracy, game loop termination and in-bounds state freezing on `GAME_OVER`, `gameOverReason` tracking (`'WALL' | 'SELF' | 'BOARD_FULL' | null`), and Reset recovery.

### Modified Capabilities
<!-- None. Existing game-board-ui, snake-movement-controls, and food-scoring-and-growth requirements remain intact. -->

## Impact

- **Frontend Code**: Adds `frontend/src/game/collisionDetector.ts` and `collisionDetector.test.ts`. Updates `types.ts`, `gameStateReducer.ts`, `GameBoard.tsx`, and associated unit/integration/E2E tests.
- **APIs & Database**: Client-side game engine only; no backend or database changes in US-04.
- **Testing**: Requires 100% unit and integration test coverage across all wall directions, self-collision, tail-chasing non-collision, and Game Over $\rightarrow$ Reset lifecycle.

