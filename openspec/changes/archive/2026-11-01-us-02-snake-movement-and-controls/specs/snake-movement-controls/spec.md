# Spec Delta

## Purpose

Enables autonomous continuous snake movement and responsive keyboard steering within the 150px x 150px game arena without illegal instant 180-degree self-reversals.

## ADDED Requirements

### Requirement: Initial Snake Spawn
The game engine SHALL initialize the snake with a single 30px x 30px segment positioned at grid cell (x: 30, y: 60) facing the RIGHT direction whenever entering IDLE state or executing a RESET action.

#### Scenario: Snake spawned on initial load or reset
- **WHEN** the player visits the game or clicks the Reset button
- **THEN** the snake body contains exactly one segment at { x: 30, y: 60 }, with direction set to RIGHT and status set to IDLE

### Requirement: Automatic Tick Movement
While the game status is RUNNING, the game engine SHALL advance the snake head position by exactly 30px in the current active direction every 150ms tick interval, shifting any body segments forward.

#### Scenario: Snake moves automatically across ticks
- **WHEN** the game is RUNNING and 150ms has elapsed since the previous tick
- **THEN** the snake head advances 30px forward in the active direction and renders at the new grid coordinate

#### Scenario: Game loop stops when paused or reset
- **WHEN** the game transitions from RUNNING to IDLE or GAME_OVER
- **THEN** the automatic tick timer is cleared and the snake ceases movement immediately

### Requirement: Keyboard Arrow Steering
The game SHALL capture ArrowUp, ArrowDown, ArrowLeft, and ArrowRight keydown events to steer the snake, preventing default browser viewport scrolling.

#### Scenario: Steer snake to an orthogonal direction
- **WHEN** the game is RUNNING with direction set to RIGHT and the user presses ArrowDown
- **THEN** default browser scroll is prevented and the queued next direction becomes DOWN for the upcoming tick

### Requirement: 180-Degree Reversal Prevention
The game engine SHALL ignore any arrow key input that directly opposes the direction committed on the most recent tick, preventing self-reversal collisions.

#### Scenario: Direct 180-degree turn attempt is rejected
- **WHEN** the snake is moving RIGHT and the user presses ArrowLeft
- **THEN** the input is ignored and the snake continues moving RIGHT on the next tick

#### Scenario: Rapid sequential keypress anti-glitch
- **WHEN** the snake is moving RIGHT and the user rapidly presses ArrowUp followed immediately by ArrowLeft within the same tick interval
- **THEN** ArrowUp queues UP, and ArrowLeft is rejected as an illegal reversal against the committed direction RIGHT, causing the snake to safely turn UP on the next tick

### Requirement: Canvas Snake Segment Rendering
The rendering system SHALL draw all segments of the active snake on the 150px x 150px canvas as solid 30px x 30px green blocks with high-DPI crispness.

#### Scenario: Render green snake on canvas
- **WHEN** the game board renders while the snake is at position { x: 30, y: 60 }
- **THEN** a 30px x 30px rectangle is filled with color #22c55e at pixel coordinates (30, 60)

