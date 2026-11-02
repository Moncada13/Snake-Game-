import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeaderboardPanel } from './LeaderboardPanel';
import { ScoreItem } from '../../services/scoreService';

describe('LeaderboardPanel Component', () => {
  const sampleScores: ScoreItem[] = [
    {
      id: 'id-1',
      rank: 1,
      playerName: 'Alice',
      score: 900,
      createdAt: '2026-11-01T12:00:00.000Z',
    },
    {
      id: 'id-2',
      rank: 2,
      playerName: 'Bob',
      score: 600,
      createdAt: '2026-11-01T12:05:00.000Z',
    },
    {
      id: 'id-3',
      rank: 3,
      playerName: 'Maria',
      score: 300,
      createdAt: '2026-11-01T12:10:00.000Z',
    },
  ];

  it('renders heading "Top 5 Leaderboard"', () => {
    render(<LeaderboardPanel />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Top 5 Leaderboard'
    );
  });

  it('renders 5 ranked placeholder slots (#1 through #5) with dashes when empty', () => {
    render(<LeaderboardPanel />);

    const panel = screen.getByTestId('leaderboard-panel');
    expect(panel).toBeInTheDocument();

    for (let rank = 1; rank <= 5; rank++) {
      const row = screen.getByTestId(`leaderboard-row-${rank}`);
      expect(row).toBeInTheDocument();
      expect(row).toHaveTextContent(`#${rank}`);
      expect(row).toHaveTextContent('-');
      expect(row).toHaveAttribute('data-highlighted', 'false');
    }
  });

  it('renders populated scores and placeholder dashes for remaining slots, and highlights matching highlightedScoreId', () => {
    render(
      <LeaderboardPanel
        scores={sampleScores}
        highlightedScoreId="id-3"
      />
    );

    expect(screen.getByTestId('leaderboard-row-1')).toHaveTextContent('Alice');
    expect(screen.getByTestId('leaderboard-row-1')).toHaveTextContent('900');
    expect(screen.getByTestId('leaderboard-row-2')).toHaveTextContent('Bob');
    expect(screen.getByTestId('leaderboard-row-2')).toHaveTextContent('600');

    const row3 = screen.getByTestId('leaderboard-row-3');
    expect(row3).toHaveTextContent('Maria');
    expect(row3).toHaveTextContent('300');
    expect(row3).toHaveAttribute('data-highlighted', 'true');
    expect(row3).toHaveClass('leaderboard-row--highlighted');

    expect(screen.getByTestId('leaderboard-row-4')).toHaveTextContent('-');
    expect(screen.getByTestId('leaderboard-row-5')).toHaveTextContent('-');
  });

  it('renders loading indicator, non-blocking error banner, and status notice when provided', () => {
    render(
      <LeaderboardPanel
        isLoading={true}
        loadError="Unable to load leaderboard"
        statusNotice="Score no longer qualifies for Top 5"
      />
    );

    expect(screen.getByTestId('leaderboard-loading')).toHaveTextContent(
      'Loading...'
    );
    expect(screen.getByTestId('leaderboard-error')).toHaveTextContent(
      'Unable to load leaderboard'
    );
    expect(screen.getByTestId('leaderboard-notice')).toHaveTextContent(
      'Score no longer qualifies for Top 5'
    );
  });
});
