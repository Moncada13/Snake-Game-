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

describe('Game Constants', () => {
  it('defines correct grid and cell dimensions', () => {
    expect(CELL_SIZE).toBe(30);
    expect(BOARD_COLUMNS).toBe(5);
    expect(BOARD_ROWS).toBe(5);
    expect(BOARD_WIDTH).toBe(150);
    expect(BOARD_HEIGHT).toBe(150);
  });

  it('defines visual color palette', () => {
    expect(SNAKE_COLOR).toBe('#22c55e');
    expect(APPLE_COLOR).toBe('#ef4444');
    expect(BOARD_BACKGROUND_COLOR).toBe('#111827');
    expect(GRID_LINE_COLOR).toBe('#1f2937');
    expect(BOARD_BORDER_COLOR).toBe('#f9fafb');
  });
});

