# food-scoring-and-growth Specification

## Purpose

Manages random unoccupied-cell apple generation, head-to-apple consumption detection, +100 score increments, +1 segment snake growth, and red apple canvas rendering.

## Requirements

### Requirement: Unoccupied-Cell Apple Spawning
The game engine SHALL spawn a 30px x 30px apple on a randomly selected grid cell within the 150px x 150px arena that is not currently occupied by any segment of the snake.

#### Scenario: Apple spawned on an unoccupied grid coordinate
- **WHEN** the game starts, resets, or an existing apple is consumed
- **THEN** a new apple is positioned at grid coordinates (x, y) in {0, 30, 60, 90, 120} that do not overlap any segment of the snake

### Requirement: Apple Consumption and Score Increment
When the snake's next head coordinate matches the active apple coordinate on a game tick, the game engine SHALL increment the player's score by 100 points.

#### Scenario: Eating an apple adds 100 points to the score
- **WHEN** the game is RUNNING and the snake head moves onto the exact coordinates of the apple
- **THEN** the current score increases by 100 points and the ScoreBoard updates immediately

### Requirement: Snake Growth Upon Consumption
When the snake consumes an apple on a game tick, the game engine SHALL retain the tail segment instead of removing it, increasing the snake's length by one 30px x 30px segment.

#### Scenario: Snake elongates by one segment when eating
- **WHEN** a snake of length N moves onto an apple coordinate on a tick
- **THEN** the snake length becomes N + 1 segments and preserves that new length on subsequent non-eating ticks

### Requirement: Immediate Apple Respawn and Full-Board Victory
Immediately after an apple is consumed and the snake grows, the game engine SHALL spawn a new apple on the remaining unoccupied cells, or transition to GAME_OVER if all 25 cells of the arena are occupied.

#### Scenario: New apple spawns after eating when empty cells exist
- **WHEN** the snake eats an apple and fewer than 25 cells are occupied by the grown snake
- **THEN** a new apple is immediately placed on one of the remaining free cells

#### Scenario: Game ends when snake fills all 25 cells of the board
- **WHEN** a 24-segment snake eats the apple on the 25th and final available grid cell
- **THEN** the score increments by 100, the apple state becomes null, and the game status transitions to GAME_OVER

### Requirement: Canvas Red Apple Rendering
The rendering system SHALL draw the active apple on the 150px x 150px canvas as a solid 30px x 30px red block (#ef4444).

#### Scenario: Render red apple on canvas
- **WHEN** the game board renders while an active apple exists at { x: 90, y: 60 }
- **THEN** a 30px x 30px rectangle is filled with color #ef4444 at pixel coordinates (90, 60)

