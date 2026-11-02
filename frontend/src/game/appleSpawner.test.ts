import { getAvailableCells, spawnApple } from './appleSpawner';
import { BOARD_COLUMNS, BOARD_ROWS, CELL_SIZE } from './constants';
import { Position } from './types';

describe('appleSpawner', () => {
  describe('getAvailableCells', () => {
    it('returns all 100 grid cells when snake is empty', () => {
      const available = getAvailableCells([]);
      expect(available).toHaveLength(BOARD_COLUMNS * BOARD_ROWS);
      expect(available[0]).toEqual({ x: 0, y: 0 });
      expect(available[99]).toEqual({ x: 270, y: 270 });
    });

    it('excludes cells occupied by the snake', () => {
      const snake: Position[] = [
        { x: 30, y: 60 },
        { x: 60, y: 60 },
      ];
      const available = getAvailableCells(snake);

      expect(available).toHaveLength(98);
      expect(available).not.toContainEqual({ x: 30, y: 60 });
      expect(available).not.toContainEqual({ x: 60, y: 60 });
    });

    it('returns an empty array when all 100 cells are occupied by the snake', () => {
      const fullSnake: Position[] = [];
      for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLUMNS; col++) {
          fullSnake.push({ x: col * CELL_SIZE, y: row * CELL_SIZE });
        }
      }

      const available = getAvailableCells(fullSnake);
      expect(available).toEqual([]);
    });
  });

  describe('spawnApple', () => {
    it('spawns an apple at the first available cell when rng returns 0', () => {
      const snake: Position[] = [{ x: 0, y: 0 }];
      const apple = spawnApple(snake, () => 0);

      // Since {0,0} is occupied, the first available cell in row-major order is {30,0}
      expect(apple).toEqual({ x: 30, y: 0 });
    });

    it('spawns an apple at the last available cell when rng returns 0.999', () => {
      const snake: Position[] = [{ x: 270, y: 270 }];
      const apple = spawnApple(snake, () => 0.999);

      // Since {270,270} is occupied, the last available cell is {240,270}
      expect(apple).toEqual({ x: 240, y: 270 });
    });

    it('clamps out-of-bounds rng values (< 0 or >= 1) to valid cell indices', () => {
      const snake: Position[] = [{ x: 0, y: 0 }];
      expect(spawnApple(snake, () => -0.5)).toEqual({ x: 30, y: 0 });
      expect(spawnApple(snake, () => 1.0)).toEqual({ x: 270, y: 270 });
    });

    it('uses default Math.random when rng is not provided and never overlaps the snake', () => {
      const snake: Position[] = [
        { x: 30, y: 60 },
        { x: 60, y: 60 },
        { x: 90, y: 60 },
      ];
      const apple = spawnApple(snake);

      expect(apple).not.toBeNull();
      expect(snake).not.toContainEqual(apple);
      expect(apple!.x % CELL_SIZE).toBe(0);
      expect(apple!.y % CELL_SIZE).toBe(0);
    });

    it('returns null when all 100 grid cells are occupied', () => {
      const fullSnake: Position[] = [];
      for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLUMNS; col++) {
          fullSnake.push({ x: col * CELL_SIZE, y: row * CELL_SIZE });
        }
      }

      expect(spawnApple(fullSnake)).toBeNull();
    });
  });
});

