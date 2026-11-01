# US-04: Collision Detection & Game Over Conditions

## Original

### Metadata
- **ID**: `US-04`
- **Title**: Wall Boundary Collision, Self-Collision, and Game Over Flow
- **Module**: Frontend / Game Engine & State Management
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** player,  
**I want** the game to detect when the snake collides with the outer boundary walls or with its own body and immediately end the game,  
**So that** there is a clear lose condition and my final score is locked for potential entry into the Top 5 leaderboard.

### Context & Requirements
- **Wall Collision**:
  - The board has rigid boundaries defined by `width` and `height` (e.g., minimum 150px × 150px, or 300px × 300px).
  - If the snake's head moves outside `[0, width - 30]` horizontally or `[0, height - 30]` vertically, collision occurs.
- **Self-Collision**:
  - If the snake's head coordinate matches any coordinate of its existing body segments (`snake.body[1..N]`), self-collision occurs.
- **Game Over State**:
  - Halts the game loop immediately.
  - Changes game state from `RUNNING` to `GAME_OVER`.
  - Displays a "Game Over" message with the final score.
  - Freezes snake and apple rendering.
  - Triggers the Leaderboard eligibility check (see US-07).

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Missing tail-vacating rule: when moving without eating, the tail leaves its cell on the same tick, so moving the head into the previous tail cell must NOT count as self-collision. Also missing whether out-of-bounds head is rendered or clamped prior to freezing. |
| Scope boundaries | Clear | Covers wall collision, self-collision, `GAME_OVER` transition, and Reset recovery. |
| Comprehensive list of fields / state | Partial | Needs `gameOverReason: 'WALL' \| 'SELF' \| 'BOARD_FULL' \| null` in `GameState` for UI feedback and testing. |
| Required endpoints structure & URLs | N/A | Client-side engine; leaderboard submission is triggered via state transition observed in `US-07`. |
| Files / modules to modify | Missing | Explicit file paths (`collisionDetector.ts`, `gameStateReducer.ts`, `GameBoard.tsx`) and test files missing. |
| Definition of Done & Mandatory Steps | Partial | Missing OpenSpec mandatory steps (feature branch, unit test report, Playwright E2E verification). |
| Non-functional requirements | Missing | Deterministic tick evaluation order, zero post-collision ticks. |

---

## Enhanced

### Metadata
- **ID**: `US-04`
- **Title**: Wall Boundary Collision, Self-Collision, and Game Over Lifecycle
- **Module**: Frontend / Game Engine & State Management
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High
- **Depends On**: `US-01`, `US-02`, `US-03`
- **Blocks**: `US-07`
- **Branch Name**: `feature/US-04-collision-and-game-over`

### User Story
**As a** player,  
**I want** the game engine to detect wall collisions (`x < 0`, `x >= 150`, `y < 0`, `y >= 150`) and self-collisions on every tick, immediately halt the game loop, lock my final score, and display the Game Over overlay with the option to Reset,  
**So that** the game enforces classic Snake termination rules accurately.

### Scope Boundaries
- **In Scope**:
  - Pure collision module (`collisionDetector.ts`) with `checkWallCollision` and `checkSelfCollision`.
  - Tail-vacating accuracy: on a non-eating tick, the last tail segment moves away and is excluded from self-collision checks.
  - Exact tick evaluation order in `gameStateReducer`: wall collision check → self-collision check → movement/consumption, keeping the rendered snake within bounds on `GAME_OVER`.
  - `gameOverReason` state property (`'WALL' | 'SELF' | 'BOARD_FULL' | null`).
  - Rendering the Game Over overlay with final score and reason, plus full recovery via the `Reset` button.
- **Out of Scope**:
  - Prompting for player name and submitting the final score to the backend API (`US-07`).

### Functional Requirements

#### FR-1: Wall Boundary Collision
- Valid grid coordinates satisfy `0 <= x <= BOARD_WIDTH - CELL_SIZE` (`0..120` for 150px board) and `0 <= y <= BOARD_HEIGHT - CELL_SIZE` (`0..120`).
- `checkWallCollision(nextHead, boardWidth, boardHeight)` returns `true` when:
  - `nextHead.x < 0` (Left wall)
  - `nextHead.x >= boardWidth` (Right wall)
  - `nextHead.y < 0` (Top wall)
  - `nextHead.y >= boardHeight` (Bottom wall)

#### FR-2: Self-Collision (With Tail-Vacating Rule)
- A snake of length `< 5` cannot collide with itself under valid orthogonal movement, while a snake of length `>= 5` can.
- On a non-eating tick, the current tail (`snake[snake.length - 1]`) vacates its coordinate simultaneously as the head advances.
- Therefore, `checkSelfCollision(nextHead, activeBodySegments)` checks whether `nextHead` equals any segment in `activeBodySegments`, where:
  - `activeBodySegments = ateApple ? state.snake : state.snake.slice(0, -1)`.

#### FR-3: Tick Evaluation Order & State Freezing
On each `TICK` when `state.status === 'RUNNING'`:
1. Commit `direction = state.nextDirection` and compute `nextHead`.
2. **If `checkWallCollision(nextHead, BOARD_WIDTH, BOARD_HEIGHT)` is `true`**:
   - Return `{ ...state, direction, status: 'GAME_OVER', gameOverReason: 'WALL' }`.
   - `state.snake` and `state.score` remain frozen at their last valid in-bounds positions.
