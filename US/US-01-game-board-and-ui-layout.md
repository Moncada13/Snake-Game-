# US-01: Game Board & UI Layout

## Original

### Metadata
- **ID**: `US-01`
- **Title**: Game Board and Web Interface Layout
- **Module**: Frontend / Game Arena & UI
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** player,  
**I want** a dedicated web interface featuring a game board with 30px grid cells, a Start button, a Reset button, current score indicator, and a leaderboard panel,  
**So that** I have a clear, interactive visual space to play the Snake game and monitor my progress.

### Context & Requirements
- Web application running natively in modern browsers (Chrome, Firefox, Safari, Edge).
- The game arena must be structured around a discrete grid where each unit cell is **30px × 30px**.
- The minimum base play area is **150px × 150px** (5 × 5 cells of 30px), scalable to larger standard dimensions (e.g., 300px × 300px or 450px × 450px) while maintaining the strict 30px cell alignment.
- A **"Start" button** to initiate the game loop.
- A **"Reset" button** to reinitialize the snake, apple, score, and state back to default.
- Real-time **Score Display** initialized at `0`.
- Visual panel for the **Top 5 Leaderboard** loaded from the backend API.

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Board dimensions ambiguous ("150px minimum, scalable"); rendering mechanism (HTML5 Canvas vs DOM) unspecified; Start button state in `GAME_OVER` undefined. |
| Scope boundaries | Missing | Overlapped with US-02 (snake rendering), US-03 (apple spawning), and US-07 (leaderboard API calls). |
| Comprehensive list of fields / state | Missing | No formal `GameState` model, action union, or state transition matrix. |
| Required endpoints structure & URLs | N/A | Must explicitly state zero network calls in US-01 (API integration belongs to US-07). |
| Files / modules to modify | Missing | No concrete file tree aligned with `docs/frontend-standards.md`. |
| Definition of Done & Mandatory Steps | Partial | Missing feature branch step, Playwright E2E verification, and report generation per `docs/openspec-tasks-mandatory-steps.md`. |
| Non-functional requirements | Missing | HiDPI canvas scaling, keyboard focus blur on buttons, ARIA attributes, and render performance budgets missing. |

---

## Enhanced

### Metadata
- **ID**: `US-01`
- **Title**: Game Board Layout, Controls & Game State Shell
- **Module**: Frontend / Game Arena & UI
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High (Foundation for US-02, US-03, US-04, US-07)
- **Depends On**: None
- **Blocks**: `US-02`, `US-03`, `US-04`, `US-07`
- **Branch Name**: `feature/US-01-game-board-layout`

### User Story
**As a** player,  
**I want** a browser-based game layout featuring an HTML5 Canvas board aligned to a 30px × 30px grid (150px × 150px arena), Start and Reset buttons, a live score display, and a Top 5 Leaderboard container,  
**So that** I have a deterministic, responsive visual arena and control lifecycle (`IDLE`, `RUNNING`, `GAME_OVER`) to play Snake.

### Scope Boundaries
- **In Scope**:
  - Main page layout (`SnakeGame`), HTML5 `<canvas>` board (`GameBoard`), `ControlPanel` (Start & Reset buttons), `ScoreBoard`, and static `LeaderboardPanel` placeholder.
  - Pure game state machine (`gameStateReducer`) managing `IDLE` → `RUNNING` → `GAME_OVER` → `IDLE`.
  - Reusable canvas drawing utilities (`drawBoard`, `drawCell`) and shared constants (`CELL_SIZE = 30`, `BOARD_COLUMNS = 5`, `BOARD_ROWS = 5`, colors).
- **Out of Scope**:
  - Snake body state, tick interval, and arrow key steering (`US-02`).
  - Apple random spawning, consumption, +100 scoring, and growth (`US-03`).
  - Wall and self-collision detection (`US-04`).
  - Backend API integration and live Top 5 leaderboard fetching/submitting (`US-07`).

### Functional Requirements

