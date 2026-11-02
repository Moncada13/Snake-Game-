import { ScoreItem } from '../services/scoreService';
import { POINTS_PER_APPLE } from './constants';

export const MAX_LEADERBOARD_SLOTS = 5;
export const MAX_PLAYER_NAME_LEN = 30;
export const MIN_QUALIFYING_SCORE = POINTS_PER_APPLE;

const UNSAFE_CHARS_REGEX = /[<>]|[\u0000-\u001F\u007F]/;

export interface PlayerNameValidation {
  valid: boolean;
  trimmedName: string;
  error: string | null;
}

export const isScoreEligibleForTopFive = (
  score: number,
  leaderboard: ScoreItem[]
): boolean => {
  if (
    typeof score !== 'number' ||
    !Number.isInteger(score) ||
    score < MIN_QUALIFYING_SCORE ||
    score % POINTS_PER_APPLE !== 0
  ) {
    return false;
  }

  if (leaderboard.length < MAX_LEADERBOARD_SLOTS) {
    return true;
  }

  const fifthPlace = leaderboard[MAX_LEADERBOARD_SLOTS - 1];
  return score > fifthPlace.score;
};

export const validatePlayerName = (rawName: string): PlayerNameValidation => {
  const trimmedName = rawName.trim();

  if (trimmedName.length === 0) {
    return {
      valid: false,
      trimmedName: '',
      error: 'Please enter a player name (1–30 characters).',
    };
  }

  if (trimmedName.length > MAX_PLAYER_NAME_LEN) {
    return {
      valid: false,
      trimmedName,
      error: 'Player name must be at most 30 characters.',
    };
  }

  if (UNSAFE_CHARS_REGEX.test(trimmedName)) {
    return {
      valid: false,
      trimmedName,
      error: 'Player name cannot contain < or > characters.',
    };
  }

  return {
    valid: true,
    trimmedName,
    error: null,
  };
};

