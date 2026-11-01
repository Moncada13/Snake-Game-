import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeaderboardPanel } from './LeaderboardPanel';

describe('LeaderboardPanel Component', () => {
  it('renders heading "Top 5 Leaderboard"', () => {
    render(<LeaderboardPanel />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Top 5 Leaderboard'
    );
  });

  it('renders exactly 5 ranked placeholder slots (#1 through #5) with dashes', () => {
    render(<LeaderboardPanel />);

    const panel = screen.getByTestId('leaderboard-panel');
    expect(panel).toBeInTheDocument();

    for (let rank = 1; rank <= 5; rank++) {
      const row = screen.getByTestId(`leaderboard-row-${rank}`);
      expect(row).toBeInTheDocument();
      expect(row).toHaveTextContent(`#${rank}`);
      expect(row).toHaveTextContent('-');
    }
  });
});

