export const MAX_PLAYER_NAME_LENGTH = 30;
export const MIN_PLAYER_NAME_LENGTH = 1;
export const SCORE_STEP = 100;
export const MAX_SCORE = 2_147_483_600;
export const MAX_LEADERBOARD_SIZE = 5;

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/;

export class DomainValidationError extends Error {
  public readonly code = 'DOMAIN_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export interface ScoreProps {
  id?: string;
  playerName: string;
  score: number;
  createdAt?: Date;
}

export interface RankedScore {
  id: string;
  playerName: string;
  score: number;
  createdAt: Date;
  rank: number;
}

export interface SaveScoreResult {
  saved: boolean;
  rank: number | null;
  entry: RankedScore | null;
  leaderboard: RankedScore[];
}

export class Score {
  public readonly id?: string;
  public readonly playerName: string;
  public readonly score: number;
  public readonly createdAt: Date;

  constructor(props: ScoreProps) {
    const trimmedName =
      typeof props.playerName === 'string' ? props.playerName.trim() : '';

    if (
      trimmedName.length < MIN_PLAYER_NAME_LENGTH ||
      trimmedName.length > MAX_PLAYER_NAME_LENGTH ||
      CONTROL_CHAR_REGEX.test(trimmedName)
    ) {
      throw new DomainValidationError(
        `Player name must be between ${MIN_PLAYER_NAME_LENGTH} and ${MAX_PLAYER_NAME_LENGTH} printable characters after trimming.`
      );
    }

    if (
      typeof props.score !== 'number' ||
      !Number.isInteger(props.score) ||
      props.score < SCORE_STEP ||
      props.score > MAX_SCORE ||
      props.score % SCORE_STEP !== 0
    ) {
      throw new DomainValidationError(
        `Score must be a positive integer multiple of ${SCORE_STEP} (between ${SCORE_STEP} and ${MAX_SCORE}).`
      );
    }

    this.id = props.id;
    this.playerName = trimmedName;
    this.score = props.score;
    this.createdAt = props.createdAt ?? new Date();
  }
}

