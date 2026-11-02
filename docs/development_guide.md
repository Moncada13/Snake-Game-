# Snake Game - Development Guide

This guide provides step-by-step instructions for running, testing, and developing the Snake Game application (React + TypeScript frontend and PostgreSQL backend).

---

## 🚀 Prerequisites

Ensure the following tools are installed:
- **Node.js** (v18 or higher; v20+ recommended)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose** (for PostgreSQL database)
- **Git**

---

## 📦 Frontend Setup & Commands

The web frontend is located in the `frontend/` directory.

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Type Checking

Validate TypeScript types across the entire project:

```bash
npm --prefix frontend run typecheck
```

### 3. Running Unit & Integration Tests

Run all Jest test suites:

```bash
npm --prefix frontend test
```

### 4. Running Tests with Code Coverage

Verify coverage thresholds (≥ 90% required across all metrics):

```bash
npm --prefix frontend run test:coverage
```

### 5. Running the Development Server

Start the local development server:

```bash
npm --prefix frontend start
```

The application will be accessible at `http://localhost:3000`.

---

## 🗄️ Backend Setup (PostgreSQL Database & Top-5 Persistence - US-05)

The backend is located in the `backend/` directory and follows Domain-Driven Design (DDD) with TypeScript, Prisma, and PostgreSQL.

### 1. PostgreSQL Database (Docker)

```bash
# Start PostgreSQL 16 container
docker-compose up -d

# Verify container status
docker-compose ps
```

### 2. Backend Installation & Prisma Commands

```bash
# Install backend dependencies
npm --prefix backend install

# Generate Prisma Client
npx --prefix backend prisma generate

# Apply database migrations (when PostgreSQL is running on localhost:5432)
npx --prefix backend prisma migrate deploy
```

### 3. Backend Type Checking & Tests

```bash
# Validate TypeScript types
npm --prefix backend run typecheck

# Run unit and transactional integration tests with coverage (≥ 90% required)
npm --prefix backend run test:coverage
```

### 4. Atomic Top-5 Repository (`backend/src/infrastructure/repositories/PrismaScoreRepository.ts`)
- `Score` (`backend/src/domain/models/Score.ts`): Validates `playerName` (`1..30` trimmed characters) and `score` (`>= 100`, integer multiple of `100`), throwing `DomainValidationError` on invalid input.
- `PrismaScoreRepository.saveIfTopFive(playerName, score)`: Executes inside a `Serializable` interactive transaction (`Prisma.TransactionIsolationLevel.Serializable`), ordering scores by `[{ score: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }]`, inserting qualifying scores, and deleting any overflow records beyond rank 5 in the same transaction.
- `InMemoryPrismaClient` (`backend/src/infrastructure/prismaClient.ts`): Provides a deterministic transactional PostgreSQL-compatible adapter when `USE_IN_MEMORY_DB=true` or in environments without a running local PostgreSQL daemon.

---

## 🐍 Game Engine & Controls Architecture (US-02)

The game physics, tick loop, and keyboard steering are implemented using modular pure functions and custom React hooks:

### 1. Pure Geometry Engine (`frontend/src/game/snakeEngine.ts`)
- `isOppositeDirection(dirA, dirB)`: Determines 180° opposite direction pairs (`UP` $\leftrightarrow$ `DOWN`, `LEFT` $\leftrightarrow$ `RIGHT`).
- `getNextHeadPosition(head, direction)`: Computes next cell coordinate along the 30px grid.
- `advanceSnake(snake, direction)`: Advances snake by prepending new head and dropping tail.

