import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { SnakeGame } from './SnakeGame';
import * as appleSpawner from '../../game/appleSpawner';
import * as boardRenderer from '../../game/boardRenderer';
import { ScoreItem, scoreService } from '../../services/scoreService';

describe('SnakeGame Root Component Integration', () => {
  let drawSnakeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(boardRenderer, 'drawBoard').mockImplementation(() => {});
    drawSnakeSpy = jest
      .spyOn(boardRenderer, 'drawSnake')
      .mockImplementation(() => {});
    jest.spyOn(scoreService, 'getTopScores').mockResolvedValue([]);
    jest.spyOn(appleSpawner, 'spawnApple').mockReturnValue({ x: 0, y: 0 });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders initial game interface in IDLE status with score 0 and enabled Start button', () => {
    render(<SnakeGame />);

    expect(
      screen.getByRole('heading', { name: /snake game/i })
    ).toBeInTheDocument();
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

    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [
      { x: 30, y: 60 },
    ]);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [
      { x: 60, y: 60 },
    ]);
  });

  it('steers snake with arrow keys and updates movement on next tick', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    fireEvent.click(startBtn);

    fireEvent.keyDown(window, { key: 'ArrowDown', cancelable: true });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [
      { x: 30, y: 90 },
    ]);
  });

  it('increments score by 100 and elongates snake when eating an apple', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    fireEvent.click(startBtn);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('score-value')).toHaveTextContent('100');
    expect(drawSnakeSpy).toHaveBeenCalledWith(expect.anything(), [
      { x: 90, y: 60 },
      { x: 60, y: 60 },
    ]);
  });

  it('detects wall collision with score 0, displays Game Over overlay without modal, and recovers on Reset', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');

    fireEvent.click(startBtn);
    fireEvent.keyDown(window, { key: 'ArrowUp', cancelable: true });

    act(() => {
      jest.advanceTimersByTime(450);
    });

    const overlay = screen.getByTestId('game-over-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('data-reason', 'WALL');
    // Score is 0, so submission modal does NOT open
    expect(
      screen.queryByTestId('score-submission-modal')
    ).not.toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('game-over-overlay')).not.toBeInTheDocument();
    expect(startBtn).toBeEnabled();
  });

  describe('US-07 Leaderboard & ScoreSubmissionModal Integration', () => {
    it('Scenario 1: fetches Top 5 on mount and renders 3 returned scores with 2 placeholder slots', async () => {
      const initialScores: ScoreItem[] = [
        {
          id: 's1',
          rank: 1,
          playerName: 'Alice',
          score: 900,
          createdAt: '2026-11-01T12:00:00.000Z',
        },
        {
          id: 's2',
          rank: 2,
          playerName: 'Bob',
          score: 600,
          createdAt: '2026-11-01T12:05:00.000Z',
        },
        {
          id: 's3',
          rank: 3,
          playerName: 'Carlos',
          score: 300,
          createdAt: '2026-11-01T12:10:00.000Z',
        },
      ];
      jest.spyOn(scoreService, 'getTopScores').mockResolvedValue(initialScores);

      render(<SnakeGame />);

      await waitFor(() => {
        expect(screen.getByTestId('leaderboard-row-1')).toHaveTextContent(
          'Alice'
        );
      });

      expect(screen.getByTestId('leaderboard-row-1')).toHaveTextContent('900');
      expect(screen.getByTestId('leaderboard-row-2')).toHaveTextContent('Bob');
      expect(screen.getByTestId('leaderboard-row-3')).toHaveTextContent(
        'Carlos'
      );
      expect(screen.getByTestId('leaderboard-row-4')).toHaveTextContent('-');
      expect(screen.getByTestId('leaderboard-row-5')).toHaveTextContent('-');
    });

    it('Scenario 2 & 3: opens ScoreSubmissionModal on qualifying Game Over, submits score, updates and highlights row, and resets cleanly', async () => {
      const updatedLeaderboard: ScoreItem[] = [
        {
          id: 'new-maria-id',
          rank: 1,
          playerName: 'Maria',
          score: 100,
          createdAt: '2026-11-01T15:00:00.000Z',
        },
      ];
      const submitSpy = jest
        .spyOn(scoreService, 'submitScore')
        .mockResolvedValue({
          saved: true,
          rank: 1,
          entry: updatedLeaderboard[0],
          leaderboard: updatedLeaderboard,
        });

      render(<SnakeGame />);

      // Start game, eat initial apple at (90,60) in 2 ticks (+100 points), then continue right into wall at x=300 in 7 more ticks (total 9 ticks = 1350ms)
      fireEvent.click(screen.getByTestId('start-button'));
      act(() => {
        jest.advanceTimersByTime(1350);
      });

      expect(screen.getByTestId('score-value')).toHaveTextContent('100');
      expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument();

      // Modal opens automatically for qualifying 100-point score
      const modal = screen.getByTestId('score-submission-modal');
      expect(modal).toBeInTheDocument();

      const input = screen.getByTestId('player-name-input');
      fireEvent.change(input, { target: { value: 'Maria' } });
      fireEvent.click(screen.getByTestId('submit-score-button'));

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledWith('Maria', 100);
      });

      await waitFor(() => {
        expect(
          screen.queryByTestId('score-submission-modal')
        ).not.toBeInTheDocument();
      });

      const row1 = screen.getByTestId('leaderboard-row-1');
      expect(row1).toHaveTextContent('Maria');
      expect(row1).toHaveTextContent('100');
      expect(row1).toHaveAttribute('data-highlighted', 'true');

      // Clicking Reset clears submission state for next game
      fireEvent.click(screen.getByTestId('reset-button'));
      expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    });

    it('handles 200 OK (saved: false) when another player took the 5th spot and handles submit errors', async () => {
      const submitSpy = jest
        .spyOn(scoreService, 'submitScore')
        .mockRejectedValueOnce(new Error('Server busy'))
        .mockResolvedValueOnce({
          saved: false,
          rank: null,
          entry: null,
          message: 'Score does not qualify for Top 5',
          leaderboard: [
            {
              id: 'p1',
              rank: 1,
              playerName: 'Champ',
              score: 900,
              createdAt: '2026-11-01T12:00:00.000Z',
            },
          ],
        });

      const { unmount } = render(<SnakeGame />);

      fireEvent.click(screen.getByTestId('start-button'));
      act(() => {
        jest.advanceTimersByTime(1350);
      });

      const input = screen.getByTestId('player-name-input');
      fireEvent.change(input, { target: { value: 'Carlos' } });
      fireEvent.click(screen.getByTestId('submit-score-button'));

      // First attempt fails -> modal stays open and displays error
      await waitFor(() => {
        expect(screen.getByTestId('submit-score-error')).toHaveTextContent(
          'Server busy'
        );
      });

      // Second attempt returns saved: false -> modal closes and shows notice
      fireEvent.click(screen.getByTestId('submit-score-button'));

      await waitFor(() => {
        expect(
          screen.queryByTestId('score-submission-modal')
        ).not.toBeInTheDocument();
      });
      expect(submitSpy).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('leaderboard-notice')).toHaveTextContent(
        'Score no longer qualifies for Top 5'
      );

      unmount();
    });

    it('Scenario 5: backend unreachable on initial load displays error banner without blocking gameplay', async () => {
      jest
        .spyOn(scoreService, 'getTopScores')
        .mockRejectedValue(new Error('Network error'));

      render(<SnakeGame />);

      await waitFor(() => {
        expect(screen.getByTestId('leaderboard-error')).toHaveTextContent(
          'Unable to load leaderboard'
        );
      });

      // Player can still start and play the game normally
      const startBtn = screen.getByTestId('start-button');
      fireEvent.click(startBtn);
      expect(startBtn).toBeDisabled();
    });

    it('ignores delayed getTopScores resolution or rejection after component unmounts', async () => {
      let resolveScores!: (items: ScoreItem[]) => void;
      let rejectScores!: (err: Error) => void;

      jest
        .spyOn(scoreService, 'getTopScores')
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveScores = resolve;
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              rejectScores = reject;
            })
        );

      const firstRender = render(<SnakeGame />);
      firstRender.unmount();
      await act(async () => {
        resolveScores([
          {
            id: 'late-1',
            rank: 1,
            playerName: 'Late',
            score: 100,
            createdAt: '2026-11-01T12:00:00.000Z',
          },
        ]);
      });

      const secondRender = render(<SnakeGame />);
      secondRender.unmount();
      await act(async () => {
        rejectScores(new Error('Late error'));
      });
    });

    it('ignores stale submitScore resolution or rejection if Reset is clicked while submission is in flight', async () => {
      jest
        .spyOn(appleSpawner, 'spawnApple')
        .mockImplementation((snake) =>
          snake.length === 1 ? { x: 90, y: 60 } : { x: 0, y: 0 }
        );
      let resolveSubmit!: (res: Awaited<ReturnType<typeof scoreService.submitScore>>) => void;
      let rejectSubmit!: (err: Error) => void;

      jest
        .spyOn(scoreService, 'submitScore')
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSubmit = resolve;
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              rejectSubmit = reject;
            })
        );

      const { unmount } = render(<SnakeGame />);

      // Game 1 -> Game Over -> Submit -> Reset before submit resolves
      fireEvent.click(screen.getByTestId('start-button'));
      act(() => {
        jest.advanceTimersByTime(1350);
      });
      fireEvent.change(screen.getByTestId('player-name-input'), {
        target: { value: 'StaleWinner' },
      });
      fireEvent.click(screen.getByTestId('submit-score-button'));
      fireEvent.click(screen.getByTestId('reset-button'));

      await act(async () => {
        resolveSubmit({
          saved: true,
          rank: 1,
          entry: {
            id: 'stale-1',
            rank: 1,
            playerName: 'StaleWinner',
            score: 100,
            createdAt: '2026-11-01T12:00:00.000Z',
          },
          leaderboard: [],
        });
      });

      // Game 2 -> Game Over -> Modal still opens because stale Game 1 submit was ignored!
      fireEvent.click(screen.getByTestId('start-button'));
      act(() => {
        jest.advanceTimersByTime(1350);
      });
      expect(screen.getByTestId('score-submission-modal')).toBeInTheDocument();

      // Submit in Game 2 -> Reset before submit rejects
      fireEvent.change(screen.getByTestId('player-name-input'), {
        target: { value: 'StaleError' },
      });
      fireEvent.click(screen.getByTestId('submit-score-button'));
      fireEvent.click(screen.getByTestId('reset-button'));

      await act(async () => {
        rejectSubmit(new Error('Stale network error'));
      });

      unmount();
    });
  });
});
