import { BOARD_COLUMNS, BOARD_ROWS, CELL_SIZE } from './constants';
import { Position } from './types';

/**
 * Returns all grid cells on the board that are not currently occupied by any snake segment.
 * Executes in O(rows * cols) single-pass deterministic time.
 */
export const getAvailableCells = (
  snake: Position[],
  columns: number = BOARD_COLUMNS,
  rows: number = BOARD_ROWS,
  cellSize: number = CELL_SIZE
): Position[] => {
  const occupiedKeys = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available: Position[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      if (!occupiedKeys.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  return available;
};

/**
 * Spawns a 30px x 30px apple on a random unoccupied grid cell,
 * or returns null if the snake occupies all cells on the board.
 */
export const spawnApple = (
  snake: Position[],
  rng: () => number = Math.random
): Position | null => {
  const available = getAvailableCells(snake);
  if (available.length === 0) {
    return null;
  }

  const rawIndex = Math.floor(rng() * available.length);
  const index = Math.min(available.length - 1, Math.max(0, rawIndex));
  return available[index];
};

