import { CELL_SIZE, INITIAL_SNAKE_POSITION } from './constants';
import { Direction, Position } from './types';

/**
 * Checks whether two directions are direct 180-degree opposites.
 */
export const isOppositeDirection = (dirA: Direction, dirB: Direction): boolean => {
  return (
    (dirA === 'UP' && dirB === 'DOWN') ||
    (dirA === 'DOWN' && dirB === 'UP') ||
    (dirA === 'LEFT' && dirB === 'RIGHT') ||
    (dirA === 'RIGHT' && dirB === 'LEFT')
  );
};

/**
 * Calculates the next head coordinate given the current head and moving direction.
 */
export const getNextHeadPosition = (head: Position, direction: Direction): Position => {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - CELL_SIZE };
    case 'DOWN':
      return { x: head.x, y: head.y + CELL_SIZE };
    case 'LEFT':
      return { x: head.x - CELL_SIZE, y: head.y };
    case 'RIGHT':
      return { x: head.x + CELL_SIZE, y: head.y };
  }
};

/**
 * Checks whether the given head coordinate matches the active apple coordinate.
 */
export const isEatingApple = (head: Position, apple: Position | null): boolean => {
  if (!apple) {
    return false;
  }
  return head.x === apple.x && head.y === apple.y;
};

/**
 * Advances the snake forward in the specified direction.
 * When grow is true, retains the tail segment so the snake grows by 1 segment.
 * When grow is false (default), pops the tail to keep length constant.
 */
export const advanceSnake = (
  snake: Position[],
  direction: Direction,
  grow: boolean = false
): Position[] => {
  if (snake.length === 0) {
    return [INITIAL_SNAKE_POSITION];
  }

  const currentHead = snake[0];
  const newHead = getNextHeadPosition(currentHead, direction);

  if (grow) {
    return [newHead, ...snake];
  }

  // Prepend new head and keep length constant by dropping tail
  return [newHead, ...snake.slice(0, -1)];
};

