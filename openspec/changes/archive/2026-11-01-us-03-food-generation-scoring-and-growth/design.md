# Design: Food Generation, Scoring, and Snake Growth

## Context

With the 150px × 150px board layout (US-01) and autonomous 150ms tick loop + arrow steering (US-02) in place, the game needs apple spawning, eating detection, +100 point scoring, and +1 segment snake growth. Because the board is a compact 5 × 5 grid (25 total cells of 30px × 30px), naive rejection-sampling (`while (overlaps) random()`) risks high retry counts or infinite loops as the snake grows toward 25 segments. See `proposal.md` for motivation and `specs/food-scoring-and-growth/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Implement a deterministic $O(\text{rows} \times \text{cols})$ free-cell pool algorithm (`getAvailableCells` and `spawnApple`) that never loops infinitely.
- Support an optional `rng: () => number` parameter (defaulting to `Math.random`) so unit tests are 100% deterministic.
- Extend `advanceSnake` to support an optional `grow: boolean` flag that retains the tail when eating.
- Increment `score` by `POINTS_PER_APPLE = 100` on apple consumption and transition to `GAME_OVER` if all 25 cells are filled.
- Render the apple in red (`#ef4444`) on the canvas.

**Non-Goals:**
- Wall and self-collision termination (deferred to US-04).
- Persisting high scores to PostgreSQL (deferred to US-05–US-07).

## Decisions

### 1. Free-Cell Pool Enumeration vs Random Retry Loop
- **Decision**: Compute the exact list of unoccupied grid cells in a single pass over the 5 × 5 grid (`25` cells), filtering out any coordinate present in `snake`, then index into `availableCells[Math.floor(rng() * availableCells.length)]`.
- **Rationale**: Guarantees $O(25)$ constant upper-bound execution time regardless of snake length, and cleanly detects the 25-segment board-full condition (`availableCells.length === 0` $\rightarrow$ `null`).
- **Alternatives Considered**: `do { pos = randomCell() } while (isOccupied(pos))`. Rejected because it degrades as the snake grows and hangs infinitely when all 25 cells are occupied.

### 2. Injectable RNG Function (`rng: () => number = Math.random`) & Initial Apple Coordinate
- **Decision**: Pass an optional `rng` callback to `spawnApple` and `gameStateReducer` (defaulting to `Math.random`). Initialize `INITIAL_GAME_STATE.apple` to deterministic `INITIAL_APPLE_POSITION = { x: 90, y: 60 }` on initial mount, while `RESET` and post-consumption ticks randomize the apple coordinate via `spawnApple(..., rng)`.
- **Rationale**: Allows unit, reducer, and E2E tests to assert against a predictable initial mount position (`{ x: 90, y: 60 }`, 2 cells right of `{ x: 30, y: 60 }`) while guaranteeing fresh random unoccupied placement on every consumption and reset. Clamping the index in `spawnApple` (`Math.min(available.length - 1, Math.max(0, ...))`) guards against out-of-range custom `rng` stubs.
- **Alternatives Considered**: `jest.spyOn(Math, 'random')`. Supported implicitly since `Math.random` is the default, while explicit parameter injection keeps pure functions referentially transparent.

### 3. Tail Retention on GrowthTick
- **Decision**: In `advanceSnake(snake, direction, grow = false)`, return `[newHead, ...snake]` when `grow === true` and `[newHead, ...snake.slice(0, -1)]` when `grow === false`.
- **Rationale**: When the head moves into the apple cell, the previous tail cell remains occupied on that tick, naturally increasing the snake's length by 1 segment (`30px × 30px`) before the new apple is spawned against the updated `nextSnake` array.

## Risks / Trade-offs

- **[Risk: New Apple Spawning on Newly Grown Head]** If `spawnApple` were called with the old `state.snake` before prepending `nextHead`, the new apple could spawn right on `nextHead` or the retained tail.
  - *Mitigation*: Always compute `nextSnake = advanceSnake(state.snake, activeDirection, true)` *first*, and pass `nextSnake` into `spawnApple(nextSnake)`.

