import {
  DomainValidationError,
  MAX_LEADERBOARD_SIZE,
  MAX_PLAYER_NAME_LENGTH,
  MAX_SCORE,
  MIN_PLAYER_NAME_LENGTH,
  SCORE_STEP,
  Score,
} from '../Score';

describe('Score Domain Entity', () => {
  it('exports expected domain constants', () => {
    expect(MIN_PLAYER_NAME_LENGTH).toBe(1);
    expect(MAX_PLAYER_NAME_LENGTH).toBe(30);
    expect(SCORE_STEP).toBe(100);
    expect(MAX_SCORE).toBe(2_147_483_600);
    expect(MAX_LEADERBOARD_SIZE).toBe(5);
  });

  it('instantiates a valid Score and trims playerName whitespace', () => {
    const customDate = new Date('2026-11-01T12:00:00.000Z');
    const scoreEntity = new Score({
      id: '11111111-1111-4111-8111-111111111111',
      playerName: '  Alice  ',
      score: 300,
      createdAt: customDate,
    });

    expect(scoreEntity.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(scoreEntity.playerName).toBe('Alice');
    expect(scoreEntity.score).toBe(300);
    expect(scoreEntity.createdAt).toBe(customDate);
  });

  it('defaults createdAt to current Date when omitted', () => {
    const before = Date.now();
    const scoreEntity = new Score({ playerName: 'Bob', score: 100 });
    const after = Date.now();

    expect(scoreEntity.id).toBeUndefined();
    expect(scoreEntity.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(scoreEntity.createdAt.getTime()).toBeLessThanOrEqual(after);
  });

  describe('playerName validation', () => {
    it('throws DomainValidationError when playerName is empty or whitespace-only', () => {
      expect(() => new Score({ playerName: '', score: 100 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: '    ', score: 100 })).toThrow(
        DomainValidationError
      );
    });

    it('throws DomainValidationError when playerName is not a string', () => {
      expect(
        () =>
          new Score({
            playerName: null as unknown as string,
            score: 100,
          })
      ).toThrow(DomainValidationError);
    });

    it('throws DomainValidationError when trimmed playerName exceeds 30 characters or contains control characters', () => {
      const name31 = 'A'.repeat(31);
      expect(() => new Score({ playerName: name31, score: 100 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice\u0000Bob', score: 100 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice\nBob', score: 100 })).toThrow(
        DomainValidationError
      );
    });

    it('accepts a trimmed playerName of exactly 1 and 30 characters', () => {
      expect(new Score({ playerName: 'A', score: 100 }).playerName).toBe('A');
      const name30 = 'B'.repeat(30);
      expect(new Score({ playerName: `  ${name30}  `, score: 100 }).playerName).toBe(
        name30
      );
    });
  });

  describe('score validation', () => {
    it('throws DomainValidationError when score is 0 or negative', () => {
      expect(() => new Score({ playerName: 'Alice', score: 0 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice', score: -100 })).toThrow(
        DomainValidationError
      );
    });

    it('throws DomainValidationError when score is not a multiple of 100', () => {
      expect(() => new Score({ playerName: 'Alice', score: 50 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice', score: 150 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice', score: 299 })).toThrow(
        DomainValidationError
      );
    });

    it('throws DomainValidationError when score is non-integer, exceeds 32-bit INT4 max, or is non-number', () => {
      expect(() => new Score({ playerName: 'Alice', score: 100.5 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice', score: 3_000_000_000 })).toThrow(
        DomainValidationError
      );
      expect(() => new Score({ playerName: 'Alice', score: NaN })).toThrow(
        DomainValidationError
      );
      expect(
        () =>
          new Score({
            playerName: 'Alice',
            score: '100' as unknown as number,
          })
      ).toThrow(DomainValidationError);
    });
  });
});

