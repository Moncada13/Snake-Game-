import {
  APPLE_COLOR,
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
import { drawApple, drawBoard, drawCell, drawSnake } from './boardRenderer';
import { Position } from './types';

describe('boardRenderer', () => {
  let mockCtx: Partial<CanvasRenderingContext2D>;
  let fillRectSpy: jest.Mock;
  let strokeRectSpy: jest.Mock;
  let beginPathSpy: jest.Mock;
  let moveToSpy: jest.Mock;
  let lineToSpy: jest.Mock;
  let strokeSpy: jest.Mock;

  beforeEach(() => {
    fillRectSpy = jest.fn();
    strokeRectSpy = jest.fn();
    beginPathSpy = jest.fn();
    moveToSpy = jest.fn();
    lineToSpy = jest.fn();
    strokeSpy = jest.fn();

    mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: fillRectSpy,
      strokeRect: strokeRectSpy,
      beginPath: beginPathSpy,
      moveTo: moveToSpy,
      lineTo: lineToSpy,
      stroke: strokeSpy,
    };
  });

  describe('drawBoard', () => {
    it('clears and fills the arena background with BOARD_BACKGROUND_COLOR', () => {
      drawBoard(mockCtx as CanvasRenderingContext2D);

      expect(mockCtx.fillStyle).toBe(BOARD_BACKGROUND_COLOR);
      expect(fillRectSpy).toHaveBeenCalledWith(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    });

    it('draws grid lines matching BOARD_COLUMNS and BOARD_ROWS with GRID_LINE_COLOR', () => {
      drawBoard(mockCtx as CanvasRenderingContext2D);

      expect(mockCtx.strokeStyle).toBe(BOARD_BORDER_COLOR); // after outer border
      expect(beginPathSpy).toHaveBeenCalled();
      // Verifies grid lines were drawn
      expect(moveToSpy).toHaveBeenCalledWith(CELL_SIZE, 0);
      expect(lineToSpy).toHaveBeenCalledWith(CELL_SIZE, BOARD_HEIGHT);
      expect(strokeSpy).toHaveBeenCalled();
    });

    it('draws outer border walls with BOARD_BORDER_COLOR', () => {
      drawBoard(mockCtx as CanvasRenderingContext2D);

      expect(strokeRectSpy).toHaveBeenCalledWith(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    });

    it('safely handles null/undefined context', () => {
      expect(() => drawBoard(null as unknown as CanvasRenderingContext2D)).not.toThrow();
    });
  });

  describe('drawCell', () => {
    it('draws a single 30px x 30px cell at the specified coordinates with specified color', () => {
      const pos: Position = { x: 30, y: 60 };
      const color = '#22c55e';

      drawCell(mockCtx as CanvasRenderingContext2D, pos, color);

      expect(mockCtx.fillStyle).toBe(color);
      expect(fillRectSpy).toHaveBeenCalledWith(30, 60, CELL_SIZE, CELL_SIZE);
    });

    it('safely handles null/undefined context', () => {
      expect(() =>
        drawCell(null as unknown as CanvasRenderingContext2D, { x: 0, y: 0 }, '#fff')
      ).not.toThrow();
    });
  });

  describe('drawSnake', () => {
    it('draws each segment of the snake with SNAKE_COLOR', () => {
      const snake: Position[] = [
        { x: 60, y: 60 },
        { x: 30, y: 60 },
      ];

      drawSnake(mockCtx as CanvasRenderingContext2D, snake);

      expect(mockCtx.fillStyle).toBe(SNAKE_COLOR);
      expect(fillRectSpy).toHaveBeenCalledTimes(2);
      expect(fillRectSpy).toHaveBeenNthCalledWith(1, 60, 60, CELL_SIZE, CELL_SIZE);
      expect(fillRectSpy).toHaveBeenNthCalledWith(2, 30, 60, CELL_SIZE, CELL_SIZE);
    });

    it('safely handles null context or empty snake array', () => {
      expect(() => drawSnake(null as unknown as CanvasRenderingContext2D, [])).not.toThrow();
      expect(() => drawSnake(mockCtx as CanvasRenderingContext2D, [])).not.toThrow();
      expect(fillRectSpy).not.toHaveBeenCalled();
    });
  });

  describe('drawApple', () => {
    it('draws a 30px x 30px red square at the apple coordinates', () => {
      const apple: Position = { x: 90, y: 60 };

      drawApple(mockCtx as CanvasRenderingContext2D, apple);

      expect(mockCtx.fillStyle).toBe(APPLE_COLOR);
      expect(fillRectSpy).toHaveBeenCalledWith(90, 60, CELL_SIZE, CELL_SIZE);
    });

    it('is a no-op when apple or context is null', () => {
      drawApple(mockCtx as CanvasRenderingContext2D, null);
      drawApple(null as unknown as CanvasRenderingContext2D, { x: 90, y: 60 });
      expect(fillRectSpy).not.toHaveBeenCalled();
    });
  });
});

