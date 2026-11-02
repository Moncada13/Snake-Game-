import { DomainValidationError } from '../../../domain/models/Score';
import {
  getPrismaClient,
  InMemoryPrismaClient,
  PrismaClientLike,
  resetPrismaClientSingleton,
  ScoreRow,
} from '../../prismaClient';
import { PrismaScoreRepository } from '../PrismaScoreRepository';

describe('PrismaScoreRepository & Transactional Top-5 Persistence', () => {
  let db: InMemoryPrismaClient;
  let repository: PrismaScoreRepository;

  beforeEach(() => {
    resetPrismaClientSingleton();
    db = new InMemoryPrismaClient();
    repository = new PrismaScoreRepository(db);
  });

  afterEach(() => {
    delete process.env.USE_IN_MEMORY_DB;
    resetPrismaClientSingleton();
  });

  describe('getTopScores', () => {
    it('returns an empty array when no scores exist', async () => {
      const topScores = await repository.getTopScores();
      expect(topScores).toEqual([]);
    });

    it('orders scores by score DESC, createdAt ASC (earlier wins ties), and id ASC', async () => {
      const t1 = new Date('2026-11-01T10:00:00.000Z');
      const t2 = new Date('2026-11-01T11:00:00.000Z');
      const seededRows: ScoreRow[] = [
        { id: 'id-b', playerName: 'LaterTie', score: 500, createdAt: t2 },
        { id: 'id-a', playerName: 'EarlierTie', score: 500, createdAt: t1 },
        { id: 'id-d', playerName: 'SameTimeB', score: 300, createdAt: t1 },
        { id: 'id-c', playerName: 'SameTimeA', score: 300, createdAt: t1 },
        { id: 'id-top', playerName: 'Champion', score: 900, createdAt: t2 },
      ];
      db = new InMemoryPrismaClient(seededRows);
      repository = new PrismaScoreRepository(db);

      const top = await repository.getTopScores();

      expect(top.map((r) => ({ name: r.playerName, score: r.score, rank: r.rank }))).toEqual([
        { name: 'Champion', score: 900, rank: 1 },
        { name: 'EarlierTie', score: 500, rank: 2 },
        { name: 'LaterTie', score: 500, rank: 3 },
        { name: 'SameTimeA', score: 300, rank: 4 },
        { name: 'SameTimeB', score: 300, rank: 5 },
      ]);
    });
  });

  describe('saveIfTopFive', () => {
    it('Scenario 1: inserts score when table has fewer than 5 rows and assigns accurate rank', async () => {
      const t0 = new Date('2026-11-01T10:00:00.000Z');
      db = new InMemoryPrismaClient([
        { id: '1', playerName: 'P1', score: 900, createdAt: t0 },
        { id: '2', playerName: 'P2', score: 700, createdAt: t0 },
        { id: '3', playerName: 'P3', score: 500, createdAt: t0 },
      ]);
      repository = new PrismaScoreRepository(db);

      const result = await repository.saveIfTopFive('  Alice  ', 600);

      expect(result.saved).toBe(true);
      expect(result.rank).toBe(3);
      expect(result.entry).not.toBeNull();
      expect(result.entry?.playerName).toBe('Alice');
      expect(result.entry?.score).toBe(600);
      expect(result.leaderboard.map((r) => r.score)).toEqual([900, 700, 600, 500]);
      expect(await db.score.count!()).toBe(4);
    });

    it('Scenario 2: inserts qualifying score when table has 5 rows and evicts the 6th row atomically', async () => {
      const t0 = new Date('2026-11-01T10:00:00.000Z');
      db = new InMemoryPrismaClient([
        { id: '1', playerName: 'P1', score: 1000, createdAt: t0 },
        { id: '2', playerName: 'P2', score: 800, createdAt: t0 },
        { id: '3', playerName: 'P3', score: 600, createdAt: t0 },
        { id: '4', playerName: 'P4', score: 400, createdAt: t0 },
        { id: '5', playerName: 'P5', score: 200, createdAt: t0 },
      ]);
      repository = new PrismaScoreRepository(db);

      const result = await repository.saveIfTopFive('Bob', 500);

      expect(result.saved).toBe(true);
      expect(result.rank).toBe(4);
      expect(result.entry?.playerName).toBe('Bob');
      expect(result.leaderboard.map((r) => r.score)).toEqual([1000, 800, 600, 500, 400]);

      // Verify strict Top-5 row limit in persistence store (200 was deleted)
      const remainingRows = await db.score.findMany();
      expect(remainingRows).toHaveLength(5);
      expect(remainingRows.find((r) => r.id === '5')).toBeUndefined();
    });

    it('Scenario 3: rejects score equal to or lower than 5th place without modifying the database', async () => {
      const t0 = new Date('2026-11-01T10:00:00.000Z');
      const initialFive: ScoreRow[] = [
        { id: '1', playerName: 'P1', score: 1000, createdAt: t0 },
        { id: '2', playerName: 'P2', score: 800, createdAt: t0 },
        { id: '3', playerName: 'P3', score: 600, createdAt: t0 },
        { id: '4', playerName: 'P4', score: 400, createdAt: t0 },
        { id: '5', playerName: 'P5', score: 300, createdAt: t0 },
      ];
      db = new InMemoryPrismaClient(initialFive);
      repository = new PrismaScoreRepository(db);

      // Equal to 5th place (300) -> does NOT displace earlier 5th place
      const tieResult = await repository.saveIfTopFive('Charlie', 300);
      expect(tieResult.saved).toBe(false);
      expect(tieResult.rank).toBeNull();
      expect(tieResult.entry).toBeNull();
      expect(tieResult.leaderboard.map((r) => r.score)).toEqual([1000, 800, 600, 400, 300]);

      // Lower than 5th place (100)
      const lowResult = await repository.saveIfTopFive('Charlie', 100);
      expect(lowResult.saved).toBe(false);
      expect(lowResult.rank).toBeNull();
      expect(lowResult.entry).toBeNull();

      // Database state completely untouched
      expect(db.snapshot()).toEqual(initialFive);
    });

    it('Scenario 4: throws DomainValidationError before starting transaction when input is invalid', async () => {
      const txSpy = jest.spyOn(db, '$transaction');

      await expect(repository.saveIfTopFive('', 500)).rejects.toThrow(
        DomainValidationError
      );
      await expect(repository.saveIfTopFive('Alice', 150)).rejects.toThrow(
        DomainValidationError
      );

      expect(txSpy).not.toHaveBeenCalled();
    });

    it('handles defensive case where created entry is not in top 5 after re-query', async () => {
      const customMockClient: PrismaClientLike = {
        score: {
          findMany: jest
            .fn()
            .mockResolvedValueOnce([]) // Initially empty
            .mockResolvedValueOnce([
              { id: 'other-1', playerName: 'P1', score: 900, createdAt: new Date() },
              { id: 'other-2', playerName: 'P2', score: 800, createdAt: new Date() },
              { id: 'other-3', playerName: 'P3', score: 700, createdAt: new Date() },
              { id: 'other-4', playerName: 'P4', score: 600, createdAt: new Date() },
              { id: 'other-5', playerName: 'P5', score: 500, createdAt: new Date() },
            ]),
          create: jest.fn().mockResolvedValue({
            id: 'evicted-id',
            playerName: 'Late',
            score: 100,
            createdAt: new Date(),
          }),
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        $transaction: async (fn) => fn({ score: customMockClient.score }),
      };

      const customRepo = new PrismaScoreRepository(customMockClient);
      const res = await customRepo.saveIfTopFive('Late', 100);
      expect(res.saved).toBe(false);
      expect(res.rank).toBeNull();
      expect(res.entry).toBeNull();
    });

    it('retries transient P2034 serialization conflict and succeeds, or rethrows when retries are exhausted or non-P2034', async () => {
      let txCalls = 0;
      const retryMockClient: PrismaClientLike = {
        score: db.score,
        $transaction: async (fn) => {
          txCalls += 1;
          if (txCalls === 1) {
            const conflictError = Object.assign(
              new Error('Transaction failed due to a write conflict'),
              { code: 'P2034' }
            );
            throw conflictError;
          }
          return db.$transaction(fn);
        },
      };

      const retryRepo = new PrismaScoreRepository(retryMockClient);
      const result = await retryRepo.saveIfTopFive('RetryWinner', 500);
      expect(result.saved).toBe(true);
      expect(txCalls).toBe(2);

      // Exhausted P2034 retries (3 attempts)
      const alwaysConflictClient: PrismaClientLike = {
        score: db.score,
        $transaction: async () => {
          throw Object.assign(new Error('Persistent conflict'), { code: 'P2034' });
        },
      };
      const failingRepo = new PrismaScoreRepository(alwaysConflictClient);
      await expect(failingRepo.saveIfTopFive('FailPlayer', 600)).rejects.toThrow(
        'Persistent conflict'
      );
    });

    it('serializes concurrent saveIfTopFive submissions so table never exceeds 5 rows', async () => {
      await Promise.all([
        repository.saveIfTopFive('C1', 100),
        repository.saveIfTopFive('C2', 200),
        repository.saveIfTopFive('C3', 300),
        repository.saveIfTopFive('C4', 400),
        repository.saveIfTopFive('C5', 500),
        repository.saveIfTopFive('C6', 600),
        repository.saveIfTopFive('C7', 700),
      ]);

      const top = await repository.getTopScores();
      expect(top).toHaveLength(5);
      expect(top.map((r) => r.score)).toEqual([700, 600, 500, 400, 300]);
      expect(await db.score.count!()).toBe(5);
    });
  });

  describe('InMemoryPrismaClient & getPrismaClient helpers', () => {
    it('rolls back changes if an error is thrown inside $transaction and supports full deleteMany', async () => {
      await db.score.create({ data: { playerName: 'Seed', score: 200 } });
      expect(await db.score.count!()).toBe(1);

      await expect(
        db.$transaction(async (tx) => {
          await tx.score.create({ data: { playerName: 'Temp', score: 400 } });
          throw new Error('Simulated transaction failure');
        })
      ).rejects.toThrow('Simulated transaction failure');

      // Rolled back to 1 row
      expect(await db.score.count!()).toBe(1);

      // Full deleteMany without where filter clears all rows
      const deleted = await db.score.deleteMany();
      expect(deleted.count).toBe(1);
      expect(await db.score.count!()).toBe(0);
    });

    it('provides singleton instances for both in-memory fallback and default PrismaClient', () => {
      process.env.USE_IN_MEMORY_DB = 'true';
      const defaultRepo = new PrismaScoreRepository();
      expect(defaultRepo).toBeInstanceOf(PrismaScoreRepository);
      const memClient1 = getPrismaClient();
      const memClient2 = getPrismaClient(true);
      expect(memClient1).toBe(memClient2);

      resetPrismaClientSingleton();
      delete process.env.USE_IN_MEMORY_DB;
      const realClient1 = getPrismaClient(false);
      const realClient2 = getPrismaClient(false);
      expect(realClient1).toBe(realClient2);
    });

    it('verifies pre-test and post-test database state restoration (Step N+1 invariant)', async () => {
      // Seed baseline state
      await repository.saveIfTopFive('BaselinePlayer', 500);
      const preTestSnapshot = db.snapshot();
      expect(preTestSnapshot).toHaveLength(1);

      // Run series of mutations
      await repository.saveIfTopFive('Test1', 900);
      await repository.saveIfTopFive('Test2', 800);
      await repository.saveIfTopFive('Test3', 700);
      await repository.saveIfTopFive('Test4', 600);
      await repository.saveIfTopFive('Test5', 1000);
      expect(await db.score.count!()).toBe(5);

      // Restore baseline state and verify post-test state matches pre-test snapshot
      db.restore(preTestSnapshot);
      expect(db.snapshot()).toEqual(preTestSnapshot);
    });
  });
});

