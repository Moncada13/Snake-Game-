import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import { Position } from './types';

/**
 * Checks whether the candidate next head position falls outside the valid arena boundaries.
 * Valid coordinates satisfy 0 <= x < boardWidth and 0 <= y < boardHeight.
 */
export const checkWallCollision = (
  nextHead: Position,
  boardWidth: number = BOARD_WIDTH,
  boardHeight: number = BOARD_HEIGHT
): boolean => {
  return (
    nextHead.x < 0 ||
    nextHead.x >= boardWidth ||
    nextHead.y < 0 ||
    nextHead.y >= boardHeight
  );
};

/**
 * Checks whether the candidate next head position collides with any active body segment.
 * To honor the tail-vacating rule, callers should pass the body segments that remain
 * occupied on the current tick (i.e., excluding the last tail segment on non-eating ticks).
 */
export const checkSelfCollision = (
  nextHead: Position,
  activeBodySegments: Position[]
): boolean => {
  return activeBodySegments.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y
  );
};

