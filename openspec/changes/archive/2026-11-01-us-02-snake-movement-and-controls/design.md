# Design: Snake Movement & Keyboard Controls

## Context

The initial release (US-01) established the core layout, 150px × 150px canvas container with 30px cells, and a basic reducer supporting `IDLE`, `RUNNING`, and `GAME_OVER`. Now, the game needs autonomous continuous movement driven by a tick loop and responsive keyboard steering. See `proposal.md` for background and `specs/snake-movement-controls/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Provide a pure mathematical engine (`snakeEngine.ts`) for grid-aligned head advances and direction validations.
- Integrate an automatic game tick hook (`useGameLoop`) that executes at a fixed 150ms interval when `status === 'RUNNING'`.
- Capture arrow key events via `useKeyboardControls` with `event.preventDefault()` to avoid viewport jitter/scrolling.
- Eliminate 180-degree self-turn bugs by comparing desired direction with the *committed* tick direction.
- Render all snake segments cleanly onto the canvas in green (`#22c55e`).

**Non-Goals:**
- Food spawning, apple collision, score incrementing, and body expansion (deferred to US-03).
- Boundary walls and self-collision game-over triggers (deferred to US-04).
- Database persistence or backend REST endpoints (deferred to US-05/US-06).

## Decisions

### 1. Pure Engine Separation vs Embedded Reducer Math
- **Decision**: Extract `getNextHeadPosition`, `isOppositeDirection`, and `advanceSnake` into a pure module `frontend/src/game/snakeEngine.ts`.
- **Rationale**: Isolates 2D coordinate calculations from React state and rendering, making 100% test coverage straightforward and reusable across future collision and growth logic.
- **Alternatives Considered**: Inlining coordinate math directly inside `gameStateReducer.ts`. Rejected to maintain separation of concerns and avoid bloated reducer code.

### 2. Dual Direction State: `direction` vs `nextDirection`
- **Decision**: Track both `direction` (the direction committed on the most recent tick) and `nextDirection` (the direction requested by the player for the upcoming tick).
- **Rationale**: If a user is moving `RIGHT` and rapidly presses `ArrowUp` then `ArrowLeft` before the next tick fires, validating only against `nextDirection` would permit turning `LEFT` (since `UP` and `LEFT` are orthogonal), leading to an immediate 180-degree self-collision. Validating against the committed `direction` prevents this anti-pattern.
- **Alternatives Considered**: Single `direction` property updated immediately on `keydown`. Rejected because multiple key events between ticks cause instant 180-degree turnaround crashes.

### 3. Window-Level Keydown Hook vs Canvas Focus
- **Decision**: Implement `useKeyboardControls` listening on `window` while `status === 'RUNNING'`, while ensuring buttons in `ControlPanel` blur on click.
- **Rationale**: Players expect arrow keys to steer the snake immediately without needing to click the canvas to regain focus.
- **Alternatives Considered**: Attaching `onKeyDown` to the `<canvas>` element with `tabIndex={0}`. Rejected because losing canvas focus (e.g., clicking Start) would disable steering unless explicitly focused again.

### 4. Tick Loop Implementation via `setInterval` within `useEffect`
- **Decision**: Encapsulate the loop in `useGameLoop`, using `setInterval` when `status === 'RUNNING'` and calling `clearInterval` upon unmount or state transition.
- **Rationale**: Clean, predictable React hook lifecycle that guarantees no orphaned timers or state updates on unmounted components.
- **Alternatives Considered**: `requestAnimationFrame` with delta time accumulator. Rejected because snake movement is strictly discrete (150ms ticks), where `setInterval` is simpler, deterministic, and easy to mock with `jest.useFakeTimers()`.

## Risks / Trade-offs

- **[Risk: Browser Key Scrolling]** Pressing `ArrowDown` or `ArrowUp` can cause the browser window to scroll.
  - *Mitigation*: Call `event.preventDefault()` exclusively for supported arrow keys inside `useKeyboardControls`.
- **[Risk: Timer Drift]** Inactive browser tabs might throttle `setInterval`.
  - *Mitigation*: The game ticks discretely; when returning to the tab, only one tick runs per interval, preserving game integrity without retroactive multi-tick bursts.

