import React from 'react';
import './ScoreBoard.css';

interface ScoreBoardProps {
  score: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score }) => {
  return (
    <div className="score-board" role="status" aria-live="polite">
      <span className="score-label">Score: </span>
      <span className="score-value" data-testid="score-value">
        {score}
      </span>
    </div>
  );
};

