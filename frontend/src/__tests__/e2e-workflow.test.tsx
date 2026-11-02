import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../game/constants';
import * as boardRenderer from '../game/boardRenderer';
import { scoreService } from '../services/scoreService';

describe('E2E Application Workflow', () => {
  beforeEach(() => {
    jest.spyOn(scoreService, 'getTopScores').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('executes apple consumption E2E cycle: Start -> Eat apple -> Score +100 -> Grow snake to 2 segments -> Respawn apple', () => {
    jest.useFakeTimers();
    const drawSnakeSpy = jest.spyOn(boardRenderer, 'drawSnake');
    const drawAppleSpy = jest.spyOn(boardRenderer, 'drawApple');

    render(<App />);

    const startBtn = screen.getByTestId('start-button');
    const scoreVal = screen.getByTestId('score-value');

    expect(scoreVal).toHaveTextContent('0');
    expect(drawAppleSpy).toHaveBeenCalledWith(expect.anything(), { x: 90, y: 60 });

    // Start game
    fireEvent.click(startBtn);

    // Advance 2 ticks (300ms): {30,60} -> {60,60} -> {90,60} (consumes apple at {90,60})
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Verify score increased by 100
    expect(scoreVal).toHaveTextContent('100');

    // Verify snake grew to 2 segments
    const grownSnake = [
      { x: 90, y: 60 },
      { x: 60, y: 60 },
    ];
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), grownSnake);

    // Verify newly respawned apple is non-null and does not overlap any segment of the grown snake
    const lastDrawAppleCall = drawAppleSpy.mock.calls[drawAppleSpy.mock.calls.length - 1];
    const respawnedApple = lastDrawAppleCall[1];
    expect(respawnedApple).not.toBeNull();
    expect(grownSnake).not.toContainEqual(respawnedApple);

    jest.clearAllTimers();
    jest.useRealTimers();
    drawSnakeSpy.mockRestore();
    drawAppleSpy.mockRestore();
  });

  it('executes wall collision & Game Over E2E cycle: Start -> Eat apple (+100) -> Hit right wall -> Game Over overlay locks score -> Reset recovers', () => {
    jest.useFakeTimers();
    const drawSnakeSpy = jest.spyOn(boardRenderer, 'drawSnake');

    render(<App />);

    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');
    const scoreVal = screen.getByTestId('score-value');

    // 1. Start game at {30, 60} moving RIGHT, apple at {90, 60}
    fireEvent.click(startBtn);

    // 2. Advance 4 ticks (600ms):
    // Tick 1: {60, 60}
    // Tick 2: {90, 60} (eats apple, score = 100, length = 2)
    // Tick 3: {120, 60} (unless respawned apple was at {120, 60}, in which case score = 200)
    // Tick 4: {150, 60} -> Right wall collision!
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // 3. Verify Game Over overlay is visible and reason is WALL
    const overlay = screen.getByTestId('game-over-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('data-reason', 'WALL');
    const lockedScore = scoreVal.textContent;
    expect(Number(lockedScore)).toBeGreaterThanOrEqual(100);
    expect(overlay).toHaveTextContent(`Final Score: ${lockedScore}`);

    // 4. Verify snake remained frozen in bounds (head at x = 120)
    const lastSnakeRendered = drawSnakeSpy.mock.calls[drawSnakeSpy.mock.calls.length - 1][1];
    expect(lastSnakeRendered[0]).toEqual({ x: 120, y: 60 });

    // 5. Click Reset -> overlay disappears, score resets to 0, Start button re-enabled
    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
    expect(scoreVal).toHaveTextContent('0');
    expect(startBtn).toBeEnabled();

    jest.clearAllTimers();
    jest.useRealTimers();
    drawSnakeSpy.mockRestore();
  });

  it('executes Top 5 Leaderboard E2E cycle (US-07): Load Top 5 -> Play & Score -> Game Over Modal -> Submit Name -> Highlight New Entry', async () => {
    jest.useFakeTimers();
    jest.spyOn(scoreService, 'getTopScores').mockResolvedValue([
      {
        id: 'seed-1',
        rank: 1,
        playerName: 'Alice',
        score: 500,
        createdAt: '2026-11-01T12:00:00.000Z',
      },
    ]);
    const submitScoreSpy = jest
      .spyOn(scoreService, 'submitScore')
      .mockImplementation(async (playerName, finalScore) => ({
        saved: true,
        rank: 2,
        entry: {
          id: 'new-e2e-entry',
          rank: 2,
          playerName,
          score: finalScore,
          createdAt: '2026-11-01T12:05:00.000Z',
        },
        leaderboard: [
          {
            id: 'seed-1',
            rank: 1,
            playerName: 'Alice',
            score: 500,
            createdAt: '2026-11-01T12:00:00.000Z',
          },
          {
            id: 'new-e2e-entry',
            rank: 2,
            playerName,
            score: finalScore,
            createdAt: '2026-11-01T12:05:00.000Z',
          },
        ],
      }));

    render(<App />);

    // 1. Flush initial Top 5 load promise
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId('leaderboard-row-1')).toHaveTextContent('Alice');
    expect(screen.getByTestId('leaderboard-row-1')).toHaveTextContent('500');
    expect(screen.getByTestId('leaderboard-row-2')).toHaveTextContent('-');

    // 2. Start game, eat initial apple (+100), and hit right wall
    fireEvent.click(screen.getByTestId('start-button'));
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // 3. ScoreSubmissionModal appears automatically for qualifying score
    const modal = screen.getByTestId('score-submission-modal');
    expect(modal).toBeInTheDocument();

    // 4. Enter player name and submit
    const input = screen.getByTestId('player-name-input');
    fireEvent.change(input, { target: { value: 'Elena' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-score-button'));
      await Promise.resolve();
    });

    // 5. Modal closes and Leaderboard row #2 updates with Elena and is highlighted
    expect(
      screen.queryByTestId('score-submission-modal')
    ).not.toBeInTheDocument();
    expect(submitScoreSpy).toHaveBeenCalledWith('Elena', expect.any(Number));
    expect(screen.getByTestId('leaderboard-row-2')).toHaveTextContent('Elena');
    expect(screen.getByTestId('leaderboard-row-2')).toHaveAttribute(
      'data-highlighted',
      'true'
    );

    jest.clearAllTimers();
    jest.useRealTimers();
  });
});
