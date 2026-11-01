import { GameAction, GameState } from './types';

export const INITIAL_GAME_STATE: GameState = {
  status: 'IDLE',
  score: 0,
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
      return {
        ...state,
        status: 'IDLE',
        score: 0,
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

    default:
      return state;
  }
}

