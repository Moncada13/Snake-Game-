# Step N+3: End-to-End (E2E) Testing Report — Resize Game Board 300x300

- **Date**: 2026-11-01
- **Change**: `resize-game-board-300x300`
- **Branch**: `feature/resize-game-board-300x300`
- **Status**: PASSED

---

## 1. Verified E2E Workflow Scenarios

All integration and user journey tests in `frontend/src/__tests__/e2e-workflow.test.tsx` and `frontend/src/components/SnakeGame/SnakeGame.test.tsx` passed:

1. **Board Rendering & Dimensions**:
   - `data-testid="game-board-canvas"` renders with `width: 300px`, `height: 300px`, and `aria-label="Snake game board, 300 by 300 pixels"`.
2. **Snake Navigation on 300px Grid**:
   - Snake moves in 30px increments across all 10 columns (`x ∈ [0, 30, ..., 270]`) and 10 rows (`y ∈ [0, 30, ..., 270]`).
3. **Apple Generation across 100 Cells**:
   - Apples spawn randomly among the unoccupied cells out of the 100 available coordinates.
4. **Wall Collision at 300px Boundary**:
   - Crossing `x >= 300` or `y >= 300` triggers `status: 'GAME_OVER'` with `gameOverReason: 'WALL'` and locks the snake head at `270px` in bounds.
5. **Top 5 Qualification & Submission Lifecycle**:
   - Game Over with score $\ge 100$ opens `ScoreSubmissionModal`, submits player name to `POST /api/scores`, updates the leaderboard, and highlights the new entry.

