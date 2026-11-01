export type GameStatus = 'IDLE' | 'RUNNING' | 'GAME_OVER';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'GAME_OVER' };