#### FR-1: Board & Grid Geometry
- Cell size: `CELL_SIZE = 30` (30px × 30px).
- Grid dimensions: `BOARD_COLUMNS = 5`, `BOARD_ROWS = 5`.
- Derived pixel dimensions: `BOARD_WIDTH = BOARD_COLUMNS * CELL_SIZE` (`150px`), `BOARD_HEIGHT = BOARD_ROWS * CELL_SIZE` (`150px`).
- Changing `BOARD_COLUMNS` / `BOARD_ROWS` in `constants.ts` must scale the board without modifying any component logic.

#### FR-2: Visual Palette (`constants.ts`)
| Constant | Value | Purpose |
| :--- | :--- | :--- |
| `SNAKE_COLOR` | `#22c55e` | Green snake segment fill |
| `APPLE_COLOR` | `#ef4444` | Red apple fill |
| `BOARD_BACKGROUND_COLOR` | `#111827` | Dark arena background |
| `GRID_LINE_COLOR` | `#1f2937` | 1px cell grid lines |
| `BOARD_BORDER_COLOR` | `#f9fafb` | Visible wall boundary |

#### FR-3: Game Status State Machine
| Current Status | Action | Next Status | Side Effects |
| :--- | :--- | :--- | :--- |
| `IDLE` | `START` | `RUNNING` | Disables Start button, blurs button focus, invokes `onStart` callback |
| `RUNNING` | `START` | `RUNNING` | No-op (Start button is disabled) |
| `RUNNING` | `GAME_OVER` | `GAME_OVER` | Freezes score, displays Game Over overlay |
| `RUNNING` | `RESET` | `IDLE` | Resets `score` to `0`, clears board to initial state, enables Start button |
| `GAME_OVER` | `RESET` | `IDLE` | Hides Game Over overlay, resets `score` to `0`, enables Start button |
| `GAME_OVER` | `START` | `GAME_OVER` | No-op (Start button remains disabled until Reset is clicked) |
| `IDLE` | `RESET` | `IDLE` | Ensures `score = 0` |

#### FR-4: Controls & Focus Management
- **Start Button**: `data-testid="start-button"`, enabled only when `status === 'IDLE'`.
- **Reset Button**: `data-testid="reset-button"`, always enabled.
- Clicking either button calls `event.currentTarget.blur()` immediately so subsequent keyboard presses (`ArrowUp`, `ArrowDown`, `Space`, `Enter`) do not accidentally re-trigger button clicks.

#### FR-5: Score & Leaderboard Shell
- **ScoreBoard**: `data-testid="score-value"`, renders `Score: 0` on initial load and updates reactively from `state.score`.
- **LeaderboardPanel**: `data-testid="leaderboard-panel"`, renders heading `Top 5 Leaderboard` and 5 placeholder rows (`#1 — -`, `#2 — -`, etc.) until `US-07` connects the API.
- **Game Over Overlay**: `data-testid="game-over-overlay"`, rendered over the canvas when `status === 'GAME_OVER'`, showing `Game Over — Final Score: {score}`.

### Fields & Data Model (`frontend/src/game/types.ts`)

```typescript
export type GameStatus = 'IDLE' | 'RUNNING' | 'GAME_OVER';

export interface Position {
  x: number; // Pixel coordinate, exact multiple of CELL_SIZE (0, 30, 60, 90, 120)
  y: number; // Pixel coordinate, exact multiple of CELL_SIZE (0, 30, 60, 90, 120)
}

export interface GameState {
  status: GameStatus;
  score: number;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'GAME_OVER' };
```

### Required Endpoints
- **None** in `US-01`. No HTTP requests are dispatched during this story.

### Files & Modules to Create / Modify
Aligned with `docs/frontend-standards.md`:

