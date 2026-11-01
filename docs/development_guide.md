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

## 🗄️ Backend Setup (PostgreSQL Database)

The backend and database configurations will be connected in `US-05` and `US-06`.

### PostgreSQL Database (Docker)

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify container status
docker-compose ps
```

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

## 🧪 Testing Verification Checklist

Before archiving any OpenSpec change:
1. `npm --prefix frontend run typecheck` passes with zero errors.
2. `npm --prefix frontend run test:coverage` achieves ≥ 90% coverage.
3. Verification reports are generated in `openspec/changes/<change-name>/reports/`.
