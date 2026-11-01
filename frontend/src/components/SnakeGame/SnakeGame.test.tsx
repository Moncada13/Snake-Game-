import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SnakeGame } from './SnakeGame';
import * as boardRenderer from '../../game/boardRenderer';

describe('SnakeGame Root Component Integration', () => {
  let drawSnakeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(boardRenderer, 'drawBoard').mockImplementation(() => {});
    drawSnakeSpy = jest.spyOn(boardRenderer, 'drawSnake').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders initial game interface in IDLE status with score 0 and enabled Start button', () => {
    render(<SnakeGame />);

    expect(screen.getByRole('heading', { name: /snake game/i })).toBeInTheDocument();
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('start-button')).toBeEnabled();
    expect(screen.getByTestId('reset-button')).toBeEnabled();
    expect(screen.getByTestId('game-board-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-panel')).toBeInTheDocument();
  });

  it('clicking Start transitions the game to RUNNING and disables the Start button', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    expect(startBtn).toBeEnabled();

    fireEvent.click(startBtn);

    expect(startBtn).toBeDisabled();
    expect(screen.getByTestId('reset-button')).toBeEnabled();
  });

  it('clicking Reset during RUNNING re-enables Start and resets score to 0', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');

    fireEvent.click(startBtn);
    expect(startBtn).toBeDisabled();

    fireEvent.click(resetBtn);
    expect(startBtn).toBeEnabled();
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
  });

  it('advances snake automatically on tick while RUNNING', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    fireEvent.click(startBtn);

    // Initial position rendered
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 30, y: 60 }]);

    // Advance 1 tick (150ms)
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Moved right to x: 60
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 60, y: 60 }]);
  });

  it('steers snake with arrow keys and updates movement on next tick', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    fireEvent.click(startBtn);

    // Press ArrowDown
    fireEvent.keyDown(window, { key: 'ArrowDown', cancelable: true });

    // Tick fires
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Moved down from {30, 60} to {30, 90}
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 30, y: 90 }]);
  });
});
