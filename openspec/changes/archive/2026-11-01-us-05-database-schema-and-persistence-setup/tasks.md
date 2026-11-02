# Tasks: US-05 PostgreSQL Database Schema & Top 5 Persistence

## 0. Feature Branch Creation

- [x] 0.1 Create and switch to feature branch `feature/US-05-database-top5-persistence` from `main` and verify with `git branch --show-current`

## 1. Backend Project & Prisma PostgreSQL Schema Setup

- [x] 1.1 Create `docker-compose.yml` (PostgreSQL 16 service), `backend/.env.example`, `backend/package.json`, `backend/tsconfig.json`, and `backend/jest.config.js`, then install backend dependencies (`npm --prefix backend install`)
- [x] 1.2 Create `backend/prisma/schema.prisma` (`Score` model mapped to `scores` table with `idx_scores_leaderboard`) and `backend/prisma/migrations/20261101000000_create_scores_table/migration.sql` (including SQL `CHECK` constraints `score > 0` and `score % 100 = 0`), then generate Prisma Client (`npx --prefix backend prisma generate`)

## 2. Score Domain Entity & Invariant Validation (TDD)

- [x] 2.1 Write unit tests in `backend/src/domain/models/__tests__/Score.test.ts` covering valid instantiation, whitespace trimming, and `DomainValidationError` on empty/oversized `playerName` or non-multiple-of-100 / non-positive `score`
- [x] 2.2 Implement `Score`, `DomainValidationError`, `RankedScore`, and `SaveScoreResult` in `backend/src/domain/models/Score.ts` and `IScoreRepository` in `backend/src/domain/repositories/IScoreRepository.ts`, verifying `Score.test.ts` passes with 100% coverage

## 3. Atomic Top-5 Prisma Repository Implementation (TDD)

- [x] 3.1 Write unit and transactional integration tests in `backend/src/infrastructure/repositories/__tests__/PrismaScoreRepository.test.ts` covering `getTopScores()` ordering/tie-breaking (`score DESC, createdAt ASC, id ASC`), `saveIfTopFive()` when `< 5` rows exist, overflow eviction when a qualifying score beats 5th place, rejection when `score <= 5th place`, and pre/post state restoration
- [x] 3.2 Implement `backend/src/infrastructure/prismaClient.ts` and `backend/src/infrastructure/repositories/PrismaScoreRepository.ts` using Serializable interactive transactions, verifying 100% test coverage

## 4. Mandatory Verification & Testing Steps (Agent Executed)

- [x] 4.1 Step N: Review and Update Existing Unit Tests - Run both `npm --prefix backend test` and `npm --prefix frontend test` to confirm all test suites pass
- [x] 4.2 Step N+1: Run Unit Tests & Database State Verification - Execute `npm --prefix backend run test:coverage`, verify pre/post persistence state invariants (`COUNT(*) <= 5` and baseline restoration), and generate report at `openspec/changes/us-05-database-schema-and-persistence-setup/reports/2026-11-01-step-N+1-unit-test-and-db-verification.md`
- [x] 4.3 Step N+2: Manual Endpoint Testing - Generate report documenting N/A for persistence-only change (HTTP endpoints in `US-06`) at `openspec/changes/us-05-database-schema-and-persistence-setup/reports/2026-11-01-step-N+2-manual-endpoint-testing.md`
- [x] 4.4 Step N+3: E2E Testing Report - Generate report documenting repository E2E transaction verification at `openspec/changes/us-05-database-schema-and-persistence-setup/reports/2026-11-01-step-N+3-e2e-testing-report.md`
- [x] 4.5 Step N+4: Update Technical Documentation - Update `docs/data-model.md` (adding `Score` table schema, validation rules, Top-5 pruning strategy, and ER diagram) and `docs/development_guide.md`

## Workflow follow-up

- Verify all change requirements using `/opsx-verify`
- Perform adversarial review using `/adversarial-review`
- Archive change using `/opsx-archive`
