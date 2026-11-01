# US-07: Leaderboard Frontend Integration & Score Submission Flow

## Original

### Metadata
- **ID**: `US-07`
- **Title**: Client-Side Leaderboard Integration, Score Submission Modal, and Real-Time Sync
- **Module**: Frontend / Integration & Leaderboard UI
- **Status**: Ready for Planning
- **Priority**: High

### User Story
**As a** player,  
**I want** to see the live Top 5 high scores displayed on the webpage and be prompted to enter my name when my game ends with a qualifying score,  
**So that** my achievement is recorded in the PostgreSQL database and immediately reflected on the leaderboard.

### Context & Requirements
- **Initial Load**:
  - The client makes a `GET /api/scores` call upon page mount to fetch the Top 5 scores.
  - Displays a clean ranked table (Rank 1 to 5, Player Name, Score).
  - If fewer than 5 scores exist, empty slots display placeholder dashes (`-`).
- **Post-Game Flow**:
  - When game transitions to `GAME_OVER`:
    - If `score > 0` and is eligible for Top 5:
      - A submission modal or inline input appears: *"New High Score! Enter your name:"*.
      - Name input is autofocus, sanitized, max 30 characters.
      - "Submit" button triggers `POST /api/scores`.
    - If `score` does not qualify or is 0:
      - Display game over message with option to "Reset" and play again without prompting name entry.
- **Post-Submission**:
  - Disables submit button to prevent double-click submissions.
  - On successful `201 Created` response:
    - Close submission modal.
    - Refresh leaderboard via `GET /api/scores`.
    - Highlight the newly added score row with an animation or badge.
  - On error:
    - Display error message (e.g., "Network error", "Name invalid").

### Gap Analysis (Enrich-US Validation)

| Checklist Item | Status | Gap Identified |
| :--- | :--- | :--- |
| Full functionality description | Partial | Exact client-side qualification formula (`score >= 100 && (scores.length < 5 \|\| score > scores[4].score)`) and handling when a concurrent player took the 5th spot (`200 OK` `saved: false` response) were not specified. |
| Scope boundaries | Clear | Covers `scoreService.ts`, `LeaderboardPanel`, `ScoreSubmissionModal`, and full-stack integration with `/api/scores`. |
| Comprehensive list of fields / state | Partial | Missing state fields for `isLoading`, `loadError`, `isSubmitting`, `submitError`, `hasSubmitted`, and `highlightedScoreId`. |
| Required endpoints structure & URLs | Partial | Needs exact alignment with `US-06` DTO envelopes (`{ data: ScoreItemDTO[] }` and `SubmitScoreResponseDTO`). |
| Files / modules to modify | Missing | Concrete file paths (`services/scoreService.ts`, `components/LeaderboardPanel/LeaderboardPanel.tsx`, `components/ScoreSubmissionModal/ScoreSubmissionModal.tsx`) not listed. |
| Definition of Done & Mandatory Steps | Partial | Missing mandatory Step N+1, Step N+2, and Step N+3 (Playwright MCP full E2E flow + DB state restoration) from `docs/openspec-tasks-mandatory-steps.md`. |
| Non-functional requirements | Missing | Graceful degradation when backend is unreachable (game remains playable), input sanitization, keyboard focus trapping in modal. |

---

## Enhanced

### Metadata
- **ID**: `US-07`
- **Title**: Full-Stack Leaderboard Integration, Score Submission Modal & Real-Time Top-5 Sync
- **Module**: Frontend / Services & Leaderboard Components
- **Status**: Enriched — Ready for `/opsx-ff`
- **Priority**: High
- **Depends On**: `US-01`, `US-04`, `US-05`, `US-06`
- **Blocks**: None (Completes MVP)
- **Branch Name**: `feature/US-07-leaderboard-frontend-integration`

### User Story
**As a** player,  
**I want** the web application to load and display the live Top 5 leaderboard from the PostgreSQL backend on startup, prompt me for my name when a game ends with a qualifying Top 5 score, submit my score via `POST /api/scores`, and immediately update and highlight my rank in the Top 5 table,  
**So that** my high scores are persisted and visible across browser sessions.

