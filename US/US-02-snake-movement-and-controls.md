# US-02: Snake Movement & Keyboard Arrow Controls

## Original

### Metadata
- **ID**: `US-02`
- **Title**: Snake Initial State, Continuous Automatic Movement, and Arrow Key Steering
- **Module**: Frontend / Game Engine & Physics
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** player,  
**I want** the green snake to start as a 30px × 30px block that moves forward automatically in fixed grid increments, and steer it using the keyboard arrow keys,  
**So that** I can navigate the game arena dynamically with responsive and intuitive controls.

### Context & Requirements
- **Initial Geometry & Appearance**:
  - The snake starts with an initial length of 1 segment.
  - Dimensions: exactly **30px width × 30px height**.
  - Color: **Green** (e.g., `#22c55e` / `rgb(34, 197, 94)`).
- **Movement Mechanics**:
  - The snake moves continuously and automatically at fixed time intervals (tick rate, e.g., every 150ms–200ms).
  - Movement is strictly grid-aligned, advancing by exactly **30px** per tick in the active direction.
  - Default initial direction upon starting: `RIGHT` (or `UP`).
- **Input Handling**:
  - Listens to standard keyboard arrow keys: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`.
  - Direction changes take effect on the subsequent game loop tick.
  - **180-Degree Reversal Prevention**: If the snake is moving `RIGHT`, pressing `ArrowLeft` is ignored; if moving `UP`, pressing `ArrowDown` is ignored, and vice-versa.

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Initial spawn coordinate (`x, y`) and exact tick interval constant (`TICK_INTERVAL_MS`) are not pinned down; multi-key press within the same tick (rapid `Up` then `Left` while moving `Right` causing self-reversal) is not addressed. |
| Scope boundaries | Partial | Must cleanly separate pure movement step from eating/growth (`US-03`) and collision termination (`US-04`). |
| Comprehensive list of fields / state | Partial | Needs full reducer actions (`TICK`, `CHANGE_DIRECTION`) integrated with `GameState` from `US-01`. |
| Required endpoints structure & URLs | N/A | Client-side only; must explicitly state no API calls. |
| Files / modules to modify | Missing | Missing file paths (`snakeEngine.ts`, `useKeyboardControls.ts`, `useGameLoop.ts`) and test files. |
| Definition of Done & Mandatory Steps | Partial | Missing OpenSpec mandatory steps (feature branch, unit test report, Playwright E2E test execution). |
| Non-functional requirements | Missing | Timer cleanup on unmount, browser page-scroll prevention (`preventDefault`), frame stability. |

---

## Enhanced

### Metadata
- **ID**: `US-02`
- **Title**: Snake Initial State, Automatic Tick Loop, and Arrow Key Steering
- **Module**: Frontend / Game Engine & Controls
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High
- **Depends On**: `US-01`
- **Blocks**: `US-03`, `US-04`
- **Branch Name**: `feature/US-02-snake-movement-and-controls`

### User Story
**As a** player,  
**I want** the snake to spawn as a single green 30px × 30px segment that automatically advances one grid cell (30px) per tick in the last selected direction and responds to keyboard arrow keys without allowing 180-degree instant reversals,  
**So that** I can smoothly steer the snake across the board using the keyboard.

### Scope Boundaries
- **In Scope**:
  - Snake initial state (`body: [{ x: 30, y: 60 }]`, `direction: 'RIGHT'`, `nextDirection: 'RIGHT'`).
  - Automatic game loop hook (`useGameLoop`) running every `TICK_INTERVAL_MS = 150` ms while `status === 'RUNNING'`.
  - Pure movement calculation (`getNextHeadPosition`, `advanceSnake`) moving head by `±30px` and shifting body segments.
  - Keyboard listener hook (`useKeyboardControls`) handling `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` with `event.preventDefault()` and strict 180-degree reversal lock against the *committed* `direction`.
  - Canvas rendering of all snake segments in green (`SNAKE_COLOR = '#22c55e'`).
- **Out of Scope**:
  - Apple spawning, eating detection, score increment, and tail growth (`US-03`).
  - Wall and self-collision detection (`US-04`).

### Functional Requirements

#### FR-1: Initial Snake State
- On `IDLE` and upon `RESET`, the snake state is initialized to:
  - `body`: `[{ x: 30, y: 60 }]` (1 segment of `30px × 30px`, vertically centered on the 5×5 grid, leaving 3 cells ahead to the right).
  - `direction`: `'RIGHT'`.
  - `nextDirection`: `'RIGHT'`.
  - Color: `SNAKE_COLOR` (`#22c55e`).

