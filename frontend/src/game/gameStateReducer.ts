import { INITIAL_DIRECTION, INITIAL_SNAKE_POSITION } from './constants';
import { advanceSnake, isOppositeDirection } from './snakeEngine';
import { Direction, GameAction, GameState } from './types';

export const INITIAL_GAME_STATE: GameState = {
  status: 'IDLE',
  score: 0,
  snake: [INITIAL_SNAKE_POSITION],
  direction: INITIAL_DIRECTION as Direction,
  nextDirection: INITIAL_DIRECTION as Direction,
};

export function gameStateReducer(
  state: GameState = INITIAL_GAME_STATE,
  action: GameAction
): GameState {
  switch (action.type) {
    case 'START': {
      if (state.status === 'IDLE') {
        return {
          ...state,
          status: 'RUNNING',
        };
      }
      return state;
    }

    case 'RESET': {
      return INITIAL_GAME_STATE;
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
      const nextSnake = advanceSnake(state.snake, activeDirection);
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
