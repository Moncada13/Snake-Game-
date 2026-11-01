import {
  BOARD_BACKGROUND_COLOR,
  BOARD_BORDER_COLOR,
  BOARD_COLUMNS,
  BOARD_HEIGHT,
  BOARD_ROWS,
  BOARD_WIDTH,
  CELL_SIZE,
  GRID_LINE_COLOR,
  SNAKE_COLOR,
} from './constants';
import { Position } from './types';

/**
 * Clears and redraws the game board arena, internal cell grid lines, and outer walls.
 */
export function drawBoard(ctx: CanvasRenderingContext2D): void {
  if (!ctx) return;

  // 1. Fill background
  ctx.fillStyle = BOARD_BACKGROUND_COLOR;
  ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  // 2. Draw cell grid lines
  ctx.strokeStyle = GRID_LINE_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Vertical grid lines
  for (let c = 1; c < BOARD_COLUMNS; c++) {
    const x = c * CELL_SIZE;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, BOARD_HEIGHT);
  }

  // Horizontal grid lines
  for (let r = 1; r < BOARD_ROWS; r++) {
    const y = r * CELL_SIZE;
    ctx.moveTo(0, y);
    ctx.lineTo(BOARD_WIDTH, y);
  }

  ctx.stroke();

  // 3. Draw outer walls/border
  ctx.strokeStyle = BOARD_BORDER_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
}

/**
 * Draws a single grid-aligned cell (e.g. snake segment or apple) with the specified color.
 */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  position: Position,
  color: string
): void {
  if (!ctx) return;

  ctx.fillStyle = color;
  ctx.fillRect(position.x, position.y, CELL_SIZE, CELL_SIZE);
}

/**
 * Draws all segments of the snake using the SNAKE_COLOR (#22c55e).
 */
export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Position[]
): void {
  if (!ctx || !snake || snake.length === 0) return;

  for (let i = 0; i < snake.length; i++) {
    drawCell(ctx, snake[i], SNAKE_COLOR);
  }
}

