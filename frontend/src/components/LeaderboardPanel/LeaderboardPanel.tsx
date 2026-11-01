import React from 'react';
import './LeaderboardPanel.css';

export const LeaderboardPanel: React.FC = () => {
  const slots = [1, 2, 3, 4, 5];

  return (
    <aside className="leaderboard-panel" data-testid="leaderboard-panel">
      <h2 className="leaderboard-title">Top 5 Leaderboard</h2>
      <ol className="leaderboard-list">
        {slots.map((rank) => (
          <li
            key={rank}
            className="leaderboard-row"
            data-testid={`leaderboard-row-${rank}`}
          >
            <span className="leaderboard-rank">#{rank}</span>
            <span className="leaderboard-player">-</span>
            <span className="leaderboard-score">-</span>
          </li>
        ))}
      </ol>
    </aside>
  );
};

