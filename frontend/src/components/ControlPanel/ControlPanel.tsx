import React from 'react';
import { GameStatus } from '../../game/types';
import './ControlPanel.css';

interface ControlPanelProps {
  status: GameStatus;
  onStart: () => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  onStart,
  onReset,
}) => {
  const isStartDisabled = status !== 'IDLE';

  const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    onStart();
  };

  const handleResetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    onReset();
  };

  return (
    <div className="control-panel">
      <button
        type="button"
        className="btn btn-primary"
        data-testid="start-button"
        disabled={isStartDisabled}
        onClick={handleStartClick}
      >
        Start
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        data-testid="reset-button"
        onClick={handleResetClick}
      >
        Reset
      </button>
    </div>
  );
};

