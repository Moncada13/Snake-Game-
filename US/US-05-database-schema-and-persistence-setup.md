# US-05: PostgreSQL Database Schema & Top 5 Persistence

## Original

### Metadata
- **ID**: `US-05`
- **Title**: PostgreSQL Database Configuration, Schema Migration, and Strict Top 5 Persistence
- **Module**: Backend / Database & Data Access Layer
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** system administrator / backend engineer,  
**I want** a PostgreSQL database with a scores table and a repository layer that maintains strictly the Top 5 highest scores,  
**So that** the database only stores the top 5 records at any given time, pruning any score below rank 5.

### Context & Requirements
- **Database Engine**: PostgreSQL.
- **ORM / Query Tool**: Prisma (or raw SQL / pg client according to architecture standards).
- **Strict Limit Constraint**:
  - The database must store **only the top 5 scores**.
  - When a new score is submitted:
    1. If there are fewer than 5 records in the database, insert the new score.
    2. If there are 5 records and the new score is higher than the current 5th score, insert the new score and delete the lowest score (keeping exactly 5 records).
    3. If there are 5 records and the new score is lower than or equal to the 5th score, reject insertion (or no-op).
- **Entity Schema (`Score`)**:
  - `id`: UUID or Auto-increment Integer (Primary Key).
  - `playerName`: String (1–30 characters, trimmed, sanitized).
  - `score`: Integer (positive multiple of 100).
  - `createdAt`: Timestamp with timezone (default `NOW()`).

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Tie-breaking order when two players have the same score is not specified; transaction isolation to prevent concurrent inserts leaving > 5 rows is not detailed. |
| Scope boundaries | Clear | Covers PostgreSQL schema, Prisma migration, Domain model, and Repository implementation. |
| Comprehensive list of fields / schema | Partial | Needs exact column types, DB check constraints (`score > 0`, `score % 100 = 0`), composite index, and domain entity methods. |
| Required endpoints structure & URLs | N/A | Persistence layer only; HTTP endpoints are exposed in `US-06`. |
| Files / modules to modify | Missing | Concrete DDD file structure (`domain/models`, `domain/repositories`, `infrastructure/repositories`, `prisma/schema.prisma`) not listed. |
| Definition of Done & Mandatory Steps | Partial | Missing mandatory Step N+1 database pre/post verification and report generation in `docs/openspec-tasks-mandatory-steps.md`. |
| Non-functional requirements | Missing | Serializable/atomic transaction safety, connection pooling, query latency (< 20ms), and `docs/data-model.md` update. |

---

## Enhanced

### Metadata
- **ID**: `US-05`
- **Title**: PostgreSQL Schema, Domain Entity & Atomic Top-5 Score Repository
- **Module**: Backend / Domain & Infrastructure Layers (DDD)
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High
- **Depends On**: None (can be developed in parallel with Frontend `US-01`..`US-04`)
- **Blocks**: `US-06`, `US-07`
- **Branch Name**: `feature/US-05-database-top5-persistence`

### User Story
**As a** backend system,  
**I want** a PostgreSQL `scores` table managed through Prisma and a DDD `PrismaScoreRepository` that atomically persists only the Top 5 highest scores,  
**So that** the database never stores more than 5 records and guarantees deterministic ranking even under concurrent submissions.

### Scope Boundaries
- **In Scope**:
  - PostgreSQL configuration (`docker-compose.yml` / `.env.example`) and Prisma schema (`backend/prisma/schema.prisma`).
  - Database migration creating the `scores` table and composite index `(score DESC, created_at ASC, id ASC)`.
  - Domain entity `Score` (`backend/src/domain/models/Score.ts`) with domain invariants (`playerName` 1–30 chars, `score > 0` and multiple of `100`).
  - Repository contract `IScoreRepository` (`backend/src/domain/repositories/IScoreRepository.ts`).
  - Prisma repository implementation `PrismaScoreRepository` (`backend/src/infrastructure/repositories/PrismaScoreRepository.ts`) using an interactive transaction to enforce the max-5-rows invariant.
  - Updating `docs/data-model.md`.
- **Out of Scope**:
  - Express controllers, routes, and HTTP DTO validation (`US-06`).
  - Frontend leaderboard UI (`US-07`).

### Functional Requirements

#### FR-1: Ranking & Tie-Breaking Rules
- Scores are ordered by:
  1. `score DESC` (highest score first).
  2. `createdAt ASC` (first player to achieve a score holds the higher rank).
  3. `id ASC` (deterministic final tie-breaker).
- Maximum allowed rows in `scores` table at rest: `MAX_LEADERBOARD_SIZE = 5`.

#### FR-2: Atomic Top-5 Persistence Algorithm (`saveIfTopFive`)
Executed inside `prisma.$transaction(async (tx) => { ... }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })`:
1. Fetch current ordered records:
   ```typescript
   const currentTop = await tx.score.findMany({
     orderBy: [{ score: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
   });
   ```
2. Check eligibility:
   - Qualifies if `currentTop.length < 5` OR `newScore > currentTop[4].score` (a tie with 5th place does NOT displace the earlier 5th-place holder).
   - Also `newScore` must be `>= 100` and `newScore % 100 === 0`.
3. If not eligible:
   - Return `{ saved: false, rank: null, scoreRecord: null, leaderboard: currentTop.slice(0, 5) }` without modifying the database.
