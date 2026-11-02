# Proposal: US-03 Food Generation, Scoring, and Snake Growth

## Why

With the game board layout (US-01) and autonomous snake movement and controls (US-02) complete, the game requires its core objective loop: spawning apples at random unoccupied grid cells, awarding +100 points per apple eaten, growing the snake by one 30px x 30px segment upon consumption, and spawning a replacement apple immediately.

## What Changes

- **Deterministic Free-Cell Apple Spawner (`appleSpawner.ts`)**: Enumerate all 25 grid cells of the 150px x 150px arena, filter out cells currently occupied by any segment of the snake, and pick a random available cell in $O(N)$ time using an injectable `rng` function (`Math.random` by default).
- **Apple Consumption & Snake Growth (`snakeEngine.ts` & `gameStateReducer.ts`)**: Check whether the next head coordinate matches the active apple coordinate on each `TICK`. When eaten:
  - Retain the tail segment (`advanceSnake(snake, dir, true)`) so the snake elongates by 1 segment (30px x 30px).
  - Increment `score` by `POINTS_PER_APPLE = 100`.
  - Spawn a new apple on the remaining unoccupied cells; if 0 unoccupied cells remain (all 25 cells filled), set `apple: null` and transition `status` to `'GAME_OVER'`.
- **Canvas Apple Rendering (`boardRenderer.ts` & `GameBoard.tsx`)**: Render the 30px x 30px apple in red (`APPLE_COLOR = '#ef4444'`) whenever `apple !== null`.

## Capabilities

### New Capabilities
- `food-scoring-and-growth`: Covers random unoccupied-cell apple placement, head-to-apple collision consumption, +100 score increments, +1 segment snake growth per eaten apple, full-board end state handling, and red apple canvas rendering.

### Modified Capabilities
<!-- None. Existing game-board-ui and snake-movement-controls requirements remain intact. -->

## Impact

- **Frontend Code**: Adds `frontend/src/game/appleSpawner.ts` and `appleSpawner.test.ts`. Modifies `constants.ts`, `types.ts`, `snakeEngine.ts`, `gameStateReducer.ts`, `boardRenderer.ts`, `GameBoard.tsx`, and `SnakeGame.tsx`.
- **APIs & Database**: Client-side mechanics only; no backend or database changes in US-03.
- **Testing**: Requires 100% unit and integration test coverage with deterministic RNG injection.

