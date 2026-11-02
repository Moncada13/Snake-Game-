import request from 'supertest';
import { createApp } from '../../../app';
import { ScoreService } from '../../../application/services/scoreService';
import { logger } from '../../../infrastructure/logger';
import {
  InMemoryPrismaClient,
  resetPrismaClientSingleton,
} from '../../../infrastructure/prismaClient';
import { PrismaScoreRepository } from '../../../infrastructure/repositories/PrismaScoreRepository';
import { ScoreController } from '../scoreController';

describe('ScoreController & /api/scores HTTP Integration', () => {
  let db: InMemoryPrismaClient;
  let repository: PrismaScoreRepository;
  let scoreService: ScoreService;
  let errorLogSpy: jest.SpyInstance;

  beforeEach(() => {
    resetPrismaClientSingleton();
    db = new InMemoryPrismaClient();
    repository = new PrismaScoreRepository(db);
    scoreService = new ScoreService(repository);
    errorLogSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorLogSpy.mockRestore();
    delete process.env.USE_IN_MEMORY_DB;
    resetPrismaClientSingleton();
  });

  describe('Default instantiation & logger', () => {
    it('supports default ScoreController and createApp instantiation and logger methods', () => {
      process.env.USE_IN_MEMORY_DB = 'true';
      const defaultController = new ScoreController();
      expect(defaultController).toBeInstanceOf(ScoreController);
      const defaultApp = createApp();
      expect(defaultApp).toBeDefined();

      const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      errorLogSpy.mockRestore();

      logger.info('Test info log', { port: 3010 });
      logger.info('Test info log without meta');
      logger.error('Test error log', new Error('Boom'));
      logger.error('Test error log with primitive', 'raw-error');
      logger.error('Test error log without error arg');

      expect(infoSpy).toHaveBeenCalledTimes(2);
      expect(errSpy).toHaveBeenCalledTimes(3);

      infoSpy.mockRestore();
      errSpy.mockRestore();
    });
  });

  describe('GET /api/scores', () => {
    it('Scenario 1: returns 200 OK with empty data array initially and ordered Top 5 scores when populated', async () => {
      const app = createApp(scoreService);

      const emptyRes = await request(app).get('/api/scores');
      expect(emptyRes.status).toBe(200);
      expect(emptyRes.body).toEqual({ data: [] });

      await repository.saveIfTopFive('Alice', 900);
      await repository.saveIfTopFive('Bob', 600);

      const populatedRes = await request(app).get('/api/scores');
      expect(populatedRes.status).toBe(200);
      expect(populatedRes.body.data).toHaveLength(2);
      expect(populatedRes.body.data[0]).toMatchObject({
        rank: 1,
        playerName: 'Alice',
        score: 900,
      });
      expect(populatedRes.body.data[1]).toMatchObject({
        rank: 2,
        playerName: 'Bob',
        score: 600,
      });
    });

    it('returns 500 Internal Server Error without stack trace when service throws', async () => {
      const failingService = {
        getTopScores: jest.fn().mockRejectedValue(new Error('DB down')),
        submitScore: jest.fn(),
      } as unknown as ScoreService;

      const app = createApp(failingService);
      const res = await request(app).get('/api/scores');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while processing the score',
      });
      expect(errorLogSpy).toHaveBeenCalled();
    });
  });

  describe('POST /api/scores', () => {
    it('Scenario 2: returns 201 Created when score qualifies for Top 5', async () => {
      const app = createApp(scoreService);

      const res = await request(app)
        .post('/api/scores')
        .send({ playerName: '  Elena  ', score: 700 });

      expect(res.status).toBe(201);
      expect(res.body.saved).toBe(true);
      expect(res.body.rank).toBe(1);
      expect(res.body.entry).toMatchObject({
        rank: 1,
        playerName: 'Elena',
        score: 700,
      });
      expect(res.body.leaderboard).toHaveLength(1);
    });

    it('Scenario 3: returns 200 OK with saved: false when score does not qualify for Top 5', async () => {
      await repository.saveIfTopFive('P1', 900);
      await repository.saveIfTopFive('P2', 800);
      await repository.saveIfTopFive('P3', 700);
      await repository.saveIfTopFive('P4', 600);
      await repository.saveIfTopFive('P5', 500);

      const app = createApp(scoreService);

      const res = await request(app)
        .post('/api/scores')
        .send({ playerName: 'Elena', score: 300 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        saved: false,
        rank: null,
        entry: null,
        message: 'Score does not qualify for Top 5',
      });
      expect(res.body.leaderboard).toHaveLength(5);
      expect(res.body.leaderboard.map((item: { score: number }) => item.score)).toEqual([
        900, 800, 700, 600, 500,
      ]);
    });

    it('Scenario 4: returns 400 Bad Request on invalid payloads without invoking service', async () => {
      const submitSpy = jest.spyOn(scoreService, 'submitScore');
      const app = createApp(scoreService);

      for (const invalidPayload of [
        { playerName: '', score: 500 },
        { playerName: 'A'.repeat(31), score: 500 },
        { playerName: '<script>alert(1)</script>', score: 500 },
        { playerName: 'Elena', score: 0 },
        { playerName: 'Elena', score: -100 },
        { playerName: 'Elena', score: 250 },
        { playerName: 'Elena', score: 100100 },
      ]) {
        const res = await request(app)
          .post('/api/scores')
          .send(invalidPayload);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('ValidationError');
        expect(res.body.message).toBe('Invalid score submission payload');
        expect(Array.isArray(res.body.details)).toBe(true);
        expect(res.body.details.length).toBeGreaterThan(0);
      }

      expect(submitSpy).not.toHaveBeenCalled();

      const malformedRes = await request(app)
        .post('/api/scores')
        .set('Content-Type', 'application/json')
        .send('{bad json');
      expect(malformedRes.status).toBe(400);
      expect(malformedRes.headers['x-powered-by']).toBeUndefined();
      expect(malformedRes.body).toEqual({
        error: 'ValidationError',
        message: 'Invalid score submission payload',
        details: ['Malformed JSON in request body'],
      });

      const oversizedRes = await request(app)
        .post('/api/scores')
        .send({ playerName: 'A'.repeat(12000), score: 500 });
      expect(oversizedRes.status).toBe(400);
      expect(oversizedRes.body).toEqual({
        error: 'ValidationError',
        message: 'Invalid score submission payload',
        details: ['Request payload exceeds 10kb limit'],
      });
    });

    it('handles unexpected non-JSON middleware errors via global error handler without stack trace leakage', async () => {
      const mainApp = createApp(scoreService);
      const res = await request(mainApp)
        .post('/api/scores')
        .set('Content-Encoding', 'invalid-encoding')
        .set('Content-Type', 'application/json')
        .send('{"playerName":"Elena","score":100}');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while processing the score',
      });
    });

    it('returns 500 Internal Server Error when submitScore throws an unexpected error', async () => {
      const failingService = {
        getTopScores: jest.fn(),
        submitScore: jest.fn().mockRejectedValue(new Error('Unexpected DB failure')),
      } as unknown as ScoreService;

      const app = createApp(failingService);
      const res = await request(app)
        .post('/api/scores')
        .send({ playerName: 'Elena', score: 700 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'InternalServerError',
        message: 'An unexpected error occurred while processing the score',
      });
      expect(errorLogSpy).toHaveBeenCalled();
    });
  });
});
