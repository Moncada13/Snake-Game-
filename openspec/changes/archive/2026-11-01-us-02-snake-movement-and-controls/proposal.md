# Proposal: US-02 Snake Movement & Keyboard Controls

## Why

Following the setup of the static game board and UI layout (US-01), the game requires dynamic interactive movement to become playable. Players need the snake to spawn in a known initial state, advance continuously across the 150px × 150px arena in 30px increments at a fixed tick rate (150ms), and respond immediately to arrow keys without crashing into itself via instant 180-degree reversals.

## What Changes

- **Initial Snake Representation**: Initialize snake as a single 30px × 30px segment at coordinates `{ x: 30, y: 60 }`, facing `RIGHT`.
- **Automatic Game Loop Hook (`useGameLoop`)**: Dispatch `TICK` actions at a fixed `TICK_INTERVAL_MS = 150` ms while the game is `RUNNING`; safely clear interval on pause, reset, or unmount.
- **Direction Steering Hook (`useKeyboardControls`)**: Listen to arrow key events (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`), prevent default page scroll, and queue valid direction changes.
- **Anti-Glitch 180° Reversal Prevention**: Validate direction changes against the *committed* direction of the last tick, ensuring rapid sequential keypresses (e.g. `ArrowUp` then `ArrowLeft` when moving `RIGHT`) cannot trigger an illegal 180° turnaround within a single tick.
- **Pure State Reducer Extensions (`gameStateReducer`)**: Handle `TICK` (advancing head and shifting body) and `CHANGE_DIRECTION`.
- **Canvas Snake Renderer**: Extend `boardRenderer.ts` and `GameBoard.tsx` to render all snake segments in green (`#22c55e`).

## Capabilities

### New Capabilities
- `snake-movement-controls`: Manages snake body coordinate arrays, automatic tick-based continuous movement, keyboard arrow event handling, anti-reversal validation, and canvas rendering of the snake.

### Modified Capabilities
<!-- No requirement changes to existing specs. game-board-ui layout requirements remain intact. -->

## Impact

- **Frontend Code**: Modifies `frontend/src/game/types.ts`, `gameStateReducer.ts`, `boardRenderer.ts`, `GameBoard.tsx`, and `SnakeGame.tsx`. Adds `snakeEngine.ts`, `useGameLoop.ts`, and `useKeyboardControls.ts`.
- **Dependencies & APIs**: No external dependencies or backend API calls required.
- **Testing**: Requires 100% test coverage for pure movement math, hooks (using Jest fake timers), reducer actions, and UI integration.

