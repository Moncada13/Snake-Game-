import {
  MAX_PLAYER_NAME_LENGTH,
  MIN_PLAYER_NAME_LENGTH,
  SCORE_STEP,
} from '../domain/models/Score';
import { CreateScoreRequestDTO } from './dtos/scoreDtos';

export const MIN_API_SCORE = SCORE_STEP;
export const MAX_API_SCORE = 100000;

const UNSAFE_NAME_CHARS_REGEX = /[<>]|[\u0000-\u001F\u007F]/;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: CreateScoreRequestDTO;
}

export const validateCreateScorePayload = (
  body: unknown
): ValidationResult => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      valid: false,
      errors: ['Request body must be a valid JSON object'],
    };
  }

  const record = body as Record<string, unknown>;
  const errors: string[] = [];

  const rawName = record.playerName;
  let trimmedName = '';

  if (typeof rawName !== 'string') {
    errors.push(
      `playerName must be a non-empty string between ${MIN_PLAYER_NAME_LENGTH} and ${MAX_PLAYER_NAME_LENGTH} characters`
    );
  } else {
    trimmedName = rawName.trim();
    if (
      trimmedName.length < MIN_PLAYER_NAME_LENGTH ||
      trimmedName.length > MAX_PLAYER_NAME_LENGTH
    ) {
      errors.push(
        `playerName must be a non-empty string between ${MIN_PLAYER_NAME_LENGTH} and ${MAX_PLAYER_NAME_LENGTH} characters`
      );
    } else if (UNSAFE_NAME_CHARS_REGEX.test(trimmedName)) {
      errors.push(
        'playerName must not contain HTML angle brackets (< or >) or control characters'
      );
    }
  }

  const rawScore = record.score;
  if (
    typeof rawScore !== 'number' ||
    !Number.isInteger(rawScore) ||
    rawScore < MIN_API_SCORE ||
    rawScore > MAX_API_SCORE ||
    rawScore % SCORE_STEP !== 0
  ) {
    errors.push(
      `score must be a positive integer multiple of ${SCORE_STEP} between ${MIN_API_SCORE} and ${MAX_API_SCORE}`
    );
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    errors: [],
    sanitized: {
      playerName: trimmedName,
      score: rawScore as number,
    },
  };
};

