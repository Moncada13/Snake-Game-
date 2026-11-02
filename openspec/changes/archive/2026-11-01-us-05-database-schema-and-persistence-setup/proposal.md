# Proposal: US-05 PostgreSQL Database Schema & Top 5 Persistence

## Why

With all client-side Snake game mechanics completed (US-01 through US-04), the system now needs a backend data access layer to persist and rank the Top 5 highest scores in PostgreSQL. Enforcing the strict Top-5 row limit atomically at the repository layer guarantees that the database never stores more than 5 records and preserves deterministic ranking (`score DESC`, `createdAt ASC`, `id ASC`) even under concurrent submissions.

## What Changes

- **PostgreSQL & Prisma Configuration (`docker-compose.yml`, `backend/.env.example`, `backend/package.json`, `backend/prisma/schema.prisma`, `backend/prisma/migrations/.../migration.sql`)**:
  - Define the PostgreSQL `Score` model mapped to the `scores` table (`id` UUID PK, `player_name` VARCHAR(30), `score` INT, `created_at` TIMESTAMPTZ(6)) with composite index `idx_scores_leaderboard` on `(score DESC, created_at ASC, id ASC)` and SQL `CHECK` constraints (`score > 0`, `score % 100 = 0`).
- **DDD Domain Entity & Validation (`backend/src/domain/models/Score.ts`)**:
  - Implement the `Score` entity and `DomainValidationError` enforcing trimmed `playerName` (`1..30` characters) and positive integer `score` divisible by `100` (`score >= 100` and `score % 100 === 0`).
- **Repository Contract & Atomic Top-5 Prisma Implementation (`backend/src/domain/repositories/IScoreRepository.ts` & `backend/src/infrastructure/repositories/PrismaScoreRepository.ts`)**:
  - Implement `getTopScores()` and `saveIfTopFive(playerName, score)` inside an interactive Serializable transaction (`Prisma.TransactionIsolationLevel.Serializable`) that inserts qualifying scores (`count < 5` or `score > fifthPlace.score`), evicts any overflow rows beyond rank 5 in the same transaction, and rejects non-qualifying scores (`<= 5th place`) without mutating the database.
- **Documentation (`docs/data-model.md`)**:
  - Update `docs/data-model.md` to document the `scores` table schema, domain invariants, ER diagram, and Top-5 pruning strategy.

## Capabilities

### New Capabilities
- `database-top5-persistence`: Covers the PostgreSQL `scores` schema and migration, `Score` domain entity validation invariants, deterministic ranking and tie-breaking (`score DESC, createdAt ASC, id ASC`), and atomic Serializable Top-5 persistence with overflow pruning (`MAX_LEADERBOARD_SIZE = 5`).

### Modified Capabilities
<!-- None. Existing frontend capabilities remain unchanged. -->

## Impact

- **Backend Code**: Initializes `backend/` TypeScript + Prisma + Jest project structure, `docker-compose.yml`, `backend/prisma/schema.prisma`, migration SQL, `Score.ts`, `IScoreRepository.ts`, `prismaClient.ts`, `PrismaScoreRepository.ts`, and unit/integration tests.
- **Database**: Introduces PostgreSQL `scores` table with composite index `idx_scores_leaderboard`.
- **Documentation**: Updates `docs/data-model.md` and `docs/development_guide.md`.

