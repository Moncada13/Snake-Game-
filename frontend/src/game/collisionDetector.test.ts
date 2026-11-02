import { checkSelfCollision, checkWallCollision } from './collisionDetector';
import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { Position } from './types';

describe('collisionDetector', () => {
  describe('checkWallCollision', () => {
    it('returns false for valid interior and boundary-edge grid coordinates (0..120)', () => {
      expect(checkWallCollision({ x: 0, y: 0 })).toBe(false);
      expect(checkWallCollision({ x: 60, y: 60 })).toBe(false);
      expect(checkWallCollision({ x: 120, y: 0 })).toBe(false);
      expect(checkWallCollision({ x: 0, y: 120 })).toBe(false);
      expect(checkWallCollision({ x: 120, y: 120 })).toBe(false);
    });

    it('returns true when crossing the left wall (x < 0)', () => {
      expect(checkWallCollision({ x: -30, y: 60 })).toBe(true);
    });

    it('returns true when crossing the right wall (x >= BOARD_WIDTH)', () => {
      expect(checkWallCollision({ x: BOARD_WIDTH, y: 60 })).toBe(true);
      expect(checkWallCollision({ x: 150, y: 60 })).toBe(true);
    });

    it('returns true when crossing the top wall (y < 0)', () => {
      expect(checkWallCollision({ x: 60, y: -30 })).toBe(true);
    });

    it('returns true when crossing the bottom wall (y >= BOARD_HEIGHT)', () => {
      expect(checkWallCollision({ x: 60, y: BOARD_HEIGHT })).toBe(true);
      expect(checkWallCollision({ x: 60, y: 150 })).toBe(true);
    });

    it('supports custom boardWidth and boardHeight parameters', () => {
      expect(checkWallCollision({ x: 270, y: 270 }, 300, 300)).toBe(false);
      expect(checkWallCollision({ x: 300, y: 270 }, 300, 300)).toBe(true);
      expect(checkWallCollision({ x: 270, y: 300 }, 300, 300)).toBe(true);
    });
  });

  describe('checkSelfCollision', () => {
    it('returns false when activeBodySegments is empty', () => {
      expect(checkSelfCollision({ x: 60, y: 60 }, [])).toBe(false);
    });

    it('returns false when nextHead does not match any active body segment', () => {
      const body: Position[] = [
        { x: 60, y: 60 },
        { x: 90, y: 60 },
        { x: 90, y: 30 },
      ];
      expect(checkSelfCollision({ x: 30, y: 60 }, body)).toBe(false);
    });

    it('returns true when nextHead matches an active body segment', () => {
      const body: Position[] = [
        { x: 60, y: 60 },
        { x: 90, y: 60 },
        { x: 90, y: 30 },
        { x: 60, y: 30 },
      ];
      expect(checkSelfCollision({ x: 60, y: 30 }, body)).toBe(true);
    });
  });
});

