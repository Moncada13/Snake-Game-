import {
  isScoreEligibleForTopFive,
  MAX_LEADERBOARD_SLOTS,
  MAX_PLAYER_NAME_LEN,
  MIN_QUALIFYING_SCORE,
  validatePlayerName,
} from './leaderboardUtils';
import { ScoreItem } from '../services/scoreService';

describe('leaderboardUtils', () => {
  const makeScores = (scores: number[]): ScoreItem[] =>
    scores.map((score, idx) => ({
      id: `id-${idx + 1}`,
      rank: idx + 1,
      playerName: `Player${idx + 1}`,
      score,
      createdAt: '2026-11-01T12:00:00.000Z',
    }));

  it('exports expected leaderboard constants', () => {
    expect(MAX_LEADERBOARD_SLOTS).toBe(5);
    expect(MAX_PLAYER_NAME_LEN).toBe(30);
    expect(MIN_QUALIFYING_SCORE).toBe(100);
  });

  describe('isScoreEligibleForTopFive', () => {
    it('returns false when score is 0, negative, non-integer, or not a multiple of 100', () => {
      const emptyBoard: ScoreItem[] = [];
      expect(isScoreEligibleForTopFive(0, emptyBoard)).toBe(false);
      expect(isScoreEligibleForTopFive(-100, emptyBoard)).toBe(false);
      expect(isScoreEligibleForTopFive(50, emptyBoard)).toBe(false);
      expect(isScoreEligibleForTopFive(150, emptyBoard)).toBe(false);
      expect(isScoreEligibleForTopFive(100.5, emptyBoard)).toBe(false);
      expect(isScoreEligibleForTopFive(NaN, emptyBoard)).toBe(false);
    });

    it('returns true for any valid score (>= 100, multiple of 100) when leaderboard has fewer than 5 items', () => {
      expect(isScoreEligibleForTopFive(100, [])).toBe(true);
      expect(
        isScoreEligibleForTopFive(100, makeScores([900, 800, 700, 600]))
      ).toBe(true);
    });

    it('returns true only when score is strictly greater than the 5th-place score when 5 items exist', () => {
      const fullBoard = makeScores([1000, 800, 600, 400, 200]);
      expect(isScoreEligibleForTopFive(300, fullBoard)).toBe(true);
      expect(isScoreEligibleForTopFive(200, fullBoard)).toBe(false);
      expect(isScoreEligibleForTopFive(100, fullBoard)).toBe(false);
    });
  });

  describe('validatePlayerName', () => {
    it('accepts valid names between 1 and 30 characters and returns trimmed name', () => {
      expect(validatePlayerName('  Maria  ')).toEqual({
        valid: true,
        trimmedName: 'Maria',
        error: null,
      });
      expect(validatePlayerName('A'.repeat(30))).toEqual({
        valid: true,
        trimmedName: 'A'.repeat(30),
        error: null,
      });
    });

    it('rejects empty or whitespace-only names', () => {
      expect(validatePlayerName('')).toEqual({
        valid: false,
        trimmedName: '',
        error: 'Please enter a player name (1–30 characters).',
      });
      expect(validatePlayerName('   ')).toEqual({
        valid: false,
        trimmedName: '',
        error: 'Please enter a player name (1–30 characters).',
      });
    });

    it('rejects names exceeding 30 characters after trimming', () => {
      const res = validatePlayerName('B'.repeat(31));
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Player name must be at most 30 characters.');
    });

    it('rejects names containing HTML angle brackets (< or >) or control characters', () => {
      const xssRes = validatePlayerName('<script>');
      expect(xssRes.valid).toBe(false);
      expect(xssRes.error).toBe(
        'Player name cannot contain < or > characters.'
      );

      const ctrlRes = validatePlayerName('Alice\u0000Bob');
      expect(ctrlRes.valid).toBe(false);
      expect(ctrlRes.error).toBe(
        'Player name cannot contain < or > characters.'
      );
    });
  });
});

