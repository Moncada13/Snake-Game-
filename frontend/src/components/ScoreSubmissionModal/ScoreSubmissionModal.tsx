import React, { useEffect, useRef, useState } from 'react';
import {
  MAX_PLAYER_NAME_LEN,
  validatePlayerName,
} from '../../game/leaderboardUtils';
import './ScoreSubmissionModal.css';

export interface ScoreSubmissionModalProps {
  isOpen: boolean;
  score: number;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (playerName: string) => void;
}

export const ScoreSubmissionModal: React.FC<ScoreSubmissionModalProps> = ({
  isOpen,
  score,
  isSubmitting,
  submitError,
  onSubmit,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPlayerName('');
      setLocalError(null);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const validation = validatePlayerName(playerName);
    if (!validation.valid) {
      setLocalError(validation.error);
      return;
    }

    setLocalError(null);
    onSubmit(validation.trimmedName);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
    if (localError) {
      setLocalError(null);
    }
  };

  const displayedError = localError || submitError;

  return (
    <div
      className="score-modal-backdrop"
      data-testid="score-submission-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-submission-title"
    >
      <div className="score-modal-card">
        <h2 id="score-submission-title" className="score-modal-title">
          New High Score! Enter your name:
        </h2>
        <p className="score-modal-score">
          Score: <strong>{score}</strong>
        </p>

        <form onSubmit={handleFormSubmit} className="score-modal-form" noValidate>
          <input
            ref={inputRef}
            type="text"
            className="score-modal-input"
            data-testid="player-name-input"
            placeholder="Your name (1–30 chars)"
            maxLength={MAX_PLAYER_NAME_LEN}
            autoComplete="off"
            value={playerName}
            onChange={handleInputChange}
            disabled={isSubmitting}
            aria-label="Player Name"
          />

          {displayedError && (
            <p
              className="score-modal-error"
              data-testid="submit-score-error"
              role="alert"
            >
              {displayedError}
            </p>
          )}

          <button
            type="submit"
            className="score-modal-submit"
            data-testid="submit-score-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

