# US-06: Leaderboard REST API Endpoints

## Original

### Metadata
- **ID**: `US-06`
- **Title**: Leaderboard REST API for Submitting and Retrieving Top 5 Scores
- **Module**: Backend / Presentation Layer & Controllers
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** client application / frontend,  
**I want** secure REST API endpoints (`POST /api/scores` and `GET /api/scores`),  
**So that** I can retrieve the current top 5 leaderboard and submit qualified player scores with proper validation.

### Context & Requirements
- **Endpoints**:
  - `GET /api/scores`: Returns an array of the top 5 scores sorted by score descending, then by creation date ascending.
  - `POST /api/scores`: Validates request payload and attempts to store the score in the database, maintaining the strict Top 5 limit.
- **Request Validation**:
  - `playerName`: Required, string, 1 to 30 characters, non-empty, sanitized against XSS.
  - `score`: Required, non-negative integer, must be a multiple of 100.
- **Responses**:
  - `200 OK`: Retrieved scores array.
  - `201 Created`: Score qualified and was stored in the Top 5.
  - `200 OK` (or `422 Unprocessable Entity`): Score was valid but did not qualify for Top 5 (informative message returned).
  - `400 Bad Request`: Validation failure (missing fields, negative score, invalid types).
  - `500 Internal Server Error`: Unhandled database or server exception.

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Status code for non-qualifying score was ambiguous ("`200 OK` or `422`"); exact JSON envelope structure for `GET` and `POST` responses and error payloads was not fixed. |
| Scope boundaries | Clear | Covers Application service, Validator, Express Controller, Routes, CORS, and OpenAPI spec. |
| Comprehensive list of fields / DTOs | Partial | Needs exact request/response JSON schemas, field constraints (`score >= 100`, `score % 100 === 0`), and XSS sanitization rules. |
| Required endpoints structure & URLs | Partial | Needs full method, path, headers, status codes, and example payloads for `GET /api/scores` and `POST /api/scores`. |
| Files / modules to modify | Missing | Concrete DDD layered paths (`application/services/scoreService.ts`, `application/validator.ts`, `presentation/controllers/scoreController.ts`, `routes/scoreRoutes.ts`, `docs/api-spec.yml`) not listed. |
| Definition of Done & Mandatory Steps | Partial | Missing mandatory Step N+1 (DB verification report) and Step N+2 (Agent-executed `curl` endpoint testing + DB restoration) from `docs/openspec-tasks-mandatory-steps.md`. |
| Non-functional requirements | Missing | CORS policy, payload size limit, structured logging, security headers. |

---

## Enhanced

### Metadata
- **ID**: `US-06`
- **Title**: Leaderboard REST API (`GET /api/scores` & `POST /api/scores`)
- **Module**: Backend / Application & Presentation Layers (DDD)
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High
- **Depends On**: `US-05`
- **Blocks**: `US-07`
- **Branch Name**: `feature/US-06-leaderboard-backend-api`

### User Story
**As a** frontend client application,  
**I want** well-defined REST API endpoints (`GET /api/scores` and `POST /api/scores`) backed by input validation and the Top-5 repository,  
**So that** the browser game can fetch the live Top 5 leaderboard and submit player scores with deterministic JSON responses and status codes.

### Scope Boundaries
- **In Scope**:
  - Input validator (`validateCreateScorePayload`) in `backend/src/application/validator.ts`.
  - Application service `ScoreService` (`backend/src/application/services/scoreService.ts`).
  - Express controller `ScoreController` (`backend/src/presentation/controllers/scoreController.ts`).
  - Express router `scoreRoutes` (`backend/src/routes/scoreRoutes.ts`) mounted at `/api/scores` in `backend/src/index.ts`.
  - OpenAPI 3.0 contract update in `docs/api-spec.yml`.
- **Out of Scope**:
  - Prisma schema and database migrations (`US-05`).
  - React UI components and frontend HTTP client (`US-07`).

### Required Endpoints Structure & URLs

#### 1. `GET /api/scores`
- **Description**: Retrieve the current Top 5 high scores ordered by `score DESC, createdAt ASC`.
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "rank": 1,
        "playerName": "Alice",
        "score": 900,
        "createdAt": "2026-11-01T15:00:00.000Z"
      }
    ]
  }
  ```

#### 2. `POST /api/scores`
- **Description**: Validate and submit a player's final score. Persists only if it qualifies for the Top 5.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "playerName": "Carlos",
    "score": 800
  }
  ```
- **Validation Rules**:
  - `playerName`: required string; trimmed length between `1` and `30` characters; must not contain `<` or `>` (HTML tag injection prevention).
  - `score`: required integer (`Number.isInteger(score)`); must satisfy `score >= 100`, `score % 100 === 0`, and `score <= 100000`.
- **Response `201 Created` (Score Qualified & Saved in Top 5)**:
  ```json
  {
    "saved": true,
    "rank": 2,
    "entry": {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "rank": 2,
      "playerName": "Carlos",
      "score": 800,
      "createdAt": "2026-11-01T15:10:00.000Z"
    },
    "leaderboard": [
      { "id": "...", "rank": 1, "playerName": "Alice", "score": 900, "createdAt": "..." },
      { "id": "...", "rank": 2, "playerName": "Carlos", "score": 800, "createdAt": "..." }
    ]
  }
  ```
