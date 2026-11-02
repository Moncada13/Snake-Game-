import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameBoard } from './GameBoard';
import * as boardRenderer from '../../game/boardRenderer';

describe('GameBoard Component', () => {
  let drawBoardSpy: jest.SpyInstance;
  let drawSnakeSpy: jest.SpyInstance;
  let drawAppleSpy: jest.SpyInstance;

  beforeEach(() => {
    drawBoardSpy = jest.spyOn(boardRenderer, 'drawBoard').mockImplementation(() => {});
    drawSnakeSpy = jest.spyOn(boardRenderer, 'drawSnake').mockImplementation(() => {});
    drawAppleSpy = jest.spyOn(boardRenderer, 'drawApple').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a canvas with accessibility attributes and dimensions', () => {
    render(<GameBoard status="IDLE" score={0} />);

    const canvas = screen.getByRole('img', { name: /snake game board/i });
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('data-testid', 'game-board-canvas');
  });

  it('calls drawBoard on mount and updates', () => {
    render(<GameBoard status="IDLE" score={0} />);
    expect(drawBoardSpy).toHaveBeenCalled();
  });

  it('calls drawSnake and drawApple with provided snake and apple coordinates', () => {
    const snake = [{ x: 30, y: 60 }];
    const apple = { x: 90, y: 60 };
    render(<GameBoard status="RUNNING" score={0} snake={snake} apple={apple} />);
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), snake);
    expect(drawAppleSpy).toHaveBeenCalledWith(expect.anything(), apple);
  });

  it('handles HiDPI scaling when devicePixelRatio is set to 2 and when falsy', () => {
    const originalDpr = window.devicePixelRatio;
    try {
      window.devicePixelRatio = 2;
      render(<GameBoard status="IDLE" score={0} />);
      expect(drawBoardSpy).toHaveBeenCalled();

      // Test fallback to 1 when devicePixelRatio is 0/falsy
      (window as unknown as { devicePixelRatio: number | undefined }).devicePixelRatio = 0;
      render(<GameBoard status="IDLE" score={0} />);
    } finally {
      window.devicePixelRatio = originalDpr;
    }
  });

  it('safely handles missing 2d canvas context', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    try {
      HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);
      expect(() => render(<GameBoard status="IDLE" score={0} />)).not.toThrow();
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  it('safely handles null canvas ref', () => {
    const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValue({ current: null });
    expect(() => render(<GameBoard status="IDLE" score={0} />)).not.toThrow();
    useRefSpy.mockRestore();
  });

  it('does NOT display the Game Over overlay when status is IDLE or RUNNING', () => {
    const { rerender } = render(<GameBoard status="IDLE" score={0} />);
    expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();

    rerender(<GameBoard status="RUNNING" score={200} />);
    expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
  });

  it('displays the Game Over overlay with final score when status is GAME_OVER', () => {
    render(<GameBoard status="GAME_OVER" score={400} />);

    const overlay = screen.getByTestId('game-over-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveTextContent(/game over/i);
    expect(overlay).toHaveTextContent(/final score:\s*400/i);
    expect(overlay).toHaveTextContent(/press reset to play again/i);
  });
});
