# Spec Delta

## Purpose

Enforces outer boundary wall collision detection, body self-collision detection with tail-vacating accuracy, game loop termination with in-bounds state freezing on Game Over, and Reset recovery.

## ADDED Requirements

### Requirement: Outer Wall Boundary Collision Detection
The game engine SHALL detect a wall collision whenever the snake's candidate next head coordinate falls outside the arena bounds `[0, BOARD_WIDTH - CELL_SIZE]` horizontally or `[0, BOARD_HEIGHT - CELL_SIZE]` vertically (`x < 0`, `x >= 150`, `y < 0`, or `y >= 150`).

#### Scenario: Right wall collision ends the game
- **WHEN** the game is RUNNING and the snake head at (120, 60) advances RIGHT toward (150, 60)
- **THEN** wall collision is detected, status transitions to GAME_OVER with gameOverReason set to WALL, and the snake remains frozen in bounds at (120, 60)

#### Scenario: Left, top, and bottom wall collisions end the game
- **WHEN** the game is RUNNING and the snake head advances LEFT from x = 0, UP from y = 0, or DOWN from y = 120
- **THEN** wall collision is detected, status transitions to GAME_OVER with gameOverReason set to WALL, and the snake remains frozen at its last valid in-bounds coordinates

### Requirement: Self-Collision Detection With Tail-Vacating Rule
The game engine SHALL detect a self-collision when the candidate next head coordinate matches any active body segment, excluding the current tail segment on non-eating ticks because that tail cell is vacated on the same tick.

#### Scenario: Snake head colliding with an occupied body segment triggers Game Over
- **WHEN** a snake of length 5 or more advances into a coordinate occupied by a non-vacating body segment
- **THEN** self-collision is detected, status transitions to GAME_OVER with gameOverReason set to SELF, and the snake and score remain frozen

#### Scenario: Snake head moving into the vacating tail cell continues running
- **WHEN** a snake moves into the coordinate currently occupied by its last tail segment on a tick where no apple is eaten
- **THEN** the tail vacates that cell simultaneously, no self-collision is triggered, and the game continues in RUNNING status

### Requirement: Game Over State Freezing and Overlay Presentation
When a wall collision, self-collision, or full-board condition occurs, the system SHALL halt the game tick loop immediately, lock the player's final score, and display the Game Over overlay with a prompt to reset.

#### Scenario: Game Over halts tick progression and shows overlay
- **WHEN** the game transitions to GAME_OVER status
- **THEN** subsequent TICK actions are ignored, the Game Over overlay is rendered with the locked final score, and no snake segment is drawn outside the 150px x 150px board

### Requirement: Reset Recovery From Game Over
When the player triggers Reset from the GAME_OVER state, the system SHALL clear the Game Over reason, reset the score to 0, restore the initial 1-segment snake at (30, 60) facing RIGHT, spawn a fresh unoccupied apple, and transition to IDLE.

#### Scenario: Clicking Reset after a collision restores initial idle state
- **WHEN** the game is in GAME_OVER status with a non-zero score and a non-null gameOverReason and the player clicks the Reset button
- **THEN** status becomes IDLE, score resets to 0, gameOverReason becomes null, and the Game Over overlay is hidden

