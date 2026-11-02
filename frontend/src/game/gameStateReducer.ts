import { spawnApple } from './appleSpawner';
import { checkSelfCollision, checkWallCollision } from './collisionDetector';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  INITIAL_DIRECTION,
  INITIAL_SNAKE_POSITION,
  POINTS_PER_APPLE,
} from './constants';
import {
  advanceSnake,
  getNextHeadPosition,
  isEatingApple,
  isOppositeDirection,
} from './snakeEngine';
import { Direction, GameAction, GameState } from './types';

export const INITIAL_APPLE_POSITION = Object.freeze({ x: 90, y: 60 });

export const INITIAL_GAME_STATE: GameState = {
  status: 'IDLE',
  score: 0,
  snake: [INITIAL_SNAKE_POSITION],
  direction: INITIAL_DIRECTION as Direction,
  nextDirection: INITIAL_DIRECTION as Direction,
  apple: INITIAL_APPLE_POSITION,
  gameOverReason: null,
};

export function gameStateReducer(
  state: GameState = INITIAL_GAME_STATE,
  action: GameAction,
  rng: () => number = Math.random
): GameState {
  switch (action.type) {
    case 'START': {
      if (state.status === 'IDLE') {
        return {
          ...state,
          status: 'RUNNING',
          apple: state.apple ?? spawnApple(state.snake, rng),
          gameOverReason: null,
        };
      }
      return state;
    }

    case 'RESET': {
      return {
        ...INITIAL_GAME_STATE,
        apple: spawnApple([INITIAL_SNAKE_POSITION], rng),
        gameOverReason: null,
      };
    }

    case 'GAME_OVER': {
      if (state.status === 'RUNNING') {
        return {
          ...state,
          status: 'GAME_OVER',
        };
      }
      return state;
    }

    case 'TICK': {
      if (state.status !== 'RUNNING') {
        return state;
      }
      const activeDirection = state.nextDirection;
      const nextHead = getNextHeadPosition(state.snake[0], activeDirection);

      // 1. Check outer wall boundary collision before moving the snake
      if (checkWallCollision(nextHead, BOARD_WIDTH, BOARD_HEIGHT)) {
        return {
          ...state,
          status: 'GAME_OVER',
          direction: activeDirection,
          nextDirection: activeDirection,
          gameOverReason: 'WALL',
        };
      }

      // 2. Determine whether the candidate head position consumes the apple
      const ateApple = isEatingApple(nextHead, state.apple);

      // 3. Check self-collision (excluding the vacating tail on non-eating ticks)
      const activeBodySegments = ateApple ? state.snake : state.snake.slice(0, -1);
      if (checkSelfCollision(nextHead, activeBodySegments)) {
        return {
          ...state,
          status: 'GAME_OVER',
          direction: activeDirection,
          nextDirection: activeDirection,
          gameOverReason: 'SELF',
        };
      }

      // 4. Advance snake (retaining tail when eating)
      const nextSnake = advanceSnake(state.snake, activeDirection, ateApple);

      if (ateApple) {
        const nextScore = state.score + POINTS_PER_APPLE;
        const nextApple = spawnApple(nextSnake, rng);
        const isBoardFull = nextApple === null;

        return {
          ...state,
          status: isBoardFull ? 'GAME_OVER' : state.status,
          score: nextScore,
          snake: nextSnake,
          direction: activeDirection,
          nextDirection: activeDirection,
          apple: nextApple,
          gameOverReason: isBoardFull ? 'BOARD_FULL' : null,
        };
      }

      return {
        ...state,
        snake: nextSnake,
        direction: activeDirection,
        nextDirection: activeDirection,
      };
    }

    case 'CHANGE_DIRECTION': {
      if (state.status !== 'RUNNING') {
        return state;
      }
      const requestedDirection = action.payload;
      // Reject if identical to current queued direction or directly opposite to committed direction
      if (
        requestedDirection === state.nextDirection ||
        isOppositeDirection(requestedDirection, state.direction)
      ) {
        return state;
      }
      return {
        ...state,
        nextDirection: requestedDirection,
      };
    }

    default:
      return state;
  }
}
