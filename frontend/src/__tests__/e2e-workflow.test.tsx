import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../game/constants';
import * as boardRenderer from '../game/boardRenderer';

describe('E2E Application Workflow', () => {
  it('executes full interactive user flow: page load -> verify elements -> start game -> reset game', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Verify canvas board rendering and dimensions
    const canvas = screen.getByTestId('game-board-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveStyle({
      width: `${BOARD_WIDTH}px`,
      height: `${BOARD_HEIGHT}px`,
    });

    // 2. Verify score display
    const scoreVal = screen.getByTestId('score-value');
    expect(scoreVal).toHaveTextContent('0');

    // 3. Verify Top 5 Leaderboard container with 5 placeholder rows
    const leaderboard = screen.getByTestId('leaderboard-panel');
    expect(leaderboard).toBeInTheDocument();
    for (let rank = 1; rank <= 5; rank++) {
      const row = screen.getByTestId(`leaderboard-row-${rank}`);
      expect(row).toBeInTheDocument();
      expect(row).toHaveTextContent(`#${rank}`);
      expect(row).toHaveTextContent('-');
    }

    // 4. Verify Start and Reset buttons initial state
    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');
    expect(startBtn).toBeEnabled();
    expect(resetBtn).toBeEnabled();

    // 5. Click Start button -> verify it becomes disabled and loses focus
    await user.click(startBtn);
    expect(startBtn).toBeDisabled();
    expect(startBtn).not.toHaveFocus();

    // 6. Click Reset button -> verify Start is re-enabled and score reads 0
    await user.click(resetBtn);
    expect(startBtn).toBeEnabled();
    expect(startBtn).not.toHaveFocus();
    expect(scoreVal).toHaveTextContent('0');
  });

  it('executes full snake gameplay cycle: Start -> Automatic ticks -> Arrow navigation -> Reset', () => {
    jest.useFakeTimers();
    const drawSnakeSpy = jest.spyOn(boardRenderer, 'drawSnake');

    render(<App />);

    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');

    // 1. Click start
    fireEvent.click(startBtn);
    expect(startBtn).toBeDisabled();

    // 2. Advance 1 tick (150ms) -> moves from {30, 60} to {60, 60}
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 60, y: 60 }]);

    // 3. Steer DOWN with keyboard arrow key
    fireEvent.keyDown(window, { key: 'ArrowDown', cancelable: true });

    // 4. Next tick (150ms) -> moves to {60, 90}
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 60, y: 90 }]);

    // 5. Try direct 180° turn (ArrowUp while moving DOWN) -> must be ignored
    fireEvent.keyDown(window, { key: 'ArrowUp', cancelable: true });
    act(() => {
      jest.advanceTimersByTime(150);
    });
    // Continues moving DOWN to {60, 120}
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 60, y: 120 }]);

    // 6. Reset game -> restores initial spawn position {30, 60} and enables Start button
    fireEvent.click(resetBtn);
    expect(startBtn).toBeEnabled();
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [{ x: 30, y: 60 }]);

    jest.clearAllTimers();
    jest.useRealTimers();
    drawSnakeSpy.mockRestore();
  });
});

