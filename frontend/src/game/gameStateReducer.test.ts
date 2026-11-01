import {
  gameStateReducer,
  INITIAL_GAME_STATE,
} from './gameStateReducer';
import { GameAction, GameState } from './types';

describe('gameStateReducer', () => {
  it('provides the correct default initial state', () => {
    expect(INITIAL_GAME_STATE).toEqual({
      status: 'IDLE',
      score: 0,
      snake: [{ x: 30, y: 60 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
    });
  });

  describe('START action', () => {
    it('transitions status from IDLE to RUNNING', () => {
      const state: GameState = { ...INITIAL_GAME_STATE, status: 'IDLE' };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState.status).toBe('RUNNING');
      expect(nextState.snake).toEqual([{ x: 30, y: 60 }]);
    });

    it('is a no-op when already RUNNING', () => {
      const state: GameState = { ...INITIAL_GAME_STATE, status: 'RUNNING', score: 200 };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(state);
    });

    it('does not allow START directly from GAME_OVER (must RESET first)', () => {
      const state: GameState = { ...INITIAL_GAME_STATE, status: 'GAME_OVER', score: 300 };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });

  describe('RESET action', () => {
    it('resets score, snake position, direction, and status to IDLE when RUNNING', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 500,
        snake: [{ x: 120, y: 90 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
      };
      const action: GameAction = { type: 'RESET' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(INITIAL_GAME_STATE);
    });

    it('resets state when in GAME_OVER', () => {
      const state: GameState = {
        status: 'GAME_OVER',
        score: 500,
        snake: [{ x: 120, y: 90 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
      };
      const action: GameAction = { type: 'RESET' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(INITIAL_GAME_STATE);
    });
  });

  describe('GAME_OVER action', () => {
    it('transitions status from RUNNING to GAME_OVER and preserves score and snake', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 800,
        snake: [{ x: 90, y: 90 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      const action: GameAction = { type: 'GAME_OVER' };
      const nextState = gameStateReducer(state, action);
      expect(nextState.status).toBe('GAME_OVER');
      expect(nextState.score).toBe(800);
      expect(nextState.snake).toEqual([{ x: 90, y: 90 }]);
    });

    it('is a no-op if dispatched when IDLE', () => {
      const state: GameState = { ...INITIAL_GAME_STATE, status: 'IDLE' };
      const action: GameAction = { type: 'GAME_OVER' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(state);
    });

    it('is a no-op if already in GAME_OVER', () => {
      const state: GameState = { ...INITIAL_GAME_STATE, status: 'GAME_OVER' };
      const action: GameAction = { type: 'GAME_OVER' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });

  describe('TICK action', () => {
    it('is a no-op when not in RUNNING status', () => {
      const idleState: GameState = { ...INITIAL_GAME_STATE, status: 'IDLE' };
      expect(gameStateReducer(idleState, { type: 'TICK' })).toBe(idleState);

      const gameOverState: GameState = { ...INITIAL_GAME_STATE, status: 'GAME_OVER' };
      expect(gameStateReducer(gameOverState, { type: 'TICK' })).toBe(gameOverState);
    });

    it('advances head position in active direction and commits nextDirection', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 0,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'DOWN',
      };
      const nextState = gameStateReducer(state, { type: 'TICK' });

      expect(nextState.direction).toBe('DOWN');
      expect(nextState.nextDirection).toBe('DOWN');
      expect(nextState.snake).toEqual([{ x: 30, y: 90 }]);
    });
  });

  describe('CHANGE_DIRECTION action', () => {
    it('is a no-op when status is not RUNNING', () => {
      const idleState: GameState = { ...INITIAL_GAME_STATE, status: 'IDLE' };
      const nextState = gameStateReducer(idleState, {
        type: 'CHANGE_DIRECTION',
        payload: 'DOWN',
      });
      expect(nextState).toBe(idleState);
    });

    it('updates nextDirection for valid orthogonal turns', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 0,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      const nextState = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'UP',
      });
      expect(nextState.nextDirection).toBe('UP');
      expect(nextState.direction).toBe('RIGHT'); // direction remains committed until tick
    });

    it('ignores direct 180-degree reversal attempts', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 0,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      const nextState = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'LEFT',
      });
      expect(nextState).toBe(state);
      expect(nextState.nextDirection).toBe('RIGHT');
    });

    it('ignores duplicate direction changes', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 0,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      const nextState = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'RIGHT',
      });
      expect(nextState).toBe(state);
    });

    it('prevents single-tick rapid double-key reversal glitch', () => {
      // Snake is moving RIGHT. Player taps UP, then taps LEFT before TICK occurs.
      const state: GameState = {
        status: 'RUNNING',
        score: 0,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };

      // First tap: UP
      const step1 = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'UP',
      });
      expect(step1.nextDirection).toBe('UP');

      // Second tap: LEFT before tick
      // Since committed direction is still RIGHT, LEFT must be rejected!
      const step2 = gameStateReducer(step1, {
        type: 'CHANGE_DIRECTION',
        payload: 'LEFT',
      });
      expect(step2.nextDirection).toBe('UP');
    });
  });

  describe('Default state parameter', () => {
    it('uses INITIAL_GAME_STATE if state is undefined', () => {
      const nextState = gameStateReducer(undefined, { type: 'START' });
      expect(nextState.status).toBe('RUNNING');
      expect(nextState.snake).toEqual([{ x: 30, y: 60 }]);
    });
  });

  describe('Unknown / unhandled action', () => {
    it('returns the same state reference for unknown action types', () => {
      const state = { ...INITIAL_GAME_STATE };
      const nextState = gameStateReducer(state, { type: 'NON_EXISTENT' } as unknown as GameAction);
      expect(nextState).toBe(state);
    });
  });
});