3. Determine `ateApple = isEatingApple(nextHead, state.apple)`.
4. **If `checkSelfCollision(nextHead, ateApple ? state.snake : state.snake.slice(0, -1))` is `true`**:
   - Return `{ ...state, direction, status: 'GAME_OVER', gameOverReason: 'SELF' }`.
   - `state.snake` and `state.score` remain frozen.
5. Otherwise, apply movement, apple consumption, growth, and score increment from `US-03`.

#### FR-4: Game Over UI & Reset Recovery
- When `status === 'GAME_OVER'`:
  - `useGameLoop` immediately clears the interval timer so no further `TICK` actions occur.
  - `GameBoard` displays the overlay (`data-testid="game-over-overlay"`) showing `Game Over`, the `Final Score: {score}`, and a prompt to click `Reset`.
- Clicking `Reset` dispatches `{ type: 'RESET' }`, restoring `status: 'IDLE'`, `score: 0`, `gameOverReason: null`, initial 1-segment snake, and a fresh random apple.

### Fields & Data Model Updates (`frontend/src/game/types.ts`)

```typescript
export type GameOverReason = 'WALL' | 'SELF' | 'BOARD_FULL' | null;

export interface GameState {
  status: GameStatus;
  score: number;
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  apple: Position | null;
  gameOverReason: GameOverReason;
}
```

### Required Endpoints
- **None** in `US-04`.

### Files & Modules to Create / Modify

```text
frontend/src/
├── game/
│   ├── types.ts                              # Add GameOverReason to GameState
│   ├── collisionDetector.ts                  # checkWallCollision, checkSelfCollision
│   ├── collisionDetector.test.ts             # Unit tests for all 4 walls, self-hit, and tail-chasing
│   ├── gameStateReducer.ts                   # Integrate collision checks prior to advancing snake
│   └── gameStateReducer.test.ts              # Reducer tests for wall/self Game Over & state freeze
└── components/
    ├── GameBoard/
    │   ├── GameBoard.tsx                     # Display Game Over overlay with score & reason
    │   └── GameBoard.test.tsx                # Verify overlay appearance on GAME_OVER
    └── SnakeGame/
        └── SnakeGame.test.tsx                # Integration test: run into wall -> Game Over -> Reset
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Right Wall Collision
- **GIVEN** a `150px × 150px` board and the snake head at `{ x: 120, y: 60 }` moving `RIGHT`
- **WHEN** the next `TICK` dispatches (targeting `{ x: 150, y: 60 }`)
- **THEN** wall collision is detected
- **AND** `status` transitions to `'GAME_OVER'` with `gameOverReason = 'WALL'`
- **AND** the snake remains rendered inside the board at `{ x: 120, y: 60 }`.

#### Scenario 2: Left, Top, and Bottom Wall Collisions
- **GIVEN** the snake head is at `{ x: 0, y: 60 }` moving `LEFT`, `{ x: 60, y: 0 }` moving `UP`, or `{ x: 60, y: 120 }` moving `DOWN`
- **WHEN** the next `TICK` dispatches
- **THEN** `status` transitions to `'GAME_OVER'` with `gameOverReason = 'WALL'`.

#### Scenario 3: Self-Collision With Body Segment
- **GIVEN** a snake with body `[{ x: 60, y: 60 }, { x: 90, y: 60 }, { x: 90, y: 30 }, { x: 60, y: 30 }, { x: 30, y: 30 }]` moving `UP` (targeting `{ x: 60, y: 30 }`)
- **WHEN** the next `TICK` dispatches
- **THEN** self-collision is detected against segment `{ x: 60, y: 30 }`
- **AND** `status` transitions to `'GAME_OVER'` with `gameOverReason = 'SELF'`.

#### Scenario 4: Moving Into Vacating Tail Cell Is Allowed (No False Collision)
- **GIVEN** a 4-segment snake in a 2×2 loop `[{ x: 30, y: 30 }, { x: 60, y: 30 }, { x: 60, y: 60 }, { x: 30, y: 60 }]` moving `DOWN` into `{ x: 30, y: 60 }` (where the tail currently sits) and the apple is elsewhere
- **WHEN** the next `TICK` dispatches
- **THEN** the tail vacates `{ x: 30, y: 60 }` and the head enters `{ x: 30, y: 60 }`
- **AND** the game continues in `RUNNING` state without triggering self-collision.

#### Scenario 5: Reset After Game Over
- **GIVEN** the game is in `GAME_OVER` with `score = 300`
- **WHEN** the player clicks `Reset`
- **THEN** `status` returns to `'IDLE'`, `score` resets to `0`, `gameOverReason` becomes `null`, and the snake resets to a single segment at `{ x: 30, y: 60 }`.

### Non-Functional Requirements
- **Determinism**: Zero ticks may execute after `status` transitions to `'GAME_OVER'`.
- **Visual Bounds Integrity**: No snake segment may ever be drawn at coordinates `< 0` or `>= BOARD_WIDTH / BOARD_HEIGHT`.

### Documentation & Testing Updates
- **Unit Tests**: 100% branch coverage on `collisionDetector.ts` and `gameStateReducer.ts` collision paths.
- **E2E Verification**: Playwright MCP test letting the snake run into the right wall (`3` ticks from `{ x: 30, y: 60 }`), verifying the `Game Over` overlay appears, and clicking `Reset`.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-04-collision-and-game-over` created.
- [ ] Unit and integration tests written first (TDD) and passing with ≥ 90% coverage.
- [ ] Step N+1: Unit test verification report saved in `openspec/changes/<change-name>/reports/`.
- [ ] Step N+3: Playwright MCP E2E verification executed by the agent.
- [ ] Step N+4: Documentation updated.