- **Response `200 OK` (Valid Request, Score Did Not Qualify for Top 5)**:
  ```json
  {
    "saved": false,
    "rank": null,
    "entry": null,
    "message": "Score does not qualify for Top 5",
    "leaderboard": [
      { "id": "...", "rank": 1, "playerName": "Alice", "score": 900, "createdAt": "..." }
    ]
  }
  ```
- **Response `400 Bad Request` (Validation Error)**:
  ```json
  {
    "error": "ValidationError",
    "message": "Invalid score submission payload",
    "details": [
      "playerName must be a non-empty string between 1 and 30 characters",
      "score must be a positive integer multiple of 100"
    ]
  }
  ```
- **Response `500 Internal Server Error`**:
  ```json
  {
    "error": "InternalServerError",
    "message": "An unexpected error occurred while processing the score"
  }
  ```

### Fields & DTO Definitions

```typescript
// backend/src/application/dtos/scoreDtos.ts
export interface CreateScoreRequestDTO {
  playerName: string;
  score: number;
}

export interface ScoreItemDTO {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  createdAt: string; // ISO-8601
}

export interface GetScoresResponseDTO {
  data: ScoreItemDTO[];
}

export interface SubmitScoreResponseDTO {
  saved: boolean;
  rank: number | null;
  entry: ScoreItemDTO | null;
  message?: string;
  leaderboard: ScoreItemDTO[];
}
```

### Files & Modules to Create / Modify
Aligned with `docs/backend-standards.md`:

```text
backend/src/
├── application/
│   ├── dtos/
│   │   └── scoreDtos.ts                                  # Request & response DTO interfaces
│   ├── validator.ts                                      # validateCreateScorePayload(body)
│   ├── __tests__/validator.test.ts                       # Unit tests for all validation edge cases
│   └── services/
│       ├── scoreService.ts                               # ScoreService(scoreRepository)
│       └── __tests__/scoreService.test.ts                # Service unit tests with mocked repository
├── presentation/
│   └── controllers/
│       ├── scoreController.ts                            # getTopScores, submitScore HTTP handlers
│       └── __tests__/scoreController.test.ts             # Controller unit & supertest integration tests
├── routes/
│   └── scoreRoutes.ts                                    # GET / and POST / mounted at /api/scores
└── index.ts                                              # Register cors, express.json({ limit: '10kb' }), /api/scores
docs/
└── api-spec.yml                                          # Add /api/scores GET & POST OpenAPI 3.0 paths & schemas
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Retrieve Top 5 Leaderboard (`GET /api/scores`)
- **GIVEN** the database holds up to 5 score entries
- **WHEN** the client sends `GET /api/scores`
- **THEN** the server responds with `200 OK` and `{ "data": [...] }` containing at most 5 items ordered by `score DESC, createdAt ASC` with `rank` `1..N`.

#### Scenario 2: Submit Qualifying Score (`POST /api/scores` -> `201 Created`)
- **GIVEN** the database has fewer than 5 scores (or 5th place is `< 700`)
- **WHEN** the client sends `POST /api/scores` with `{ "playerName": "Elena", "score": 700 }`
- **THEN** the server responds with `201 Created`, `saved: true`, `rank` between `1` and `5`, the created `entry`, and the updated 5-item `leaderboard`.

#### Scenario 3: Submit Non-Qualifying Score (`POST /api/scores` -> `200 OK`)
- **GIVEN** the database has 5 scores and the 5th highest score is `500`
- **WHEN** the client sends `POST /api/scores` with `{ "playerName": "Elena", "score": 300 }`
- **THEN** the server responds with `200 OK`, `saved: false`, `rank: null`, `message: "Score does not qualify for Top 5"`, and the unchanged `leaderboard`.

#### Scenario 4: Reject Invalid Payload (`POST /api/scores` -> `400 Bad Request`)
- **GIVEN** a payload with an empty name, name > 30 chars, HTML tags `<script>`, negative score, `score: 0`, or non-multiple of 100 (`score: 250`)
- **WHEN** the client sends `POST /api/scores`
- **THEN** the server responds with `400 Bad Request` and `{ "error": "ValidationError", "details": [...] }` without invoking the repository.

### Non-Functional Requirements
- **Security**: `express.json({ limit: '10kb' })` to prevent payload DoS; reject HTML angle brackets in `playerName` to prevent stored XSS; CORS configured for the frontend origin.
- **Observability**: Log errors through `infrastructure/logger.ts` without leaking stack traces in HTTP 500 responses.
- **Performance**: API response time < 50ms p95 on local environment.

### Documentation & Testing Updates
- **Unit & Integration Tests**: Jest tests for `validator.ts`, `scoreService.ts`, and `scoreController.ts` with ≥ 90% coverage.
- **Manual Endpoint Testing (`curl`)**: Mandatory execution by the agent per `docs/openspec-tasks-mandatory-steps.md` Step N+2 (testing `GET`, `POST` 201, `POST` 200 non-qualifying, `POST` 400 validation errors, and restoring pre-test DB state).
- **OpenAPI Spec**: Document `/api/scores` in `docs/api-spec.yml`.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-06-leaderboard-backend-api` created.
- [ ] Validator, service, and controller tests written first (TDD) and passing with ≥ 90% coverage.
- [ ] Step N+1: Unit tests & database state verification executed by the agent with report saved in `openspec/changes/<change-name>/reports/`.
- [ ] Step N+2: Manual `curl` endpoint tests executed by the agent (never delegated to user) with database state restored to pre-test baseline.
- [ ] Step N+4: `docs/api-spec.yml` updated and validated.
