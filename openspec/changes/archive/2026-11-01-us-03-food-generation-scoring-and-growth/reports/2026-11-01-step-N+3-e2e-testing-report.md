# Step N+3: End-to-End (E2E) Testing Report (`us-03-food-generation-scoring-and-growth`)

**Date:** 2026-11-01  
**Change:** `us-03-food-generation-scoring-and-growth`  
**Branch:** `feature/US-03-food-scoring-and-growth`

---

## E2E Workflow Verification (`frontend/src/__tests__/e2e-workflow.test.tsx`)

Automated E2E workflow tests were executed across the full `App` component tree (`App` $\rightarrow$ `SnakeGame` $\rightarrow$ `ScoreBoard`, `GameBoard`, `ResetButton`, `Leaderboard`).

### Verified User Workflows
1. **Initial Render & Apple Presence (`US-01` + `US-03`)**:
   - The `150x150` Canvas renders the 5×5 grid, the initial green snake at `(30, 60)`, and the initial red apple at `(90, 60)` (`#ef4444`).
   - Current score starts at `0`.
2. **Continuous Movement & Steering (`US-02`)**:
   - Snake advances 1 cell (`30px`) per `150ms` tick and responds to `ArrowUp`, `ArrowDown`, `ArrowLeft`, and `ArrowRight` while blocking 180-degree self-reversals.
3. **Apple Consumption, +100 Score Increment, Snake Growth, and Apple Respawn (`US-03`)**:
   - Advancing 2 ticks to the right (`150ms * 2 = 300ms`) moves the snake head from `(30, 60)` $\rightarrow$ `(60, 60)` $\rightarrow$ `(90, 60)`, colliding with the apple at `(90, 60)`.
   - `ScoreBoard` immediately updates from `0` to `100` (`+100` points).
   - The snake grows from 1 segment (`30px`) to 2 segments (`60px`), retaining its previous tail segment at `(60, 60)` while placing the new head at `(90, 60)`.
   - A new apple immediately spawns on an unoccupied grid cell.
4. **Reset Cycle (`US-01` + `US-02` + `US-03`)**:
   - Clicking `Reiniciar / Jugar de Nuevo` resets the score from `100` back to `0`, restores the snake to a single segment at `(30, 60)` moving `RIGHT`, and spawns a fresh unoccupied apple.

### Execution Result
- **Suite:** `frontend/src/__tests__/e2e-workflow.test.tsx`
- **Status:** ✅ ALL E2E TESTS PASSED