```text
frontend/src/
├── game/
│   ├── constants.ts                          # CELL_SIZE=30, BOARD_COLUMNS=5, BOARD_ROWS=5, colors
│   ├── types.ts                              # GameStatus, Position, GameState, GameAction
│   ├── gameStateReducer.ts                   # Pure state machine reducer + INITIAL_GAME_STATE
│   ├── gameStateReducer.test.ts              # Unit tests for all state transitions
│   ├── boardRenderer.ts                      # drawBoard(ctx), drawCell(ctx, pos, color)
│   └── boardRenderer.test.ts                 # Canvas 2D context mock unit tests
├── components/
│   ├── SnakeGame/
│   │   ├── SnakeGame.tsx                     # Root container orchestrating board, HUD, controls
│   │   └── SnakeGame.test.tsx                # Integration tests for Start/Reset flow
│   ├── GameBoard/
│   │   ├── GameBoard.tsx                     # <canvas> element + HiDPI scaling + Game Over overlay
│   │   └── GameBoard.test.tsx                # Component unit tests
│   ├── ControlPanel/
│   │   ├── ControlPanel.tsx                  # Start & Reset buttons with blur handling
│   │   └── ControlPanel.test.tsx             # Button state & click handler tests
│   ├── ScoreBoard/
│   │   ├── ScoreBoard.tsx                    # Live score display with aria-live="polite"
│   │   └── ScoreBoard.test.tsx               # Score rendering tests
│   └── LeaderboardPanel/
│       ├── LeaderboardPanel.tsx              # Top 5 shell component
│       └── LeaderboardPanel.test.tsx         # Placeholder rendering tests
└── App.tsx                                   # Mounts <SnakeGame />
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Initial Page Render
- **GIVEN** the player navigates to the web application
- **WHEN** the interface finishes mounting
- **THEN** a `<canvas>` of `150px × 150px` is visible with a 5 × 5 grid of `30px × 30px` cells
- **AND** the score display reads `0`
- **AND** the `Start` button is enabled and the `Reset` button is enabled
- **AND** the `Top 5 Leaderboard` panel shows 5 placeholder slots.

#### Scenario 2: Starting the Game
- **GIVEN** the game is in `IDLE` status
- **WHEN** the player clicks the `Start` button
- **THEN** the game status transitions to `RUNNING`
- **AND** the `Start` button becomes disabled and loses keyboard focus.

#### Scenario 3: Resetting While Running
- **GIVEN** the game is in `RUNNING` status with `score > 0`
- **WHEN** the player clicks the `Reset` button
- **THEN** the game status transitions to `IDLE`
- **AND** the score resets to `0`
- **AND** the `Start` button becomes enabled.

#### Scenario 4: Resetting From Game Over
- **GIVEN** the game is in `GAME_OVER` status and the Game Over overlay is visible
- **WHEN** the player clicks the `Reset` button
- **THEN** the Game Over overlay is hidden
- **AND** the game status transitions to `IDLE` with `score = 0`
- **AND** the `Start` button is re-enabled.

#### Scenario 5: Start Remains Disabled During Game Over
- **GIVEN** the game is in `GAME_OVER` status
- **WHEN** the player views the control panel
- **THEN** the `Start` button is disabled until `Reset` is clicked.

### Non-Functional Requirements
- **Accessibility**: `<canvas role="img" aria-label="Snake game board, 150 by 150 pixels">`; score container has `aria-live="polite"`; WCAG AA contrast ratio (≥ 4.5:1) for all text and buttons.
- **Performance**: Initial mount and canvas draw < 50ms; HiDPI (`window.devicePixelRatio`) support without blurring grid lines.
- **Type Safety**: TypeScript `strict: true`, zero `any` types, zero ESLint warnings.

### Documentation & Testing Updates
- **Unit & Component Tests**: Jest + React Testing Library covering 100% of `gameStateReducer` branches and ≥ 90% overall statement/branch/function/line coverage.
- **E2E Verification**: Playwright MCP verification of initial render, Start button state change, and Reset transition.
- **Documentation**: Update `docs/development_guide.md` if frontend startup commands change.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-01-game-board-layout` created from `main`.
- [ ] Failing unit and component tests written first (TDD) and passing with ≥ 90% coverage.
- [ ] All components, types, and constants implemented in English following `docs/base-standards.md` and `docs/frontend-standards.md`.
- [ ] Step N+1: Unit test execution report generated in `openspec/changes/<change-name>/reports/`.
- [ ] Step N+3: Playwright MCP E2E test executed autonomously by the agent.
- [ ] Step N+4: Technical documentation reviewed and updated.
