## ADDED Requirements

### Requirement: Grid-Aligned Game Arena Rendering
The system SHALL render a visible game arena in the web browser structured as a grid of `30px × 30px` cells with default dimensions of `150px × 150px` (`5` columns by `5` rows), a dark background (`#111827`), visible cell grid lines (`#1f2937`), and outer boundary walls (`#f9fafb`).

#### Scenario: Initial board rendering on page load
- **WHEN** a user opens the web application in a browser
- **THEN** the system renders a `150px × 150px` game board divided into a `5 × 5` grid of `30px × 30px` cells with visible outer walls and `role="img"` accessibility labeling

#### Scenario: Crisp rendering on high-DPI displays
- **WHEN** the application is viewed on a display with `devicePixelRatio > 1`
- **THEN** the canvas backing store scales proportionally while preserving the `150px × 150px` CSS layout size

### Requirement: Game Lifecycle Control Panel
The system SHALL provide a `Start` button and a `Reset` button that control the game status across `IDLE`, `RUNNING`, and `GAME_OVER` states, and SHALL release keyboard focus from clicked buttons immediately so subsequent keyboard presses do not accidentally re-trigger button clicks.

#### Scenario: Starting a game from IDLE state
- **WHEN** the game status is `IDLE` and the player clicks the `Start` button
- **THEN** the game status transitions to `RUNNING`, the `Start` button becomes disabled, and the `Start` button loses keyboard focus

#### Scenario: Resetting a running game
- **WHEN** the game status is `RUNNING` and the player clicks the `Reset` button
- **THEN** the game status transitions to `IDLE`, the score resets to `0`, the `Start` button becomes enabled, and the `Reset` button loses keyboard focus

#### Scenario: Resetting after Game Over
- **WHEN** the game status is `GAME_OVER` with the Game Over overlay visible and the player clicks the `Reset` button
- **THEN** the Game Over overlay is hidden, the game status transitions to `IDLE`, the score resets to `0`, and the `Start` button becomes enabled

#### Scenario: Preventing Start directly from Game Over without Reset
- **WHEN** the game status is `GAME_OVER`
- **THEN** the `Start` button remains disabled until the player clicks the `Reset` button

### Requirement: Live Score Indicator
The system SHALL display a live score indicator initialized to `0` on application load and updated whenever the game score changes or is reset.

#### Scenario: Score indicator on initial load
- **WHEN** the application finishes loading in `IDLE` state
- **THEN** the score indicator displays `0` inside an accessible polite live region (`aria-live="polite"`)

### Requirement: Game Over Overlay Notification
The system SHALL display a Game Over overlay over the board whenever the game status enters `GAME_OVER`, showing the player's final score and instructions to reset.

#### Scenario: Displaying Game Over overlay
- **WHEN** the game status transitions to `GAME_OVER`
- **THEN** an overlay is rendered over the game arena displaying `Game Over`, the final score value, and a prompt to press `Reset`

### Requirement: Top 5 Leaderboard Shell Container
The system SHALL display a `Top 5 Leaderboard` panel on the page containing 5 ranked slots (`#1` through `#5`).

#### Scenario: Initial leaderboard placeholder display
- **WHEN** the application loads prior to leaderboard API integration
- **THEN** the `Top 5 Leaderboard` panel renders 5 ranked rows (`#1` to `#5`) with placeholder values (`-`) and performs zero network requests