### 2. Custom Hooks
- **`useGameLoop` (`frontend/src/hooks/useGameLoop.ts`)**: Manages `setInterval` lifecycle at `TICK_INTERVAL_MS = 150` ms while `status === 'RUNNING'`, guaranteeing clean teardown on unmount or reset.
- **`useKeyboardControls` (`frontend/src/hooks/useKeyboardControls.ts`)**: Window-level event listener for arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`). Executes `event.preventDefault()` to prevent viewport scrolling.

### 3. Anti-Glitch 180° Turnaround Protection
To avoid the classic double-key rapid turn crash (e.g., turning `UP` then `LEFT` while moving `RIGHT` within a single 150ms tick), the state tracks:
- `direction`: The direction committed on the most recent tick.
- `nextDirection`: The queued direction requested by the player.
Candidate keypresses are validated against `direction` rather than `nextDirection`.

---

## 🍎 Food Generation, Scoring & Growth Architecture (US-03)

### 1. Deterministic Free-Cell Apple Spawner (`frontend/src/game/appleSpawner.ts`)
- `getAvailableCells(snake)`: Enumerates all 25 cells on the 5×5 grid (`150px × 150px`, `30px` cell size) in a single $O(25)$ pass and filters out any coordinate occupied by the snake's head or body.
- `spawnApple(snake, rng = Math.random)`: Selects a random unoccupied coordinate from `getAvailableCells(snake)` (clamping index bounds to `[0, available.length - 1]`), or returns `null` if all 25 cells are occupied by the snake (preventing infinite loops).
- Initial mount (`INITIAL_GAME_STATE`) places the first apple deterministically at `INITIAL_APPLE_POSITION = { x: 90, y: 60 }`, while `RESET` and post-consumption ticks spawn a fresh random unoccupied apple via `spawnApple`.

### 2. Consumption, Tail-Retention Growth & Scoring
- `isEatingApple(head, apple)` (`frontend/src/game/snakeEngine.ts`): Checks whether the next head coordinate coincides with the active apple coordinate.
- `advanceSnake(snake, direction, grow)`: When `grow === true`, prepends the new head position while retaining all existing segments (`+1` segment / `+30px` length). When `grow === false`, drops the last tail segment to preserve length.
- `POINTS_PER_APPLE = 100` (`frontend/src/game/constants.ts`): Each apple consumed increments `score` by `100` points and immediately spawns a new apple on a free cell (or transitions `status` to `'GAME_OVER'` with `gameOverReason: 'BOARD_FULL'` if the snake reaches 25 segments and fills the entire board).
- `drawApple(ctx, apple)` (`frontend/src/game/boardRenderer.ts`): Renders the apple on the Canvas at `(apple.x, apple.y)` with dimensions `30px × 30px` in red (`#ef4444`).

---

## 💥 Collision Detection & Game Over Architecture (US-04)

### 1. Pure Collision Detector (`frontend/src/game/collisionDetector.ts`)
- `checkWallCollision(nextHead, boardWidth, boardHeight)`: Returns `true` when the candidate head coordinate falls outside the valid arena bounds (`nextHead.x < 0 || nextHead.x >= boardWidth || nextHead.y < 0 || nextHead.y >= boardHeight`, i.e., outside `0..120` on the `150px × 150px` board).
- `checkSelfCollision(nextHead, activeBodySegments)`: Returns `true` when `nextHead` matches any segment in `activeBodySegments`.

### 2. Tail-Vacating Rule & Tick Evaluation Order
- On each `TICK` in `gameStateReducer.ts`:
  1. `nextHead` is computed from `state.snake[0]` and `state.nextDirection`.
  2. **Wall Collision Check**: Evaluated *before* advancing `state.snake`. If `true`, transitions to `status: 'GAME_OVER'`, sets `gameOverReason: 'WALL'`, and freezes `state.snake` and `state.score` in bounds.
  3. **Self-Collision Check (Tail-Vacating Rule)**: Determines `ateApple = isEatingApple(nextHead, state.apple)` and checks `nextHead` against `ateApple ? state.snake : state.snake.slice(0, -1)`. Because the tail vacates its cell on a non-eating tick, moving into the vacating tail cell is allowed and does not trigger a false collision. If self-collision occurs, transitions to `status: 'GAME_OVER'` with `gameOverReason: 'SELF'`.
  4. **Game Over Overlay & Reset Recovery**: `GameBoard` displays `data-testid="game-over-overlay"` with `data-reason={gameOverReason}` and the locked final score; clicking `Reset` restores `status: 'IDLE'`, `score: 0`, and `gameOverReason: null`.

---

## 🧪 Testing Verification Checklist

Before archiving any OpenSpec change:
1. `npm --prefix frontend run typecheck` passes with zero errors.
2. `npm --prefix frontend run test:coverage` achieves ≥ 90% coverage.
3. Verification reports are generated in `openspec/changes/<change-name>/reports/`.
