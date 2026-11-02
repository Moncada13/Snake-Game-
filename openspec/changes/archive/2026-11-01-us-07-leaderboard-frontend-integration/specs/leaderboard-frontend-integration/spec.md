# Spec Delta

## Purpose

Integrates the browser Snake game with the backend leaderboard API, rendering the live 5-slot Top 5 leaderboard with offline resilience, detecting Top-5 qualification on Game Over, and providing a score submission modal with real-time leaderboard highlighting.

## ADDED Requirements

### Requirement: Initial Leaderboard Fetch and 5-Slot Display
On mount, the frontend application SHALL fetch the Top 5 scores via `GET /api/scores` and always render 5 ranked rows (`#1` through `#5`) in the Leaderboard panel, displaying each returned entry's player name and score and rendering `-` placeholders for any unfilled slots (`leaderboard.length < 5`).

#### Scenario: Rendering 3 returned scores with 2 placeholder slots
- **WHEN** `GET /api/scores` returns 3 scores (`[900, 600, 300]`) on page load
- **THEN** the Leaderboard panel renders ranks `#1` (`900`), `#2` (`600`), and `#3` (`300`) with player names and scores, and renders `#4` and `#5` with `-` placeholders

#### Scenario: Backend unreachable on initial load does not block gameplay
- **WHEN** `GET /api/scores` fails with a network error on initial load and the player clicks `Start`
- **THEN** a non-blocking warning (`"Unable to load leaderboard"`) is displayed in the Leaderboard panel while the Snake game starts and plays normally

### Requirement: Top-5 Qualification Detection on Game Over
When the game transitions to `GAME_OVER`, the frontend SHALL evaluate whether the player's final score qualifies for the Top 5 (`score >= 100`, `score % 100 === 0`, and either `leaderboard.length < 5` or `score > leaderboard[4].score`) and open the Score Submission Modal only when the score qualifies and has not yet been submitted for the current game.

#### Scenario: Qualifying score opens Score Submission Modal on Game Over
- **WHEN** the game transitions to `GAME_OVER` with `score = 300` and fewer than 5 leaderboard entries exist (or the 5th-place score is below 300)
- **THEN** the Score Submission Modal (`data-testid="score-submission-modal"`) opens automatically with focus on the player name input (`data-testid="player-name-input"`)

#### Scenario: Non-qualifying or zero score does not open Score Submission Modal
- **WHEN** the game transitions to `GAME_OVER` with `score = 0` or with a score less than or equal to the 5th-place leaderboard entry
- **THEN** the Score Submission Modal does NOT open and only the Game Over overlay and `Reset` button are displayed

### Requirement: Score Submission Modal Validation and Double-Submit Prevention
The Score Submission Modal SHALL validate that the trimmed player name is 1 to 30 characters and contains no `<` or `>` characters before calling `POST /api/scores`, SHALL disable the input and Submit button while a request is in flight, and SHALL keep the modal open with an error message (`data-testid="submit-score-error"`) if validation or the network request fails.

#### Scenario: Invalid player name in modal shows validation error without network call
- **WHEN** the Score Submission Modal is open and the player submits an empty name or a name containing `<` or `>`
- **THEN** an error message is rendered in `data-testid="submit-score-error"` and `POST /api/scores` is not called

### Requirement: Post-Submission Leaderboard Sync and Row Highlighting
When `POST /api/scores` succeeds, the frontend SHALL close the Score Submission Modal, update the Leaderboard panel from `response.leaderboard`, highlight the newly saved score row (`highlightedScoreId = response.entry.id`) when `saved === true`, display an info notice (`"Score no longer qualifies for Top 5"`) when `saved === false`, and clear the submission state when `Reset` is clicked.

#### Scenario: Successful score submission updates leaderboard and highlights new entry
- **WHEN** the player submits `"Maria"` for a `300`-point qualifying game and `POST /api/scores` returns `201 Created` with `saved: true`
- **THEN** the Score Submission Modal closes and the Leaderboard panel immediately renders `"Maria"` with `300` points and a highlighted row indicator

#### Scenario: Reset button clears submission state for the next game
- **WHEN** a game has ended and the player clicks the `Reset` button
- **THEN** the game resets to `IDLE`, any open Score Submission Modal closes, and the submission state resets so a subsequent qualifying game can submit a new score

