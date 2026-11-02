import React from 'react';
import { ScoreItem } from '../../services/scoreService';
import './LeaderboardPanel.css';

export interface LeaderboardPanelProps {
  scores?: ScoreItem[];
  isLoading?: boolean;
  loadError?: string | null;
  highlightedScoreId?: string | null;
  statusNotice?: string | null;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  scores = [],
  isLoading = false,
  loadError = null,
  highlightedScoreId = null,
  statusNotice = null,
}) => {
  const slots = [1, 2, 3, 4, 5];

  return (
    <aside className="leaderboard-panel" data-testid="leaderboard-panel">
      <h2 className="leaderboard-title">Top 5 Leaderboard</h2>

      {isLoading && (
        <p className="leaderboard-loading" data-testid="leaderboard-loading">
          Loading...
        </p>
      )}

      {loadError && (
        <p
          className="leaderboard-error"
          data-testid="leaderboard-error"
          role="alert"
        >
          {loadError}
        </p>
      )}

      {statusNotice && (
        <p
          className="leaderboard-notice"
          data-testid="leaderboard-notice"
          role="status"
        >
          {statusNotice}
        </p>
      )}

      <ol className="leaderboard-list">
        {slots.map((rank) => {
          const entry = scores[rank - 1];
          const isHighlighted =
            Boolean(entry) &&
            Boolean(highlightedScoreId) &&
            entry.id === highlightedScoreId;

          return (
            <li
              key={rank}
              className={`leaderboard-row${
                isHighlighted ? ' leaderboard-row--highlighted' : ''
              }`}
              data-testid={`leaderboard-row-${rank}`}
              data-highlighted={isHighlighted ? 'true' : 'false'}
            >
              <span className="leaderboard-rank">#{rank}</span>
              <span className="leaderboard-player">
                {entry ? entry.playerName : '-'}
              </span>
              <span className="leaderboard-score">
                {entry ? entry.score : '-'}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
};
