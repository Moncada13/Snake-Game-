import {
  MAX_API_SCORE,
  MIN_API_SCORE,
  validateCreateScorePayload,
} from '../validator';

describe('validateCreateScorePayload', () => {
  it('exports expected API score constants', () => {
    expect(MIN_API_SCORE).toBe(100);
    expect(MAX_API_SCORE).toBe(100000);
  });

  it('validates a well-formed payload and trims playerName', () => {
    const result = validateCreateScorePayload({
      playerName: '  Elena  ',
      score: 700,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.sanitized).toEqual({
      playerName: 'Elena',
      score: 700,
    });
  });

  it('rejects null, undefined, primitive, or array payloads', () => {
    for (const invalidBody of [null, undefined, 'string', 123, []]) {
      const result = validateCreateScorePayload(invalidBody);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Request body must be a valid JSON object'
      );
      expect(result.sanitized).toBeUndefined();
    }
  });

  describe('playerName validation rules', () => {
    it('rejects missing, non-string, empty, or whitespace-only playerName', () => {
      expect(validateCreateScorePayload({ score: 100 }).valid).toBe(false);
      expect(
        validateCreateScorePayload({ playerName: 123, score: 100 }).errors
      ).toContain(
        'playerName must be a non-empty string between 1 and 30 characters'
      );
      expect(
        validateCreateScorePayload({ playerName: '   ', score: 100 }).errors
      ).toContain(
        'playerName must be a non-empty string between 1 and 30 characters'
      );
    });

    it('rejects playerName longer than 30 characters after trimming', () => {
      const result = validateCreateScorePayload({
        playerName: 'A'.repeat(31),
        score: 200,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'playerName must be a non-empty string between 1 and 30 characters'
      );
    });

    it('rejects playerName containing HTML angle brackets (< or >) or control characters', () => {
      const xssResult = validateCreateScorePayload({
        playerName: '<script>alert(1)</script>',
        score: 200,
      });
      expect(xssResult.valid).toBe(false);
      expect(xssResult.errors).toContain(
        'playerName must not contain HTML angle brackets (< or >) or control characters'
      );

      const controlCharResult = validateCreateScorePayload({
        playerName: 'Alice\u0000Bob',
        score: 200,
      });
      expect(controlCharResult.valid).toBe(false);
      expect(controlCharResult.errors).toContain(
        'playerName must not contain HTML angle brackets (< or >) or control characters'
      );
    });
  });

  describe('score validation rules', () => {
    it('rejects non-integer, zero, negative, non-multiple of 100, or > 100000 scores', () => {
      for (const badScore of [
        undefined,
        '100',
        0,
        -100,
        50,
        250,
        100.5,
        100100,
        NaN,
      ]) {
        const result = validateCreateScorePayload({
          playerName: 'Elena',
          score: badScore,
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          'score must be a positive integer multiple of 100 between 100 and 100000'
        );
      }
    });

    it('collects multiple errors when both playerName and score are invalid', () => {
      const result = validateCreateScorePayload({
        playerName: '',
        score: 250,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});

