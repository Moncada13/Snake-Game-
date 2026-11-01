# US-03: Food Generation, Scoring, and Snake Growth

## Original

### Metadata
- **ID**: `US-03`
- **Title**: Random Apple Spawning, Eating Mechanics, Score Increment (+100 Pts), and Growth
- **Module**: Frontend / Game Mechanics & Rules
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** player,  
**I want** a red 30px × 30px apple to spawn randomly on unoccupied grid coordinates, award me 100 points when eaten, and make my snake grow by one segment,  
**So that** I am rewarded for skillful navigation and face progressively increasing difficulty as the snake elongates.

### Context & Requirements
- **Apple Specifications**:
  - Size: exactly **30px width × 30px height**.
  - Color: **Red** (e.g., `#ef4444` / `rgb(239, 68, 68)`).
  - Placement: Spawns randomly on the play board (aligned to 30px increments within the boundaries, e.g., within 150px × 150px box).
  - Placement constraint: The apple must **never** spawn on coordinates currently occupied by any segment of the snake body.
- **Consumption Mechanics**:
  - Eating occurs when the snake's head coordinates (`x, y`) match the apple's coordinates (`x, y`) on a game tick.
- **Scoring**:
  - Each eaten apple increases the current game score by exactly **+100 points**.
- **Snake Growth**:
  - Upon eating an apple, the snake grows by **1 segment** of 30px × 30px.
  - The tail is retained on that tick instead of popping, resulting in an extended body.
  - Immediately following consumption, a new apple is spawned at a new random valid location.

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Naive retry-loop spawning risks infinite loops when all 25 cells of the 150px × 150px grid are filled; needs deterministic free-cell pool algorithm and full-board end state handling. |
| Scope boundaries | Clear | Focused on apple lifecycle, +100 score increment, and +1 segment growth. |
| Comprehensive list of fields / state | Partial | `GameState.apple` nullable type (`Position \| null`) needed when board is completely filled; injectable `rng` function needed for deterministic tests. |
| Required endpoints structure & URLs | N/A | Client-side mechanics only; score persistence happens on Game Over in `US-07`. |
| Files / modules to modify | Missing | Concrete module paths (`appleSpawner.ts`, `snakeEngine.ts`, `boardRenderer.ts`) and test files not listed. |
| Definition of Done & Mandatory Steps | Partial | Missing OpenSpec mandatory steps (feature branch, unit test report, Playwright E2E verification). |
| Non-functional requirements | Missing | $O(N)$ bounded spawn time complexity (zero unbounded `while` loops), deterministic testability. |

---

## Enhanced

### Metadata
- **ID**: `US-03`
- **Title**: Random Apple Spawning, Consumption, +100 Scoring, and Snake Elongation
- **Module**: Frontend / Game Mechanics & Rules
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High
- **Depends On**: `US-01`, `US-02`
- **Blocks**: `US-04`, `US-07`
- **Branch Name**: `feature/US-03-food-scoring-and-growth`

### User Story
**As a** player,  
**I want** a 30px × 30px red apple to spawn on a random unoccupied grid cell, increase my score by 100 points when the snake's head reaches it, grow the snake by one 30px × 30px segment, and immediately spawn a new apple,  
**So that** each apple eaten increases my score and length according to classic Snake rules.

### Scope Boundaries
- **In Scope**:
  - Free-cell pool algorithm (`getAvailableCells`, `spawnApple`) guaranteeing $O(\text{rows} \times \text{cols})$ single-pass random apple placement on unoccupied cells.
  - Injectable random generator (`rng: () => number = Math.random`) for 100% deterministic unit testing.
  - Consumption check (`isEatingApple(nextHead, apple)`) during `TICK`.
  - Score increment by `POINTS_PER_APPLE = 100` (`state.score + 100`).
  - Snake growth by retaining the tail segment on the tick an apple is consumed (`[nextHead, ...state.snake]`).
  - Handling full-board victory (`availableCells.length === 0` → `apple = null`, `status = 'GAME_OVER'`).
  - Rendering the apple on the canvas in red (`APPLE_COLOR = '#ef4444'`).
- **Out of Scope**:
  - Wall and self-collision detection (`US-04`).
  - Saving the score to PostgreSQL (`US-05`, `US-06`, `US-07`).

### Functional Requirements

#### FR-1: Deterministic Free-Cell Apple Spawning
- Every grid cell has coordinates `(col * 30, row * 30)` where `0 <= col < BOARD_COLUMNS` and `0 <= row < BOARD_ROWS`.
- `getAvailableCells(snake, columns, rows, cellSize)` enumerates all grid cells and filters out any cell matching a segment in `snake`.
- `spawnApple(snake, rng = Math.random)`:
  - Calls `getAvailableCells`.
  - If `available.length === 0`, returns `null` (player filled the entire board).
  - Otherwise returns `available[Math.floor(rng() * available.length)]`.
- An initial apple is spawned when the game starts (`START`) and re-spawned on `RESET`.

#### FR-2: Consumption, Growth & Scoring on Tick
- On each `TICK` action when `status === 'RUNNING'`:
  1. Calculate `nextHead = getNextHeadPosition(state.snake[0], state.nextDirection)`.
  2. Check `ateApple = state.apple !== null && nextHead.x === state.apple.x && nextHead.y === state.apple.y`.
  3. **If `ateApple === true`**:
     - `nextSnake = [nextHead, ...state.snake]` (tail is NOT popped → length increases by 1 segment of `30px × 30px`).
     - `nextScore = state.score + POINTS_PER_APPLE` (`+100`).
     - `nextApple = spawnApple(nextSnake)`.
     - If `nextApple === null` (no empty cells remain), transition `status` to `'GAME_OVER'`.
  4. **If `ateApple === false`**:
     - `nextSnake = [nextHead, ...state.snake.slice(0, -1)]` (length unchanged).
     - `nextScore = state.score`.
     - `nextApple = state.apple`.

