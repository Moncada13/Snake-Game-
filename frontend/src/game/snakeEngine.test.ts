import {
  advanceSnake,
  getNextHeadPosition,
  isEatingApple,
  isOppositeDirection,
} from './snakeEngine';
import { Direction, Position } from './types';

describe('snakeEngine', () => {
  describe('isOppositeDirection', () => {
    it('identifies opposite vertical directions', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('identifies opposite horizontal directions', () => {
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('returns false for orthogonal directions', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('LEFT', 'UP')).toBe(false);
      expect(isOppositeDirection('RIGHT', 'UP')).toBe(false);
    });

    it('returns false when both directions are identical', () => {
      const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      directions.forEach((dir) => {
        expect(isOppositeDirection(dir, dir)).toBe(false);
      });
    });
  });

  describe('getNextHeadPosition', () => {
    const origin: Position = { x: 30, y: 60 };

    it('advances UP by reducing y by CELL_SIZE', () => {
      expect(getNextHeadPosition(origin, 'UP')).toEqual({ x: 30, y: 30 });
    });

    it('advances DOWN by increasing y by CELL_SIZE', () => {
      expect(getNextHeadPosition(origin, 'DOWN')).toEqual({ x: 30, y: 90 });
    });

    it('advances LEFT by reducing x by CELL_SIZE', () => {
      expect(getNextHeadPosition(origin, 'LEFT')).toEqual({ x: 0, y: 60 });
    });

    it('advances RIGHT by increasing x by CELL_SIZE', () => {
      expect(getNextHeadPosition(origin, 'RIGHT')).toEqual({ x: 60, y: 60 });
    });
  });

  describe('advanceSnake', () => {
    it('moves a single segment snake to the new head position', () => {
      const snake: Position[] = [{ x: 30, y: 60 }];
      const nextSnake = advanceSnake(snake, 'RIGHT');

      expect(nextSnake).toEqual([{ x: 60, y: 60 }]);
      expect(nextSnake.length).toBe(1);
    });

    it('advances a multi-segment snake preserving length and shifting body', () => {
      const snake: Position[] = [
        { x: 60, y: 60 },
        { x: 30, y: 60 },
      ];
      const nextSnake = advanceSnake(snake, 'DOWN');

      expect(nextSnake).toEqual([
        { x: 60, y: 90 },
        { x: 60, y: 60 },
      ]);
      expect(nextSnake.length).toBe(2);
    });

    it('returns default fallback when given an empty snake array', () => {
      const nextSnake = advanceSnake([], 'RIGHT');
      expect(nextSnake).toEqual([{ x: 30, y: 60 }]);
    });

    it('retains tail segment and grows snake length by 1 when grow is true', () => {
      const snake: Position[] = [{ x: 30, y: 60 }];
      const grownSnake = advanceSnake(snake, 'RIGHT', true);

      expect(grownSnake).toEqual([
        { x: 60, y: 60 },
        { x: 30, y: 60 },
      ]);
      expect(grownSnake).toHaveLength(2);
    });
  });

  describe('isEatingApple', () => {
    it('returns true when head coordinates match apple coordinates', () => {
      expect(isEatingApple({ x: 60, y: 60 }, { x: 60, y: 60 })).toBe(true);
    });

    it('returns false when head coordinates do not match apple coordinates', () => {
      expect(isEatingApple({ x: 30, y: 60 }, { x: 60, y: 60 })).toBe(false);
      expect(isEatingApple({ x: 60, y: 30 }, { x: 60, y: 60 })).toBe(false);
    });

    it('returns false when apple is null', () => {
      expect(isEatingApple({ x: 60, y: 60 }, null)).toBe(false);
    });
  });
});

