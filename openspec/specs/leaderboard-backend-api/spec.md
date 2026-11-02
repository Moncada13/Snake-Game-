# leaderboard-backend-api Specification

## Purpose

Provides RESTful HTTP endpoints (`GET /api/scores` and `POST /api/scores`) for retrieving the Top 5 leaderboard and validating and persisting qualifying player scores with XSS protection and deterministic HTTP status codes.

## Requirements

### Requirement: Retrieve Top 5 Leaderboard via GET /api/scores
The backend API SHALL expose `GET /api/scores` returning HTTP `200 OK` with a JSON object `{ "data": [...] }` containing at most 5 ranked score entries ordered by `score DESC`, `createdAt ASC`, and `id ASC`, where each entry includes `id`, `rank` (`1..5`), `playerName`, `score`, and ISO-8601 `createdAt`.

#### Scenario: Fetching leaderboard entries
- **WHEN** a client sends a `GET /api/scores` request
- **THEN** the server responds with status `200 OK` and `{ "data": [...] }` containing up to 5 ranked score objects

### Requirement: Submit Qualifying Score via POST /api/scores
When a client sends a valid `POST /api/scores` payload whose score qualifies for the Top 5 (`count < 5` or `score > fifthPlace.score`), the backend API SHALL persist the score and respond with HTTP `201 Created` containing `saved: true`, the assigned `rank` (`1..5`), the created `entry`, and the updated 5-item `leaderboard`.

#### Scenario: Qualifying score is saved and returns 201 Created
- **WHEN** the leaderboard has fewer than 5 scores (or the 5th-place score is below 700) and a client sends `POST /api/scores` with `{ "playerName": "Elena", "score": 700 }`
- **THEN** the server responds with status `201 Created`, `saved: true`, `rank` between 1 and 5, the created `entry`, and the updated `leaderboard`

### Requirement: Non-Qualifying Valid Score Response on POST /api/scores
When a client sends a valid `POST /api/scores` payload whose score does not qualify for the Top 5 (`count === 5` and `score <= fifthPlace.score`), the backend API SHALL NOT modify the database and SHALL respond with HTTP `200 OK` containing `saved: false`, `rank: null`, `entry: null`, `message: "Score does not qualify for Top 5"`, and the unchanged `leaderboard`.

#### Scenario: Non-qualifying score returns 200 OK without saving
- **WHEN** the leaderboard already has 5 scores with a 5th-place score of 500 and a client sends `POST /api/scores` with `{ "playerName": "Elena", "score": 300 }`
- **THEN** the server responds with status `200 OK`, `saved: false`, `rank: null`, `entry: null`, `message: "Score does not qualify for Top 5"`, and the unchanged 5-entry `leaderboard`

### Requirement: Payload Validation and XSS Rejection on POST /api/scores
The backend API SHALL validate `POST /api/scores` payloads before calling the repository, requiring `playerName` to be a string of 1 to 30 trimmed characters without HTML angle brackets (`<` or `>`) and `score` to be an integer multiple of 100 between 100 and 100,000, returning HTTP `400 Bad Request` with `{ "error": "ValidationError", "message": "Invalid score submission payload", "details": [...] }` on any violation.

#### Scenario: Invalid playerName or score returns 400 Bad Request
- **WHEN** a client sends `POST /api/scores` with an empty name, a name over 30 characters, a name containing `<script>`, a score of 0, a negative score, a score over 100,000, or a score not divisible by 100 (such as 250)
- **THEN** the server responds with status `400 Bad Request`, `error: "ValidationError"`, and a non-empty `details` array without invoking the repository

### Requirement: Safe Error Handling on Unexpected Failures
When an unexpected repository or runtime failure occurs while handling `GET /api/scores` or `POST /api/scores`, the backend API SHALL log the error and return HTTP `500 Internal Server Error` with `{ "error": "InternalServerError", "message": "An unexpected error occurred while processing the score" }` without leaking internal stack traces.

#### Scenario: Unexpected repository failure returns 500 Internal Server Error
- **WHEN** the score repository throws an unexpected database error during `GET /api/scores` or `POST /api/scores`
- **THEN** the server responds with status `500 Internal Server Error` and `{ "error": "InternalServerError", "message": "An unexpected error occurred while processing the score" }`

