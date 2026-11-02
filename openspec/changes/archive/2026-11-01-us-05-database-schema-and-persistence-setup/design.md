# Design: PostgreSQL Database Schema & Top 5 Persistence

## Context

With client-side Snake gameplay complete (`US-01` through `US-04`), `US-05` establishes the backend Domain and Infrastructure layers following Domain-Driven Design (DDD) (`docs/backend-standards.md`). The core invariant is that the `scores` table in PostgreSQL must never store more than the **Top 5** highest scores (`MAX_LEADERBOARD_SIZE = 5`). During our environment inspection on this Windows host, neither Docker nor a local PostgreSQL service on port 5432 is currently installed, so the persistence layer must both provide the canonical PostgreSQL + Prisma schema/migrations/repository and support an injectable Prisma transaction client (plus an embedded PostgreSQL/in-memory Prisma client adapter for local/CI execution when a live PostgreSQL daemon is unavailable). See `proposal.md` for motivation and `specs/database-top5-persistence/spec.md` for normative requirements.

## Goals / Non-Goals

**Goals:**
- Define `docker-compose.yml`, `backend/prisma/schema.prisma`, and the SQL migration `20261101000000_create_scores_table/migration.sql` with `scores` table, `CHECK` constraints (`score > 0`, `score % 100 = 0`), and composite index `idx_scores_leaderboard (score DESC, created_at ASC, id ASC)`.
- Implement the DDD `Score` entity (`backend/src/domain/models/Score.ts`) and `DomainValidationError` enforcing `playerName` (`1..30` trimmed characters) and `score` (`>= 100` integer multiple of `100`).
- Implement `IScoreRepository` and `PrismaScoreRepository` using `prisma.$transaction(..., { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })` to atomically enforce the Top-5 limit.
- Provide a deterministic stateful mock/in-memory Prisma client fixture alongside unit tests so Step N+1 database state verification (pre-test snapshot, test execution, post-test restoration) and upcoming `US-06`/`US-07` API tests can run reliably even when no external PostgreSQL daemon is running on port 5432.

**Non-Goals:**
- Express HTTP controllers, routes, and DTO middleware (`US-06`).
- Frontend Game Over modal and API client integration (`US-07`).

## Decisions

### 1. Serializable Interactive Transaction for Top-5 Pruning
- **Decision**: Execute `saveIfTopFive(playerName, score)` inside `this.prisma.$transaction(async (tx) => { ... }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })`. Inside the transaction:
  1. Query all existing rows ordered by `[{ score: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }]`.
  2. Check qualification: `currentTop.length < 5 || validatedScore.score > currentTop[4].score`.
  3. If not qualified, return `{ saved: false, rank: null, entry: null, leaderboard }` without writing.
  4. If qualified, `tx.score.create(...)`, re-query ordered rows, keep the first 5, and if `allRecords.length > 5`, execute `tx.score.deleteMany({ where: { id: { in: overflowIds } } })`.
- **Rationale**: Using a single Serializable transaction prevents race conditions where two concurrent requests both observe 4 rows and both insert without pruning the 6th row. Deleting `allRecords.slice(5)` rather than only a single row self-heals the table to $\le 5$ rows under any state.
- **Alternatives Considered**: Separate `findMany` + `create` + `delete` outside a transaction. Rejected because concurrent requests could leave 6+ rows in the table.

### 2. Deterministic Tie-Breaking (`score DESC, createdAt ASC, id ASC`)
- **Decision**: Rank scores primarily by `score DESC`, secondarily by `createdAt ASC` (first player to reach a score retains the higher rank; a later identical score does not displace an earlier 5th-place score), and finally by `id ASC`.
- **Rationale**: Classic arcade leaderboard semantics reward the pioneer who set the score first and guarantee a total ordering across all rows.

### 3. Dependency Injection of `PrismaClientLike` for Testability & Offline Resilience
- **Decision**: `PrismaScoreRepository` accepts a `PrismaClient` (or compatible `PrismaClientLike` interface exposing `score.findMany`, `score.create`, `score.deleteMany`, and `$transaction`) via constructor injection, defaulting to the singleton `prisma` instance in `backend/src/infrastructure/prismaClient.ts`.
- **Rationale**: Satisfies the Dependency Inversion Principle (`docs/backend-standards.md`), enables fast 100%-coverage unit and transactional integration tests, and allows an in-memory transactional store fallback when a local PostgreSQL daemon is not running on the host machine.

## Risks / Trade-offs

- **[Risk: Host Environment Without Running PostgreSQL Daemon]** On developer machines where Docker or local PostgreSQL service is not installed, `prisma migrate deploy` cannot connect to `localhost:5432`.
  - *Mitigation*: Commit the exact PostgreSQL migration SQL file (`backend/prisma/migrations/20261101000000_create_scores_table/migration.sql`), generate the Prisma Client types via `npx prisma generate`, and verify transactional pre/post state invariants using a stateful PostgreSQL-semantics transactional test harness in Step N+1.

