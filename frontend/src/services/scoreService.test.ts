import {
  getApiBaseUrl,
  getTopScores,
  ScoreItem,
  submitScore,
} from './scoreService';

describe('scoreService', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.REACT_APP_API_URL;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalEnv === undefined) {
      delete process.env.REACT_APP_API_URL;
    } else {
      process.env.REACT_APP_API_URL = originalEnv;
    }
    jest.restoreAllMocks();
  });

  describe('getApiBaseUrl', () => {
    it('returns REACT_APP_API_URL when configured or defaults to http://localhost:3010', () => {
      delete process.env.REACT_APP_API_URL;
      expect(getApiBaseUrl()).toBe('http://localhost:3010');

      process.env.REACT_APP_API_URL = 'http://localhost:4000/';
      expect(getApiBaseUrl()).toBe('http://localhost:4000');
    });
  });

  describe('getTopScores', () => {
    it('returns empty array when global.fetch is unavailable', async () => {
      // @ts-expect-error testing missing fetch environment
      global.fetch = undefined;
      const result = await getTopScores();
      expect(result).toEqual([]);
    });

    it('fetches and returns data array on 200 OK', async () => {
      const mockItems: ScoreItem[] = [
        {
          id: '1',
          rank: 1,
          playerName: 'Alice',
          score: 900,
          createdAt: '2026-11-01T15:00:00.000Z',
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: mockItems }),
      } as Response);

      const scores = await getTopScores();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/scores',
        expect.objectContaining({ method: 'GET' })
      );
      expect(scores).toEqual(mockItems);
    });

    it('returns empty array if response JSON has non-array data', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      const scores = await getTopScores();
      expect(scores).toEqual([]);
    });

    it('throws error when response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      } as Response);

      await expect(getTopScores()).rejects.toThrow(
        'Unable to load leaderboard'
      );
    });
  });

  describe('submitScore', () => {
    it('throws error when global.fetch is unavailable', async () => {
      // @ts-expect-error testing missing fetch environment
      global.fetch = undefined;
      await expect(submitScore('Maria', 300)).rejects.toThrow(
        'Network client unavailable'
      );
    });

    it('posts score and returns SubmitScoreResponse on 201 Created or 200 OK', async () => {
      const mockResponse = {
        saved: true,
        rank: 1,
        entry: {
          id: '10',
          rank: 1,
          playerName: 'Maria',
          score: 300,
          createdAt: '2026-11-01T16:00:00.000Z',
        },
        leaderboard: [
          {
            id: '10',
            rank: 1,
            playerName: 'Maria',
            score: 300,
            createdAt: '2026-11-01T16:00:00.000Z',
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

      const result = await submitScore('Maria', 300);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/scores',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName: 'Maria', score: 300 }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws detailed error message on 400 or 500 responses', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'ValidationError',
          message: 'Invalid score submission payload',
          details: ['playerName is invalid'],
        }),
      } as Response);

      await expect(submitScore('', 300)).rejects.toThrow(
        'playerName is invalid'
      );

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'InternalServerError',
          message: 'Database offline',
        }),
      } as Response);

      await expect(submitScore('Maria', 300)).rejects.toThrow(
        'Database offline'
      );

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('non-json error');
        },
      } as unknown as Response);

      await expect(submitScore('Maria', 300)).rejects.toThrow(
        'Failed to submit score'
      );
    });

    it('normalizes partial or malformed 200 OK payloads safely', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ saved: false }),
      } as Response);

      const result = await submitScore('Maria', 300);
      expect(result).toEqual({
        saved: false,
        rank: null,
        entry: null,
        message: undefined,
        leaderboard: [],
      });
    });
  });
});