#### FR-2: Automatic Tick Movement
- Tick interval constant: `TICK_INTERVAL_MS = 150`.
- Active only when `state.status === 'RUNNING'`.
- On each `TICK` action:
  1. Commit direction: `activeDirection = state.nextDirection`.
  2. Compute new head position from `state.snake[0]` and `activeDirection`:
     - `'UP'` → `{ x: head.x, y: head.y - 30 }`
     - `'DOWN'` → `{ x: head.x, y: head.y + 30 }`
     - `'LEFT'` → `{ x: head.x - 30, y: head.y }`
     - `'RIGHT'` → `{ x: head.x + 30, y: head.y }`
  3. Prepend new head to `snake` array and remove the last element (tail) so length remains constant when no apple is eaten.
  4. Store `direction: activeDirection`.

#### FR-3: Keyboard Arrow Steering & Reversal Prevention
- Supported keys:
  - `ArrowUp` → `'UP'`
  - `ArrowDown` → `'DOWN'`
  - `ArrowLeft` → `'LEFT'`
  - `ArrowRight` → `'RIGHT'`
- When any of the four arrow keys is pressed while `status === 'RUNNING'`:
  - Call `event.preventDefault()` so the browser viewport does not scroll.
  - Validate candidate direction against the **last committed `state.direction`** (NOT `state.nextDirection`) to prevent the rapid double-key 180° self-collision bug within a single tick:
    - Opposite pairs: `('UP', 'DOWN')`, `('DOWN', 'UP')`, `('LEFT', 'RIGHT')`, `('RIGHT', 'LEFT')`.
    - If candidate is opposite to `state.direction`, ignore the input.
    - Otherwise, update `state.nextDirection = candidate`.

### Fields & Data Model Updates (`frontend/src/game/types.ts`)

```typescript
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  status: GameStatus;
  score: number;
  snake: Position[];        // Ordered from head (index 0) to tail (last index)
  direction: Direction;     // Direction committed on the last tick
  nextDirection: Direction; // Queued direction for the upcoming tick
}

export type GameAction =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'GAME_OVER' }
  | { type: 'TICK' }
  | { type: 'CHANGE_DIRECTION'; payload: Direction };
```

### Required Endpoints
- **None** in `US-02`.

### Files & Modules to Create / Modify

```text
frontend/src/
├── game/
│   ├── constants.ts                          # Add TICK_INTERVAL_MS=150, INITIAL_SNAKE_POSITION={x:30,y:60}, INITIAL_DIRECTION='RIGHT'
│   ├── types.ts                              # Add Direction, extend GameState & GameAction
│   ├── snakeEngine.ts                        # Pure functions: isOppositeDirection, getNextHeadPosition, advanceSnake
│   ├── snakeEngine.test.ts                   # Unit tests for movement math & reversal rules
│   ├── gameStateReducer.ts                   # Handle TICK and CHANGE_DIRECTION actions
│   ├── gameStateReducer.test.ts              # Extend reducer tests for TICK & rapid double-key inputs
│   ├── boardRenderer.ts                      # Add drawSnake(ctx, snake) using SNAKE_COLOR (#22c55e)
│   └── boardRenderer.test.ts                 # Verify drawSnake renders each segment at 30x30
├── hooks/
│   ├── useGameLoop.ts                        # Manages setInterval(onTick, TICK_INTERVAL_MS) when RUNNING
│   ├── useGameLoop.test.ts                   # Fake timers tests for start/stop/unmount cleanup
│   ├── useKeyboardControls.ts                # Window keydown listener for Arrow keys
│   └── useKeyboardControls.test.ts           # Keyboard event dispatch & preventDefault tests
└── components/
    ├── GameBoard/GameBoard.tsx               # Render snake segments on canvas
    └── SnakeGame/SnakeGame.tsx               # Wire useGameLoop and useKeyboardControls
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Initial Snake Spawn
- **GIVEN** the game is in `IDLE` or has just transitioned to `RUNNING`
- **WHEN** the board is rendered
- **THEN** a single green (`#22c55e`) block of `30px × 30px` is drawn at `{ x: 30, y: 60 }`
- **AND** its initial direction is `RIGHT`.

