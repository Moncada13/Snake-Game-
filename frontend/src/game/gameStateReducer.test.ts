import { BOARD_COLUMNS, BOARD_ROWS, CELL_SIZE } from './constants';
import {
  gameStateReducer,
  INITIAL_APPLE_POSITION,
  INITIAL_GAME_STATE,
} from './gameStateReducer';
import { GameAction, GameState, Position } from './types';

describe('gameStateReducer', () => {
  it('provides the correct default initial state', () => {
    expect(INITIAL_GAME_STATE).toEqual({
      status: 'IDLE',
      score: 0,
      snake: [{ x: 30, y: 60 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      apple: INITIAL_APPLE_POSITION,
    });
  });

  describe('START action', () => {
    it('transitions status from IDLE to RUNNING and preserves existing apple', () => {
      const state: GameState = { ...INITIAL_GAME_STATE, status: 'IDLE' };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState.status).toBe('RUNNING');
      expect(nextState.snake).toEqual([{ x: 30, y: 60 }]);
      expect(nextState.apple).toEqual(INITIAL_APPLE_POSITION);
    });

    it('spawns a new apple on START if state.apple is null', () => {
      const state: GameState = {
        ...INITIAL_GAME_STATE,
        status: 'IDLE',
        apple: null,
      };
      const nextState = gameStateReducer(state, { type: 'START' }, () => 0);
      expect(nextState.status).toBe('RUNNING');
      expect(nextState.apple).toEqual({ x: 0, y: 0 });
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
    it('resets score, snake position, direction, status to IDLE, and spawns a fresh unoccupied apple', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 500,
        snake: [{ x: 120, y: 90 }, { x: 90, y: 90 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
        apple: { x: 0, y: 0 },
      };
      const nextState = gameStateReducer(state, { type: 'RESET' }, () => 0);
      expect(nextState).toEqual({
        ...INITIAL_GAME_STATE,
        apple: { x: 0, y: 0 },
      });
    });

    it('resets state when in GAME_OVER', () => {
      const state: GameState = {
        status: 'GAME_OVER',
        score: 500,
        snake: [{ x: 120, y: 90 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
        apple: null,
      };
      const nextState = gameStateReducer(state, { type: 'RESET' }, () => 0);
      expect(nextState.status).toBe('IDLE');
      expect(nextState.score).toBe(0);
      expect(nextState.snake).toEqual([{ x: 30, y: 60 }]);
      expect(nextState.apple).toEqual({ x: 0, y: 0 });
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
        apple: { x: 0, y: 0 },
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

    it('advances head position without growing or scoring when apple is not eaten', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 100,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'DOWN',
        apple: { x: 120, y: 120 },
      };
      const nextState = gameStateReducer(state, { type: 'TICK' });

      expect(nextState.direction).toBe('DOWN');
      expect(nextState.nextDirection).toBe('DOWN');
      expect(nextState.snake).toEqual([{ x: 30, y: 90 }]);
      expect(nextState.score).toBe(100);
      expect(nextState.apple).toEqual({ x: 120, y: 120 });
    });

    it('increments score by 100, grows snake by 1 segment, and spawns a new apple when eating', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 200,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        apple: { x: 60, y: 60 },
      };

      const nextState = gameStateReducer(state, { type: 'TICK' }, () => 0);

      expect(nextState.score).toBe(300);
      expect(nextState.snake).toEqual([
        { x: 60, y: 60 },
        { x: 30, y: 60 },
      ]);
      expect(nextState.snake).toHaveLength(2);
      expect(nextState.apple).toEqual({ x: 0, y: 0 });
      expect(nextState.status).toBe('RUNNING');

      // Subsequent non-eating tick preserves the new length of 2
      const followingTick = gameStateReducer(nextState, { type: 'TICK' });
      expect(followingTick.snake).toEqual([
        { x: 90, y: 60 },
        { x: 60, y: 60 },
      ]);
      expect(followingTick.snake).toHaveLength(2);
    });

    it('transitions to GAME_OVER with apple = null when eating the 25th and final available cell', () => {
      // Fill 24 of the 25 cells, leaving only {0, 0} for the apple
      const almostFullSnake: Position[] = [];
      for (let row = 0; row < BOARD_ROWS; row++) {
        for (let col = 0; col < BOARD_COLUMNS; col++) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;
          if (!(x === 0 && y === 0) && !(x === 30 && y === 0)) {
            almostFullSnake.push({ x, y });
          }
        }
      }
      // Put head at {30, 0} moving LEFT into {0, 0}
      const snake24: Position[] = [{ x: 30, y: 0 }, ...almostFullSnake];
      expect(snake24).toHaveLength(24);

      const state: GameState = {
        status: 'RUNNING',
        score: 2300,
        snake: snake24,
        direction: 'LEFT',
        nextDirection: 'LEFT',
        apple: { x: 0, y: 0 },
      };

      const nextState = gameStateReducer(state, { type: 'TICK' });

      expect(nextState.score).toBe(2400);
      expect(nextState.snake).toHaveLength(25);
      expect(nextState.apple).toBeNull();
      expect(nextState.status).toBe('GAME_OVER');
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
        ...INITIAL_GAME_STATE,
        status: 'RUNNING',
      };
      const nextState = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'UP',
      });
      expect(nextState.nextDirection).toBe('UP');
      expect(nextState.direction).toBe('RIGHT');
    });

    it('ignores direct 180-degree reversal attempts', () => {
      const state: GameState = {
        ...INITIAL_GAME_STATE,
        status: 'RUNNING',
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
        ...INITIAL_GAME_STATE,
        status: 'RUNNING',
      };
      const nextState = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'RIGHT',
      });
      expect(nextState).toBe(state);
    });

    it('prevents single-tick rapid double-key reversal glitch', () => {
      const state: GameState = {
        ...INITIAL_GAME_STATE,
        status: 'RUNNING',
      };

      const step1 = gameStateReducer(state, {
        type: 'CHANGE_DIRECTION',
        payload: 'UP',
      });
      expect(step1.nextDirection).toBe('UP');

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
