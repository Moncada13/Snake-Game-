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

  it('increments score by 100 and elongates snake when eating an apple', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    fireEvent.click(startBtn);

    // Initial snake at {30, 60}, initial apple at {90, 60}, moving RIGHT
    // Advance 2 ticks (300ms): tick 1 -> {60, 60}, tick 2 -> {90, 60} (eats apple!)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('score-value')).toHaveTextContent('100');
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [
      { x: 90, y: 60 },
      { x: 60, y: 60 },
    ]);
  });

  it('detects wall collision, displays Game Over overlay, and recovers on Reset', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');

    fireEvent.click(startBtn);

    // Steer UP from {30, 60}:
    // Tick 1 -> {30, 30}
    // Tick 2 -> {30, 0}
    // Tick 3 -> {30, -30} (top wall collision!)
    fireEvent.keyDown(window, { key: 'ArrowUp', cancelable: true });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    const overlay = screen.getByTestId('game-over-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('data-reason', 'WALL');

    // Click Reset -> overlay disappears and Start button is re-enabled
    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
    expect(startBtn).toBeEnabled();
  });
});