### Scope Boundaries
- **In Scope**:
  - Frontend HTTP service `scoreService.ts` calling `GET /api/scores` and `POST /api/scores`.
  - Live `LeaderboardPanel` component rendering always 5 rows (populated entries + `-` placeholder rows for remaining slots, loading state, non-blocking error banner, and highlighted row for a newly saved score).
  - `ScoreSubmissionModal` component triggered on `GAME_OVER` when `isScoreEligibleForTopFive(score, leaderboard)` is `true` and the score has not yet been submitted for the current game.
  - Client-side validation (`1..30` trimmed characters, no `<` or `>` characters) and double-submit protection (`isSubmitting`).
- **Out of Scope**:
  - Core snake mechanics (`US-02`..`US-04`) and backend database implementation (`US-05`..`US-06`).

### Functional Requirements

#### FR-1: Initial Leaderboard Load & 5-Row Display
- On `SnakeGame` mount, invoke `scoreService.getTopScores()`.
- Always render exactly 5 rows (`rank` `1` through `5`) inside `LeaderboardPanel`:
  - Populated slots show `#rank`, `playerName`, and `score`.
  - Unfilled slots (`leaderboard.length < 5`) render `#rank`, `-`, `-`.
- If `GET /api/scores` fails, display a non-blocking warning (`"Unable to load leaderboard"`) while allowing the player to start and play the game normally.

#### FR-2: Eligibility Detection on Game Over
- Helper function `isScoreEligibleForTopFive(score: number, leaderboard: ScoreItem[]): boolean`:
  - Returns `false` if `score < 100` or `score % 100 !== 0`.
  - Returns `true` if `leaderboard.length < 5`.
  - Returns `score > leaderboard[4].score` when `leaderboard.length >= 5`.
- When `status` transitions to `'GAME_OVER'` and `isScoreEligibleForTopFive(score, leaderboard)` is `true` and `!hasSubmittedScore`:
  - Open `ScoreSubmissionModal` (`data-testid="score-submission-modal"`).

#### FR-3: Score Submission Flow
- Inside `ScoreSubmissionModal`:
  - Text input (`data-testid="player-name-input"`, `maxLength={30}`, auto-focused) and Submit button (`data-testid="submit-score-button"`).
  - Pressing `Enter` or clicking `Submit` validates trimmed `playerName` (`1..30` chars, no `<` or `>`).
  - While the `POST /api/scores` request is in flight, disable the input and Submit button (`isSubmitting = true`).
  - On `201 Created` (`response.saved === true`):
    - Update `leaderboard` state directly from `response.leaderboard`.
    - Set `highlightedScoreId = response.entry.id`.
    - Set `hasSubmittedScore = true` and close the modal.
  - On `200 OK` (`response.saved === false`, e.g., another player took the spot concurrently):
    - Update `leaderboard` from `response.leaderboard`, close the modal, and show info notice `"Score no longer qualifies for Top 5"`.
  - On network/validation error (`400` or `500`):
    - Keep modal open, re-enable Submit button, and display the error message (`data-testid="submit-score-error"`).

#### FR-4: Reset Clears Submission State
- Clicking `Reset` resets `hasSubmittedScore = false`, `submitError = null`, and closes the modal if open.

### Required Endpoints Structure & URLs
Base URL configured via `process.env.REACT_APP_API_URL || 'http://localhost:3000'`:
- `GET {API_BASE_URL}/api/scores` → returns `{ data: ScoreItem[] }` (`200 OK`).
- `POST {API_BASE_URL}/api/scores` with body `{ playerName: string, score: number }` → returns `SubmitScoreResponse` (`201 Created` or `200 OK`).

### Fields & Frontend Data Model

```typescript
// frontend/src/services/scoreService.ts
export interface ScoreItem {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
}

export interface SubmitScoreResponse {
  saved: boolean;
  rank: number | null;
  entry: ScoreItem | null;
  message?: string;
  leaderboard: ScoreItem[];
}

export interface LeaderboardState {
  items: ScoreItem[];
  isLoading: boolean;
  loadError: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  hasSubmitted: boolean;
  highlightedScoreId: string | null;
}
```

### Files & Modules to Create / Modify
Aligned with `docs/frontend-standards.md`:

