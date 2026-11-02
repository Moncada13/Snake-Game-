export type GameStatus = 'IDLE' | 'RUNNING' | 'GAME_OVER';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameOverReason = 'WALL' | 'SELF' | 'BOARD_FULL' | null;

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  apple: Position | null;
  gameOverReason: GameOverReason;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'GAME_OVER' }
  | { type: 'TICK' }
  | { type: 'CHANGE_DIRECTION'; payload: Direction };