#### Scenario 2: Automatic Movement Per Tick
- **GIVEN** the game is `RUNNING` with the snake head at `{ x: 30, y: 60 }` and direction `RIGHT`
- **WHEN** `150ms` (`TICK_INTERVAL_MS`) elapses
- **THEN** the snake head moves automatically to `{ x: 60, y: 60 }`
- **AND** after another `150ms` it moves to `{ x: 90, y: 60 }` without any user input.

#### Scenario 3: Valid Orthogonal Direction Change
- **GIVEN** the snake is moving `RIGHT` at `{ x: 60, y: 60 }`
- **WHEN** the player presses `ArrowDown`
- **THEN** `event.preventDefault()` is called
- **AND** `nextDirection` becomes `DOWN`
- **AND** on the next tick the snake head moves to `{ x: 60, y: 90 }`.

#### Scenario 4: Direct 180-Degree Reversal Ignored
- **GIVEN** the snake is moving `RIGHT`
- **WHEN** the player presses `ArrowLeft`
- **THEN** the input is ignored and `nextDirection` remains `RIGHT`.

#### Scenario 5: Rapid Double-Key Press Within Single Tick (Anti-Glitch)
- **GIVEN** the snake is moving `RIGHT` (`direction = 'RIGHT'`)
- **WHEN** the player presses `ArrowUp` and then `ArrowLeft` before the next tick fires
- **THEN** `ArrowUp` sets `nextDirection = 'UP'`, and `ArrowLeft` is rejected because `LEFT` is opposite to the committed `direction = 'RIGHT'`
- **AND** on the next tick the snake moves `UP` safely.

#### Scenario 6: Loop Stops When Not Running
- **GIVEN** the game transitions from `RUNNING` to `IDLE` (via Reset) or `GAME_OVER`
- **WHEN** time advances by multiple tick intervals
- **THEN** no `TICK` actions are dispatched and the snake position does not change.

### Non-Functional Requirements
- **Memory & Timer Safety**: `clearInterval` must execute reliably when status changes away from `RUNNING` or when the component unmounts (zero memory leaks or React state-update-on-unmounted warnings).
- **Input Latency**: Direction registration on `keydown` (not `keyup`) in < 5ms.
- **Browser UX**: Pressing arrow keys while playing must never scroll the page vertically or horizontally.

### Documentation & Testing Updates
- **Unit Tests**: `snakeEngine.test.ts`, `useGameLoop.test.ts` (using `jest.useFakeTimers()`), `useKeyboardControls.test.ts`, and `gameStateReducer.test.ts` with ≥ 90% coverage.
- **E2E Verification**: Playwright MCP test starting the game, dispatching arrow key presses, and verifying snake movement across ticks.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-02-snake-movement-and-controls` created.
- [ ] All unit and hook tests written first (TDD) and passing with ≥ 90% coverage.
- [ ] Single-tick double-key reversal bug explicitly covered by unit test.
- [ ] Step N+1: Unit test verification report saved under `openspec/changes/<change-name>/reports/`.
- [ ] Step N+3: Playwright MCP E2E verification executed by the agent.
- [ ] Step N+4: Documentation updated if applicable.
