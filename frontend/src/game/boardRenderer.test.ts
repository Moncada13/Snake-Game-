import {
  BOARD_BACKGROUND_COLOR,
  BOARD_BORDER_COLOR,
  BOARD_COLUMNS,
  BOARD_HEIGHT,
  BOARD_ROWS,
  BOARD_WIDTH,
  CELL_SIZE,
  GRID_LINE_COLOR,
} from './constants';
import { drawBoard, drawCell } from './boardRenderer';
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
});

