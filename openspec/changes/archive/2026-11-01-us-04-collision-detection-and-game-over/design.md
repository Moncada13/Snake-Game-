# Design: Collision Detection & Game Over Conditions

## Context

With the 150px × 150px arena (`5 × 5` grid of `30px` cells) from US-01, autonomous `150ms` tick movement and arrow controls from US-02, and apple spawning/scoring/growth from US-03 in place, the game engine needs deterministic lose conditions for outer wall collisions and self-collisions. See `proposal.md` for motivation and `specs/collision-and-game-over/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Implement a pure, side-effect-free collision detector (`frontend/src/game/collisionDetector.ts`) with `checkWallCollision` and `checkSelfCollision`.
- Accurately model the classic Snake **tail-vacating rule**: on a non-eating tick, the tail segment (`snake[snake.length - 1]`) vacates its cell on the same tick the head advances, so entering the previous tail coordinate is valid and does not trigger a false self-collision.
- Evaluate collisions in `gameStateReducer` *before* mutating the snake's rendered position so that on `GAME_OVER`, all snake segments remain inside the `[0, 120]` canvas bounds.
- Track `gameOverReason: 'WALL' | 'SELF' | 'BOARD_FULL' | null` in `GameState` for deterministic state inspection and UI presentation.

**Non-Goals:**
- Prompting for the player's name or submitting Top-5 scores to PostgreSQL (covered in US-05, US-06, and US-07).

## Decisions

### 1. Pre-Movement Collision Evaluation & In-Bounds State Freezing
- **Decision**: In `gameStateReducer` (`TICK` handler), compute `nextHead = getNextHeadPosition(state.snake[0], activeDirection)` first, then evaluate `checkWallCollision` and `checkSelfCollision` *before* advancing `state.snake`. When a collision is detected, transition `status` to `'GAME_OVER'`, update `direction: activeDirection`, and keep `state.snake` and `state.score` frozen at their last valid positions.
- **Rationale**: If `state.snake` were advanced prior to checking wall collision, the head segment would be drawn outside the `150px × 150px` canvas (e.g., at `x = -30` or `x = 150`), violating visual bounds integrity. Freezing the snake at its last valid in-bounds coordinate keeps the final board frame clean underneath the Game Over overlay.
- **Alternatives Considered**: Advancing the snake out-of-bounds and clipping at the canvas renderer level. Rejected because keeping out-of-bounds coordinates in `state.snake` breaks coordinate invariants across the engine.

### 2. Tail-Vacating Rule for Self-Collision
- **Decision**: Determine `ateApple = isEatingApple(nextHead, state.apple)` before calling `checkSelfCollision(nextHead, activeBodySegments)`, where `activeBodySegments = ateApple ? state.snake : state.snake.slice(0, -1)`.
- **Rationale**: When `ateApple === false`, the tail segment `state.snake[state.snake.length - 1]` is dropped on the current tick, meaning its grid cell is simultaneously vacated as the head moves into it (e.g., a 4-segment snake chasing its tail in a 2×2 loop). Only when `ateApple === true` is the tail retained, and since an apple never spawns on an occupied cell (`US-03`), `nextHead` cannot coincide with the tail on an eating tick anyway.
- **Alternatives Considered**: Checking `nextHead` against the entire `state.snake` array unconditionally. Rejected because it causes a false-positive self-collision whenever the snake's head follows immediately behind its vacating tail.

### 3. Explicit `gameOverReason` Discriminator in `GameState`
- **Decision**: Add `gameOverReason: 'WALL' | 'SELF' | 'BOARD_FULL' | null` to `GameState` (initialized to `null` in `INITIAL_GAME_STATE` and reset to `null` on `RESET`).
  - Wall collision sets `gameOverReason: 'WALL'`.
  - Self-collision sets `gameOverReason: 'SELF'`.
  - Filling all 25 cells (`nextApple === null`) sets `gameOverReason: 'BOARD_FULL'`.
- **Rationale**: Enables unit tests, E2E tests, and UI components (`GameBoard`) to distinguish why the game ended without guessing from coordinates.

## Risks / Trade-offs

- **[Risk: Queued Direction Not Reflected on Collision Tick]** If a player steers into a wall (`nextDirection`) and the collision branch forgets to commit `direction: activeDirection`, the state would still show the previous tick's direction.
  - *Mitigation*: Explicitly set `direction: activeDirection, nextDirection: activeDirection` when returning the `'GAME_OVER'` state on both wall and self-collision branches.

