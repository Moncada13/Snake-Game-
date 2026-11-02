# Spec Delta

## Purpose

Manages PostgreSQL schema persistence, domain invariant validation for player scores, deterministic leaderboard ordering, and atomic Serializable Top-5 score retention with automatic overflow eviction.

## ADDED Requirements

### Requirement: Score Domain Entity Invariant Validation
The domain layer SHALL validate that every Score entity has a non-empty trimmed playerName between 1 and 30 characters and a positive integer score strictly divisible by 100 (`score >= 100` and `score % 100 === 0`) before any database interaction occurs.

#### Scenario: Valid score entity instantiation
- **WHEN** a Score entity is created with playerName "  Alice  " and score 300
- **THEN** the entity trims playerName to "Alice", retains score 300, and passes validation

#### Scenario: Invalid playerName or non-multiple-of-100 score throws DomainValidationError
- **WHEN** a Score entity is instantiated with an empty playerName, a playerName exceeding 30 characters, a score less than 100, or a score not divisible by 100 (such as 150)
- **THEN** a DomainValidationError is thrown immediately before touching the persistence layer

### Requirement: Deterministic Top-5 Ranking and Tie-Breaking
The persistence layer SHALL return at most 5 leaderboard entries ordered by `score DESC`, then `createdAt ASC` (earlier achievement wins ties), and finally `id ASC`, assigning each entry a 1-based rank (`1..5`).

#### Scenario: Retrieving ordered Top-5 scores with tie-breaking
- **WHEN** `getTopScores()` is called and two records have the same score of 500 with different creation timestamps
- **THEN** the record with the earlier `createdAt` timestamp is ranked ahead of the later record, and at most 5 records are returned with ranks 1 through N

### Requirement: Atomic Top-5 Insertion When Fewer Than 5 Records Exist
When the `scores` table contains fewer than 5 records, `saveIfTopFive` SHALL insert the valid new score within a Serializable transaction and return `saved: true`, the assigned 1-based `rank`, the created `entry`, and the updated `leaderboard`.

#### Scenario: Inserting a score when the table has 3 records
- **WHEN** the `scores` table holds scores `[900, 700, 500]` and `saveIfTopFive("Alice", 600)` is executed
- **THEN** the record is persisted with `saved: true` and `rank: 3`, and the resulting leaderboard contains 4 records ordered `[900, 700, 600, 500]`

### Requirement: Atomic Overflow Eviction When Qualifying Score Enters Full Top-5
When the `scores` table already contains 5 records and a newly submitted score is strictly greater than the current 5th-place score (`score > currentTop[4].score`), `saveIfTopFive` SHALL insert the new score and delete all records ranked below 5th place within the same Serializable transaction so that at most 5 rows remain in the table.

#### Scenario: Inserting a qualifying score evicts the previous 5th-place record
- **WHEN** the `scores` table holds 5 records `[1000, 800, 600, 400, 200]` and `saveIfTopFive("Bob", 500)` is executed
- **THEN** "Bob" is persisted with `saved: true` and `rank: 4`, the previous 5th-place record (`200`) is deleted in the same transaction, and the table retains exactly 5 records `[1000, 800, 600, 500, 400]`

### Requirement: Non-Qualifying Score Rejection When Top-5 Is Full
When the `scores` table already contains 5 records and a submitted score is less than or equal to the current 5th-place score (`score <= currentTop[4].score`), `saveIfTopFive` SHALL NOT insert or delete any database records and SHALL return `saved: false`, `rank: null`, `entry: null`, and the existing 5-record `leaderboard`.

#### Scenario: Score equal to or lower than 5th place is not persisted
- **WHEN** the `scores` table holds 5 records `[1000, 800, 600, 400, 300]` and `saveIfTopFive("Charlie", 300)` or `saveIfTopFive("Charlie", 100)` is executed
- **THEN** `saveIfTopFive` returns `saved: false`, `rank: null`, and `entry: null` without inserting or deleting any rows in the database