4. If eligible:
   - Insert the new record via `tx.score.create(...)`.
   - Re-query all records ordered by `[{ score: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }]`.
   - Keep the first 5 records (`topFive = allRecords.slice(0, 5)`) and if `allRecords.length > 5`, delete all overflow rows in the same transaction:
     ```typescript
     const overflowIds = allRecords.slice(5).map((r) => r.id);
     await tx.score.deleteMany({ where: { id: { in: overflowIds } } });
     ```
   - Compute `rank = topFive.findIndex((r) => r.id === created.id) + 1`.
   - Return `{ saved: true, rank, scoreRecord: created, leaderboard: topFive }`.

### Fields & Database Schema

#### Prisma Schema (`backend/prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Score {
  id         String   @id @default(uuid()) @db.Uuid
  playerName String   @map("player_name") @db.VarChar(30)
  score      Int
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@index([score(sort: Desc), createdAt(sort: Asc), id(sort: Asc)], map: "idx_scores_leaderboard")
  @@map("scores")
}
```

#### Domain Entity & Repository Contract
```typescript
// backend/src/domain/models/Score.ts
export interface ScoreProps {
  id?: string;
  playerName: string;
  score: number;
  createdAt?: Date;
}

export interface RankedScore {
  id: string;
  playerName: string;
  score: number;
  createdAt: Date;
  rank: number; // 1..5
}

export interface SaveScoreResult {
  saved: boolean;
  rank: number | null;
  entry: RankedScore | null;
  leaderboard: RankedScore[];
}

// backend/src/domain/repositories/IScoreRepository.ts
export interface IScoreRepository {
  getTopScores(): Promise<RankedScore[]>;
  saveIfTopFive(playerName: string, score: number): Promise<SaveScoreResult>;
}
```

### Required Endpoints
- **None** in `US-05` (exposed in `US-06`).

### Files & Modules to Create / Modify
Aligned with `docs/backend-standards.md`:

```text
backend/
├── prisma/
│   ├── schema.prisma                                     # Score model definition
│   └── migrations/
│       └── YYYYMMDDHHMMSS_create_scores_table/
│           └── migration.sql                             # DDL + idx_scores_leaderboard
├── src/
│   ├── domain/
│   │   ├── models/
│   │   │   ├── Score.ts                                  # Score domain entity & invariant validation
│   │   │   └── __tests__/Score.test.ts                   # Domain entity unit tests
│   │   └── repositories/
│   │       └── IScoreRepository.ts                       # Repository interface
│   └── infrastructure/
│       ├── prismaClient.ts                               # Singleton PrismaClient instance
│       └── repositories/
│           ├── PrismaScoreRepository.ts                  # Atomic Top-5 persistence implementation
│           └── __tests__/PrismaScoreRepository.test.ts   # Unit & integration tests
└── docs/
    └── data-model.md                                     # Update with Score table & ER diagram
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Inserting Scores When Table Has Fewer Than 5 Rows
- **GIVEN** the `scores` table contains 3 records (`[900, 700, 500]`)
- **WHEN** `saveIfTopFive("Alice", 600)` is executed
- **THEN** the record is persisted with `saved: true` and `rank: 3`
- **AND** the `scores` table contains 4 records ordered `[900, 700, 600, 500]`.

#### Scenario 2: Inserting Qualifying Score When Table Has 5 Rows (Evicts 6th)
- **GIVEN** the `scores` table contains 5 records (`[1000, 800, 600, 400, 200]`)
- **WHEN** `saveIfTopFive("Bob", 500)` is executed
- **THEN** `"Bob"` is inserted with `saved: true` and `rank: 4`
- **AND** the previous 5th record (`200`) is deleted in the same transaction
- **AND** `SELECT COUNT(*) FROM scores` equals `5` (`[1000, 800, 600, 500, 400]`).

#### Scenario 3: Rejecting Score Equal To or Lower Than 5th Place
- **GIVEN** the `scores` table contains 5 records (`[1000, 800, 600, 400, 300]`)
- **WHEN** `saveIfTopFive("Charlie", 300)` or `saveIfTopFive("Charlie", 100)` is executed
- **THEN** the method returns `saved: false, rank: null`
- **AND** no rows are inserted or deleted in PostgreSQL.

#### Scenario 4: Domain Invariant Validation
- **GIVEN** an invalid score (`0`, `-100`, or `150` which is not a multiple of 100) or an empty `playerName` (`""` or `> 30` chars)
- **WHEN** `new Score({ playerName, score })` is instantiated
- **THEN** a `DomainValidationError` is thrown before touching the database.

### Non-Functional Requirements
- **Data Integrity**: `SELECT COUNT(*) FROM scores` must never exceed `5` after any committed transaction.
- **Performance**: `getTopScores()` and `saveIfTopFive()` execute in < 20ms on local PostgreSQL using `idx_scores_leaderboard`.
- **Security**: Parameterized queries via Prisma Client (zero raw SQL string interpolation).

### Documentation & Testing Updates
- **Unit & Integration Tests**: Jest tests for `Score` domain model and `PrismaScoreRepository` (≥ 90% coverage across branches, lines, functions, statements).
- **Database State Verification**: Per `docs/openspec-tasks-mandatory-steps.md` Step N+1, capture pre-test row count/checksum, execute tests, verify post-test database state is restored, and write the report.
- **Documentation**: Update `docs/data-model.md` to document the `scores` table schema and Top-5 pruning rule.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-05-database-top5-persistence` created.
- [ ] Prisma schema and migration created and applied cleanly to PostgreSQL.
- [ ] Domain model and repository unit/integration tests written first (TDD) with ≥ 90% coverage.
- [ ] Step N+1: Unit Tests & Database State Verification executed by the agent, with report generated in `openspec/changes/<change-name>/reports/YYYY-MM-DD-step-N+1-unit-test-and-db-verification.md`.
- [ ] Step N+4: `docs/data-model.md` updated.
