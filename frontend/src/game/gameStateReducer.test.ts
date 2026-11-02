import { BOARD_COLUMNS, BOARD_ROWS, CELL_SIZE, POINTS_PER_APPLE } from './constants';
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
      gameOverReason: null,
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
      expect(nextState.gameOverReason).toBeNull();
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
      const state: GameState = {
        ...INITIAL_GAME_STATE,
        status: 'GAME_OVER',
        score: 300,
        gameOverReason: 'WALL',
      };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual(state);
    });
  });

  describe('RESET action', () => {
    it('resets score, snake position, direction, status to IDLE, gameOverReason to null, and spawns a fresh unoccupied apple', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 500,
        snake: [{ x: 120, y: 90 }, { x: 90, y: 90 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
        apple: { x: 0, y: 0 },
        gameOverReason: null,
      };
      const nextState = gameStateReducer(state, { type: 'RESET' }, () => 0);
      expect(nextState).toEqual({
        ...INITIAL_GAME_STATE,
        apple: { x: 0, y: 0 },
        gameOverReason: null,
      });
    });

    it('resets state and clears gameOverReason when in GAME_OVER', () => {
      const state: GameState = {
        status: 'GAME_OVER',
        score: 500,
        snake: [{ x: 120, y: 90 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
        apple: null,
        gameOverReason: 'WALL',
      };
      const nextState = gameStateReducer(state, { type: 'RESET' }, () => 0);
      expect(nextState.status).toBe('IDLE');
      expect(nextState.score).toBe(0);
      expect(nextState.snake).toEqual([{ x: 30, y: 60 }]);
      expect(nextState.apple).toEqual({ x: 0, y: 0 });
      expect(nextState.gameOverReason).toBeNull();
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
        gameOverReason: null,
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

      const gameOverState: GameState = {
        ...INITIAL_GAME_STATE,
        status: 'GAME_OVER',
        gameOverReason: 'WALL',
      };
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
        gameOverReason: null,
      };
      const nextState = gameStateReducer(state, { type: 'TICK' });

      expect(nextState.direction).toBe('DOWN');
      expect(nextState.nextDirection).toBe('DOWN');
      expect(nextState.snake).toEqual([{ x: 30, y: 90 }]);
      expect(nextState.score).toBe(100);
      expect(nextState.apple).toEqual({ x: 120, y: 120 });
      expect(nextState.gameOverReason).toBeNull();
    });

    it('increments score by 100, grows snake by 1 segment, and spawns a new apple when eating', () => {
      const state: GameState = {
        status: 'RUNNING',
        score: 200,
        snake: [{ x: 30, y: 60 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        apple: { x: 60, y: 60 },
        gameOverReason: null,
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
      expect(nextState.gameOverReason).toBeNull();

      // Subsequent non-eating tick preserves the new length of 2
      const followingTick = gameStateReducer(nextState, { type: 'TICK' });
      expect(followingTick.snake).toEqual([
        { x: 90, y: 60 },
        { x: 60, y: 60 },
      ]);
      expect(followingTick.snake).toHaveLength(2);
    });

    it('transitions to GAME_OVER with gameOverReason = BOARD_FULL and apple = null when eating the final available cell', () => {
      // Fill (BOARD_COLUMNS * BOARD_ROWS - 1) cells, leaving only {0, 0} for the apple
      const totalCells = BOARD_COLUMNS * BOARD_ROWS;
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
      const snakeMinusOne: Position[] = [{ x: 30, y: 0 }, ...almostFullSnake];
      expect(snakeMinusOne).toHaveLength(totalCells - 1);

      const state: GameState = {
        status: 'RUNNING',
        score: (totalCells - 2) * POINTS_PER_APPLE,
        snake: snakeMinusOne,
        direction: 'LEFT',
        nextDirection: 'LEFT',
        apple: { x: 0, y: 0 },
        gameOverReason: null,
      };

      const nextState = gameStateReducer(state, { type: 'TICK' });

      expect(nextState.score).toBe((totalCells - 1) * POINTS_PER_APPLE);
      expect(nextState.snake).toHaveLength(totalCells);
      expect(nextState.apple).toBeNull();
      expect(nextState.status).toBe('GAME_OVER');
      expect(nextState.gameOverReason).toBe('BOARD_FULL');
    });

    describe('Wall Collisions (US-04)', () => {
      it('detects right wall collision (x >= BOARD_WIDTH), sets GAME_OVER with gameOverReason = WALL, and freezes snake in bounds', () => {
        const state: GameState = {
          status: 'RUNNING',
          score: 300,
          snake: [{ x: 270, y: 60 }],
          direction: 'RIGHT',
          nextDirection: 'RIGHT',
          apple: { x: 0, y: 0 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });

        expect(nextState.status).toBe('GAME_OVER');
        expect(nextState.gameOverReason).toBe('WALL');
        expect(nextState.snake).toEqual([{ x: 270, y: 60 }]);
        expect(nextState.score).toBe(300);
      });

      it('detects left wall collision (x < 0), sets GAME_OVER with gameOverReason = WALL, and freezes snake in bounds', () => {
        const state: GameState = {
          status: 'RUNNING',
          score: 100,
          snake: [{ x: 0, y: 60 }],
          direction: 'UP',
          nextDirection: 'LEFT',
          apple: { x: 90, y: 90 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });

        expect(nextState.status).toBe('GAME_OVER');
        expect(nextState.gameOverReason).toBe('WALL');
        expect(nextState.direction).toBe('LEFT');
        expect(nextState.snake).toEqual([{ x: 0, y: 60 }]);
      });

      it('detects top wall collision (y < 0), sets GAME_OVER with gameOverReason = WALL, and freezes snake in bounds', () => {
        const state: GameState = {
          status: 'RUNNING',
          score: 100,
          snake: [{ x: 60, y: 0 }],
          direction: 'RIGHT',
          nextDirection: 'UP',
          apple: { x: 90, y: 90 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });

        expect(nextState.status).toBe('GAME_OVER');
        expect(nextState.gameOverReason).toBe('WALL');
        expect(nextState.direction).toBe('UP');
        expect(nextState.snake).toEqual([{ x: 60, y: 0 }]);
      });

      it('detects bottom wall collision (y >= BOARD_HEIGHT), sets GAME_OVER with gameOverReason = WALL, and freezes snake in bounds', () => {
        const state: GameState = {
          status: 'RUNNING',
          score: 100,
          snake: [{ x: 60, y: 270 }],
          direction: 'RIGHT',
          nextDirection: 'DOWN',
          apple: { x: 90, y: 0 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });

        expect(nextState.status).toBe('GAME_OVER');
        expect(nextState.gameOverReason).toBe('WALL');
        expect(nextState.direction).toBe('DOWN');
        expect(nextState.snake).toEqual([{ x: 60, y: 270 }]);
      });
    });

    describe('Self-Collision & Tail-Vacating Rule (US-04)', () => {
      it('detects self-collision with body segment, sets GAME_OVER with gameOverReason = SELF, and freezes snake/score', () => {
        const snake5: Position[] = [
          { x: 60, y: 60 },
          { x: 90, y: 60 },
          { x: 90, y: 30 },
          { x: 60, y: 30 },
          { x: 30, y: 30 },
        ];
        const state: GameState = {
          status: 'RUNNING',
          score: 400,
          snake: snake5,
          direction: 'LEFT',
          nextDirection: 'UP', // Moves from {60, 60} into {60, 30}
          apple: { x: 0, y: 120 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });

        expect(nextState.status).toBe('GAME_OVER');
        expect(nextState.gameOverReason).toBe('SELF');
        expect(nextState.snake).toEqual(snake5);
        expect(nextState.score).toBe(400);
        expect(nextState.direction).toBe('UP');
      });

      it('allows moving into the vacating tail cell on a non-eating tick without triggering self-collision', () => {
        // 4-segment snake in a 2x2 loop chasing its tail at {30, 60}
        const snake4: Position[] = [
          { x: 30, y: 30 },
          { x: 60, y: 30 },
          { x: 60, y: 60 },
          { x: 30, y: 60 },
        ];
        const state: GameState = {
          status: 'RUNNING',
          score: 300,
          snake: snake4,
          direction: 'LEFT',
          nextDirection: 'DOWN', // Moves from {30, 30} into vacating tail {30, 60}
          apple: { x: 120, y: 120 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });

        expect(nextState.status).toBe('RUNNING');
        expect(nextState.gameOverReason).toBeNull();
        expect(nextState.snake).toEqual([
          { x: 30, y: 60 },
          { x: 30, y: 30 },
          { x: 60, y: 30 },
          { x: 60, y: 60 },
        ]);
      });

      it('checks full snake body when ateApple is true (defensive branch coverage)', () => {
        // Synthetic state where an apple is on the tail cell to exercise the ateApple ? state.snake branch
        const snake4: Position[] = [
          { x: 30, y: 30 },
          { x: 60, y: 30 },
          { x: 60, y: 60 },
          { x: 30, y: 60 },
        ];
        const state: GameState = {
          status: 'RUNNING',
          score: 300,
          snake: snake4,
          direction: 'LEFT',
          nextDirection: 'DOWN',
          apple: { x: 30, y: 60 },
          gameOverReason: null,
        };

        const nextState = gameStateReducer(state, { type: 'TICK' });
        expect(nextState.status).toBe('GAME_OVER');
        expect(nextState.gameOverReason).toBe('SELF');
      });
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