#### FR-3: Apple Visual Rendering
- `drawApple(ctx, apple)` draws a `30px × 30px` square at `(apple.x, apple.y)` filled with `APPLE_COLOR` (`#ef4444`) whenever `apple !== null`.

### Fields & Data Model Updates (`frontend/src/game/types.ts`)

```typescript
// Constants in frontend/src/game/constants.ts
export const POINTS_PER_APPLE = 100;
export const APPLE_COLOR = '#ef4444';

// Updated GameState in frontend/src/game/types.ts
export interface GameState {
  status: GameStatus;
  score: number;            // Increments by 100 per apple eaten
  snake: Position[];        // Grows by 1 Position per apple eaten
  direction: Direction;
  nextDirection: Direction;
  apple: Position | null;   // Current 30x30 apple coordinate, or null if board is full
}
```

### Required Endpoints
- **None** in `US-03`.

### Files & Modules to Create / Modify

```text
frontend/src/
├── game/
│   ├── constants.ts                          # Ensure POINTS_PER_APPLE = 100, APPLE_COLOR = '#ef4444'
│   ├── types.ts                              # Add apple: Position | null to GameState
│   ├── appleSpawner.ts                       # getAvailableCells, spawnApple(snake, rng)
│   ├── appleSpawner.test.ts                  # Tests for non-overlap, full board, and deterministic rng
│   ├── snakeEngine.ts                        # Add isEatingApple, update advanceSnake(snake, dir, grow)
│   ├── snakeEngine.test.ts                   # Tests for growth vs non-growth movement
│   ├── gameStateReducer.ts                   # Integrate apple consumption, +100 score, and respawn on TICK
│   ├── gameStateReducer.test.ts              # Reducer tests for eating, growing, scoring, and full board
│   ├── boardRenderer.ts                      # Add drawApple(ctx, apple)
│   └── boardRenderer.test.ts                 # Verify drawApple calls fillRect with #ef4444 and 30x30
└── components/
    ├── GameBoard/GameBoard.tsx               # Call drawApple(ctx, apple) during board render
    └── ScoreBoard/ScoreBoard.tsx             # Displays updated score (+100 per apple)
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Apple Spawns Only on Unoccupied Grid Cells
- **GIVEN** a board of 5 × 5 cells (`150px × 150px`) and a snake occupying `N` cells
- **WHEN** `spawnApple(snake)` executes
- **THEN** the returned apple position has `x, y ∈ {0, 30, 60, 90, 120}`
- **AND** `(apple.x, apple.y)` does not match any segment in `snake`.

#### Scenario 2: Eating an Apple Increments Score by 100
- **GIVEN** the game is `RUNNING` with `score = 200`, snake head at `{ x: 30, y: 60 }` moving `RIGHT`, and apple at `{ x: 60, y: 60 }`
- **WHEN** the next `TICK` dispatches
- **THEN** `state.score` becomes `300`
- **AND** the `ScoreBoard` displays `300`.

#### Scenario 3: Snake Grows by 1 Segment (30px × 30px) When Eating
- **GIVEN** the snake has length `1` (`[{ x: 30, y: 60 }]`) moving `RIGHT` and the apple is at `{ x: 60, y: 60 }`
- **WHEN** the next `TICK` dispatches
- **THEN** the snake length becomes `2` (`[{ x: 60, y: 60 }, { x: 30, y: 60 }]`)
- **AND** on the following non-eating tick (`RIGHT`), the snake remains length `2` (`[{ x: 90, y: 60 }, { x: 60, y: 60 }]`).

#### Scenario 4: New Apple Spawns Immediately After Consumption
- **GIVEN** the snake eats the apple at `{ x: 60, y: 60 }`
- **WHEN** the `TICK` state update completes
- **THEN** `state.apple` is set to a new coordinate that does not overlap any segment of the newly elongated snake.

#### Scenario 5: Board Completely Filled (25 Segments on 5×5 Grid)
- **GIVEN** the snake occupies 24 of the 25 cells and eats the apple on the 25th cell
- **WHEN** `spawnApple` finds `0` available cells
- **THEN** `state.apple` becomes `null`, `state.score` increments by `100` (to `2400`), and `state.status` transitions to `'GAME_OVER'`.

### Non-Functional Requirements
- **Algorithmic Complexity**: Spawning an apple must execute in deterministic $O(\text{BOARD\_COLUMNS} \times \text{BOARD\_ROWS})$ time (`25` iterations for a 5×5 grid) with zero unbounded retry loops.
- **Testability**: `spawnApple` and `gameStateReducer` must support an optional `rng` parameter so tests never rely on non-deterministic `Math.random()`.

### Documentation & Testing Updates
- **Unit Tests**: 100% branch coverage on `appleSpawner.ts` and consumption branches in `gameStateReducer.ts`.
- **E2E Verification**: Playwright MCP verification of eating an apple, score increasing to `100`, and snake length increasing to 2 segments.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-03-food-scoring-and-growth` created.
- [ ] Unit and component tests written first (TDD) and passing with ≥ 90% coverage.
- [ ] Step N+1: Unit test verification report generated in `openspec/changes/<change-name>/reports/`.
- [ ] Step N+3: Playwright MCP E2E verification executed by the agent.
- [ ] Step N+4: Documentation updated.
