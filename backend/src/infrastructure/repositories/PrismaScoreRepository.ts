import { Prisma } from '@prisma/client';
import {
  MAX_LEADERBOARD_SIZE,
  RankedScore,
  SaveScoreResult,
  Score,
} from '../../domain/models/Score';
import { IScoreRepository } from '../../domain/repositories/IScoreRepository';
import {
  getPrismaClient,
  PrismaClientLike,
  ScoreRow,
} from '../prismaClient';

const LEADERBOARD_ORDER_BY: Array<{ [key: string]: 'asc' | 'desc' }> = [
  { score: 'desc' },
  { createdAt: 'asc' },
  { id: 'asc' },
];

const MAX_SERIALIZABLE_RETRIES = 3;

const isSerializationConflictError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2034'
  );
};

export class PrismaScoreRepository implements IScoreRepository {
  private readonly prisma: PrismaClientLike;

  constructor(prismaClient?: PrismaClientLike) {
    this.prisma = prismaClient ?? getPrismaClient();
  }

  private static toRankedScores(rows: ScoreRow[]): RankedScore[] {
    return rows.slice(0, MAX_LEADERBOARD_SIZE).map((row, index) => ({
      id: row.id,
      playerName: row.playerName,
      score: row.score,
      createdAt: row.createdAt,
      rank: index + 1,
    }));
  }

  public async getTopScores(): Promise<RankedScore[]> {
    const rows = await this.prisma.score.findMany({
      orderBy: LEADERBOARD_ORDER_BY,
      take: MAX_LEADERBOARD_SIZE,
    });

    return PrismaScoreRepository.toRankedScores(rows);
  }

  public async saveIfTopFive(
    playerName: string,
    score: number
  ): Promise<SaveScoreResult> {
    // Validate domain invariants before starting a database transaction
    const domainScore = new Score({ playerName, score });

    for (let attempt = 1; ; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const currentRecords = await tx.score.findMany({
              orderBy: LEADERBOARD_ORDER_BY,
            });

            const currentTopFive = currentRecords.slice(0, MAX_LEADERBOARD_SIZE);
            const qualifies =
              currentTopFive.length < MAX_LEADERBOARD_SIZE ||
              domainScore.score > currentTopFive[MAX_LEADERBOARD_SIZE - 1].score;

            if (!qualifies) {
              return {
                saved: false,
                rank: null,
                entry: null,
                leaderboard: PrismaScoreRepository.toRankedScores(currentTopFive),
              };
            }

            const created = await tx.score.create({
              data: {
                playerName: domainScore.playerName,
                score: domainScore.score,
              },
            });

            const updatedRecords = await tx.score.findMany({
              orderBy: LEADERBOARD_ORDER_BY,
            });

            if (updatedRecords.length > MAX_LEADERBOARD_SIZE) {
              const overflowIds = updatedRecords
                .slice(MAX_LEADERBOARD_SIZE)
                .map((record) => record.id);
              await tx.score.deleteMany({
                where: {
                  id: {
                    in: overflowIds,
                  },
                },
              });
            }

            const leaderboard =
              PrismaScoreRepository.toRankedScores(updatedRecords);
            const entry =
              leaderboard.find((item) => item.id === created.id) ?? null;

            return {
              saved: entry !== null,
              rank: entry ? entry.rank : null,
              entry,
              leaderboard,
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );
      } catch (error) {
        if (
          isSerializationConflictError(error) &&
          attempt < MAX_SERIALIZABLE_RETRIES
        ) {
          continue;
        }
        throw error;
      }
    }
  }
}

