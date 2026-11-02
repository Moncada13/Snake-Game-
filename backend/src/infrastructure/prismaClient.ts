import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export interface ScoreRow {
  id: string;
  playerName: string;
  score: number;
  createdAt: Date;
}

export interface ScoreDelegateLike {
  findMany(args?: {
    orderBy?: Array<{ [key: string]: 'asc' | 'desc' }>;
    take?: number;
  }): Promise<ScoreRow[]>;
  create(args: {
    data: {
      id?: string;
      playerName: string;
      score: number;
      createdAt?: Date;
    };
  }): Promise<ScoreRow>;
  deleteMany(args?: {
    where?: {
      id?: {
        in?: string[];
      };
    };
  }): Promise<{ count: number }>;
  count?(): Promise<number>;
}

export interface PrismaTransactionClientLike {
  score: ScoreDelegateLike;
}

export interface PrismaClientLike extends PrismaTransactionClientLike {
  $transaction<T>(
    fn: (tx: PrismaTransactionClientLike) => Promise<T>,
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel | string }
  ): Promise<T>;
}

/**
 * Deterministic in-memory PostgreSQL-compatible Prisma client adapter.
 * Used for transactional testing and as a resilient fallback when no external
 * PostgreSQL daemon is listening on localhost:5432.
 */
export class InMemoryPrismaClient implements PrismaClientLike {
  private rows: ScoreRow[] = [];
  private txQueue: Promise<unknown> = Promise.resolve();

  constructor(initialRows: ScoreRow[] = []) {
    this.rows = initialRows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt.getTime()),
    }));
  }

  public snapshot(): ScoreRow[] {
    return this.rows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt.getTime()),
    }));
  }

  public restore(snapshotRows: ScoreRow[]): void {
    this.rows = snapshotRows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt.getTime()),
    }));
  }

  private static sortScores(items: ScoreRow[]): ScoreRow[] {
    return [...items].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // score DESC
      }
      const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
      if (timeDiff !== 0) {
        return timeDiff; // createdAt ASC
      }
      return a.id.localeCompare(b.id); // id ASC
    });
  }

  public readonly score: ScoreDelegateLike = {
    findMany: async (args) => {
      const sorted = InMemoryPrismaClient.sortScores(this.rows);
      if (args?.take !== undefined) {
        return sorted.slice(0, args.take);
      }
      return sorted;
    },

    create: async ({ data }) => {
      const created: ScoreRow = {
        id: data.id ?? randomUUID(),
        playerName: data.playerName,
        score: data.score,
        createdAt: data.createdAt ?? new Date(),
      };
      this.rows.push(created);
      return { ...created, createdAt: new Date(created.createdAt.getTime()) };
    },

    deleteMany: async (args) => {
      const idsToDelete = args?.where?.id?.in;
      if (!idsToDelete) {
        const count = this.rows.length;
        this.rows = [];
        return { count };
      }
      const idSet = new Set(idsToDelete);
      const before = this.rows.length;
      this.rows = this.rows.filter((r) => !idSet.has(r.id));
      return { count: before - this.rows.length };
    },

    count: async () => this.rows.length,
  };

  public async $transaction<T>(
    fn: (tx: PrismaTransactionClientLike) => Promise<T>
  ): Promise<T> {
    const runTransaction = async (): Promise<T> => {
      const backup = this.snapshot();
      try {
        return await fn({ score: this.score });
      } catch (error) {
        this.restore(backup);
        throw error;
      }
    };

    const resultPromise = this.txQueue.then(runTransaction, runTransaction);
    this.txQueue = resultPromise.then(
      () => undefined,
      () => undefined
    );
    return resultPromise;
  }
}

let defaultClientInstance: PrismaClientLike | null = null;

export const getPrismaClient = (useInMemoryFallback: boolean = false): PrismaClientLike => {
  if (useInMemoryFallback || process.env.USE_IN_MEMORY_DB === 'true') {
    if (!defaultClientInstance) {
      defaultClientInstance = new InMemoryPrismaClient();
    }
    return defaultClientInstance;
  }

  if (!defaultClientInstance) {
    defaultClientInstance = new PrismaClient() as unknown as PrismaClientLike;
  }
  return defaultClientInstance;
};

export const resetPrismaClientSingleton = (): void => {
  defaultClientInstance = null;
};

