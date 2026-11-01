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
    });
  });

  describe('START action', () => {
    it('transitions status from IDLE to RUNNING', () => {
      const state: GameState = { status: 'IDLE', score: 0 };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'RUNNING', score: 0 });
    });

    it('is a no-op when already RUNNING', () => {
      const state: GameState = { status: 'RUNNING', score: 200 };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'RUNNING', score: 200 });
    });

    it('does not allow START directly from GAME_OVER (must RESET first)', () => {
      const state: GameState = { status: 'GAME_OVER', score: 300 };
      const action: GameAction = { type: 'START' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'GAME_OVER', score: 300 });
    });
  });

  describe('RESET action', () => {
    it('resets score and transitions status to IDLE when called during RUNNING', () => {
      const state: GameState = { status: 'RUNNING', score: 500 };
      const action: GameAction = { type: 'RESET' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'IDLE', score: 0 });
    });

    it('resets score and transitions status to IDLE when called during GAME_OVER', () => {
      const state: GameState = { status: 'GAME_OVER', score: 500 };
      const action: GameAction = { type: 'RESET' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'IDLE', score: 0 });
    });

    it('is a no-op when already in IDLE with score 0', () => {
      const state: GameState = { status: 'IDLE', score: 0 };
      const action: GameAction = { type: 'RESET' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'IDLE', score: 0 });
    });
  });

  describe('GAME_OVER action', () => {
    it('transitions status from RUNNING to GAME_OVER and preserves current score', () => {
      const state: GameState = { status: 'RUNNING', score: 800 };
      const action: GameAction = { type: 'GAME_OVER' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'GAME_OVER', score: 800 });
    });

    it('is a no-op if dispatched when IDLE', () => {
      const state: GameState = { status: 'IDLE', score: 0 };
      const action: GameAction = { type: 'GAME_OVER' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'IDLE', score: 0 });
    });

    it('is a no-op if already in GAME_OVER', () => {
      const state: GameState = { status: 'GAME_OVER', score: 800 };
      const action: GameAction = { type: 'GAME_OVER' };
      const nextState = gameStateReducer(state, action);
      expect(nextState).toEqual({ status: 'GAME_OVER', score: 800 });
    });
  });

  describe('Default state parameter', () => {
    it('uses INITIAL_GAME_STATE if state is undefined', () => {
      const nextState = gameStateReducer(undefined, { type: 'START' });
      expect(nextState).toEqual({ status: 'RUNNING', score: 0 });
    });
  });

  describe('Unknown / unhandled action', () => {
    it('returns the same state reference for unknown action types', () => {
      const state: GameState = { status: 'IDLE', score: 0 };
      const nextState = gameStateReducer(state, { type: 'NON_EXISTENT' } as unknown as GameAction);
      expect(nextState).toBe(state);
    });
  });
});
