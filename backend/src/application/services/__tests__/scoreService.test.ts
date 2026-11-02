import { IScoreRepository } from '../../../domain/repositories/IScoreRepository';
import { ScoreService } from '../scoreService';

describe('ScoreService', () => {
  let mockRepo: jest.Mocked<IScoreRepository>;
  let service: ScoreService;

  beforeEach(() => {
    mockRepo = {
      getTopScores: jest.fn(),
      saveIfTopFive: jest.fn(),
    };
    service = new ScoreService(mockRepo);
  });

  it('uses default PrismaScoreRepository when instantiated without arguments', () => {
    process.env.USE_IN_MEMORY_DB = 'true';
    const defaultService = new ScoreService();
    expect(defaultService).toBeInstanceOf(ScoreService);
    delete process.env.USE_IN_MEMORY_DB;
  });

  it('getTopScores maps domain RankedScore items to ScoreItemDTO with ISO-8601 createdAt', async () => {
    const fixedDate = new Date('2026-11-01T15:00:00.000Z');
    mockRepo.getTopScores.mockResolvedValue([
      {
        id: 'id-1',
        rank: 1,
        playerName: 'Alice',
        score: 900,
        createdAt: fixedDate,
      },
    ]);

    const response = await service.getTopScores();

    expect(mockRepo.getTopScores).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      data: [
        {
          id: 'id-1',
          rank: 1,
          playerName: 'Alice',
          score: 900,
          createdAt: '2026-11-01T15:00:00.000Z',
        },
      ],
    });
  });

  it('submitScore returns saved: true with mapped entry and leaderboard when score qualifies', async () => {
    const fixedDate = new Date('2026-11-01T15:10:00.000Z');
    const savedEntry = {
      id: 'id-2',
      rank: 1,
      playerName: 'Carlos',
      score: 800,
      createdAt: fixedDate,
    };

    mockRepo.saveIfTopFive.mockResolvedValue({
      saved: true,
      rank: 1,
      entry: savedEntry,
      leaderboard: [savedEntry],
    });

    const response = await service.submitScore({
      playerName: 'Carlos',
      score: 800,
    });

    expect(mockRepo.saveIfTopFive).toHaveBeenCalledWith('Carlos', 800);
    expect(response).toEqual({
      saved: true,
      rank: 1,
      entry: {
        id: 'id-2',
        rank: 1,
        playerName: 'Carlos',
        score: 800,
        createdAt: '2026-11-01T15:10:00.000Z',
      },
      leaderboard: [
        {
          id: 'id-2',
          rank: 1,
          playerName: 'Carlos',
          score: 800,
          createdAt: '2026-11-01T15:10:00.000Z',
        },
      ],
    });
  });

  it('submitScore returns saved: false and informative message when score does not qualify', async () => {
    const fixedDate = new Date('2026-11-01T15:00:00.000Z');
    mockRepo.saveIfTopFive.mockResolvedValue({
      saved: false,
      rank: null,
      entry: null,
      leaderboard: [
        {
          id: 'id-1',
          rank: 1,
          playerName: 'Alice',
          score: 900,
          createdAt: fixedDate,
        },
      ],
    });

    const response = await service.submitScore({
      playerName: 'Elena',
      score: 300,
    });

    expect(response).toEqual({
      saved: false,
      rank: null,
      entry: null,
      message: 'Score does not qualify for Top 5',
      leaderboard: [
        {
          id: 'id-1',
          rank: 1,
          playerName: 'Alice',
          score: 900,
          createdAt: '2026-11-01T15:00:00.000Z',
        },
      ],
    });
  });
});