```text
frontend/src/
├── services/
│   ├── scoreService.ts                                   # getTopScores(), submitScore(playerName, score)
│   └── scoreService.test.ts                              # Unit tests with mocked axios/fetch
├── game/
│   ├── leaderboardUtils.ts                               # isScoreEligibleForTopFive, validatePlayerName
│   └── leaderboardUtils.test.ts                          # Unit tests for eligibility & name validation
└── components/
    ├── LeaderboardPanel/
    │   ├── LeaderboardPanel.tsx                          # Renders 5 rows, loading state, error banner, highlight
    │   └── LeaderboardPanel.test.tsx                     # Component tests for 0, 3, and 5 scores + error state
    ├── ScoreSubmissionModal/
    │   ├── ScoreSubmissionModal.tsx                      # High score form modal with validation & loading lock
    │   └── ScoreSubmissionModal.test.tsx                 # Modal input, validation, submit & error tests
    └── SnakeGame/
        ├── SnakeGame.tsx                                 # Connect leaderboard lifecycle with GAME_OVER & RESET
        └── SnakeGame.test.tsx                            # Full integration test of game over -> submit -> leaderboard update
```

### Acceptance Criteria (Gherkin)

#### Scenario 1: Fetching and Rendering Top 5 on Page Load
- **GIVEN** `GET /api/scores` returns 3 scores (`[900, 600, 300]`)
- **WHEN** `SnakeGame` mounts
- **THEN** `LeaderboardPanel` renders ranks `#1` (`900`), `#2` (`600`), `#3` (`300`), and placeholder rows (`-`) for `#4` and `#5`.

#### Scenario 2: Qualifying Score Opens Submission Modal on Game Over
- **GIVEN** the current 5th place score is `200` (or fewer than 5 scores exist) and the player reaches `score = 300`
- **WHEN** the snake collides with a wall or itself (`status === 'GAME_OVER'`)
- **THEN** `ScoreSubmissionModal` opens automatically with focus on `player-name-input`.

#### Scenario 3: Successful Score Submission Updates Top 5 Table
- **GIVEN** `ScoreSubmissionModal` is open for a `300`-point game
- **WHEN** the player enters `"Maria"` and clicks `Submit`
- **THEN** `POST /api/scores` is called with `{ "playerName": "Maria", "score": 300 }`
- **AND** the modal closes upon receiving `201 Created`
- **AND** `LeaderboardPanel` immediately displays `"Maria"` with `300` points highlighted as the new entry.

#### Scenario 4: Non-Qualifying Score Does Not Prompt Modal
- **GIVEN** the Top 5 scores are `[1000, 800, 600, 500, 400]` and the player finishes with `score = 200` (or `score = 0`)
- **WHEN** the game transitions to `GAME_OVER`
- **THEN** `ScoreSubmissionModal` does NOT open
- **AND** only the standard Game Over overlay and `Reset` button are displayed.

#### Scenario 5: Backend Unreachable Does Not Block Gameplay
- **GIVEN** `GET /api/scores` fails with a network error on initial load
- **WHEN** the player clicks `Start`
- **THEN** the error banner is shown inside `LeaderboardPanel`, but the Snake game starts and plays normally.

### Non-Functional Requirements
- **Resilience**: Network failures on leaderboard fetch/submit must never crash the React tree or block local gameplay.
- **Security**: Strip/reject `<` and `>` characters on the client before sending, and render all player names via React text nodes (never `dangerouslySetInnerHTML`).
- **Idempotency**: Disable the Submit button immediately on click so rapid clicks cannot send duplicate `POST /api/scores` requests.

### Documentation & Testing Updates
- **Unit & Component Tests**: Jest + React Testing Library for `scoreService`, `leaderboardUtils`, `LeaderboardPanel`, `ScoreSubmissionModal`, and `SnakeGame` (≥ 90% coverage).
- **E2E Verification (Playwright MCP)**: Full end-to-end browser test executed by the agent verifying page load, gameplay, Game Over, modal submission, Top 5 table update, and post-test PostgreSQL state restoration.

### Definition of Done (DoD)
- [ ] Step 0: Feature branch `feature/US-07-leaderboard-frontend-integration` created.
- [ ] Unit, service, and component tests written first (TDD) and passing with ≥ 90% coverage.
- [ ] Step N+1: Unit tests and DB baseline verification executed by the agent with report in `openspec/changes/<change-name>/reports/`.
- [ ] Step N+3: Playwright MCP E2E test executed autonomously by the agent, including database cleanup to restore pre-test state.
- [ ] Step N+4: `docs/development_guide.md` updated with complete full-stack startup instructions.
