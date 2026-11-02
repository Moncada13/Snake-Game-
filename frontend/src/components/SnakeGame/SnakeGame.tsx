import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  gameStateReducer,
  INITIAL_GAME_STATE,
} from '../../game/gameStateReducer';
import { isScoreEligibleForTopFive } from '../../game/leaderboardUtils';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { ScoreItem, scoreService } from '../../services/scoreService';
import { ControlPanel } from '../ControlPanel/ControlPanel';
import { GameBoard } from '../GameBoard/GameBoard';
import { LeaderboardPanel } from '../LeaderboardPanel/LeaderboardPanel';
import { ScoreBoard } from '../ScoreBoard/ScoreBoard';
import { ScoreSubmissionModal } from '../ScoreSubmissionModal/ScoreSubmissionModal';
import './SnakeGame.css';

export const SnakeGame: React.FC = () => {
  const [state, dispatch] = useReducer(gameStateReducer, INITIAL_GAME_STATE);
  const [leaderboard, setLeaderboard] = useState<ScoreItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [highlightedScoreId, setHighlightedScoreId] = useState<string | null>(
    null
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const sessionIdRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    scoreService
      .getTopScores()
      .then((items) => {
        if (isMounted && items.length > 0) {
          setLeaderboard(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('Unable to load leaderboard');
        }
      });

    return () => {
      isMounted = false;
      sessionIdRef.current += 1;
    };
  }, []);

  const isRunning = state.status === 'RUNNING';

  useGameLoop({
    isRunning,
    onTick: () => dispatch({ type: 'TICK' }),
  });

  useKeyboardControls({
    isRunning,
    onDirectionChange: (direction) =>
      dispatch({ type: 'CHANGE_DIRECTION', payload: direction }),
  });

  const handleStart = () => {
    dispatch({ type: 'START' });
  };

  const handleReset = () => {
    sessionIdRef.current += 1;
    setIsSubmitting(false);
    setHasSubmitted(false);
    setSubmitError(null);
    setStatusNotice(null);
    dispatch({ type: 'RESET' });
  };

  const handleScoreSubmit = async (playerName: string) => {
    const submitSessionId = sessionIdRef.current;
    setIsSubmitting(true);
    setSubmitError(null);
    setStatusNotice(null);

    try {
      const response = await scoreService.submitScore(playerName, state.score);
      if (sessionIdRef.current !== submitSessionId) {
        return;
      }
      setLeaderboard(response.leaderboard);
      setHasSubmitted(true);
      if (response.saved && response.entry) {
        setHighlightedScoreId(response.entry.id);
      } else {
        setHighlightedScoreId(null);
        setStatusNotice('Score no longer qualifies for Top 5');
      }
    } catch (error) {
      if (sessionIdRef.current !== submitSessionId) {
        return;
      }
      /* istanbul ignore next */
      const msg =
        error instanceof Error ? error.message : 'Failed to submit score';
      setSubmitError(msg);
    } finally {
      if (sessionIdRef.current === submitSessionId) {
        setIsSubmitting(false);
      }
    }
  };

  const isModalOpen =
    state.status === 'GAME_OVER' &&
    !hasSubmitted &&
    isScoreEligibleForTopFive(state.score, leaderboard);

  return (
    <main className="snake-game-container">
      <header className="snake-game-header">
        <h1 className="snake-game-title">Snake Game</h1>
        <div className="snake-game-hud">
          <ScoreBoard score={state.score} />
          <ControlPanel
            status={state.status}
            onStart={handleStart}
            onReset={handleReset}
          />
        </div>
      </header>

      <section className="snake-game-content">
        <div className="snake-game-arena">
          <GameBoard
            status={state.status}
            score={state.score}
            snake={state.snake}
            apple={state.apple}
            gameOverReason={state.gameOverReason}
          />
        </div>
        <div className="snake-game-sidebar">
          <LeaderboardPanel
            scores={leaderboard}
            loadError={loadError}
            highlightedScoreId={highlightedScoreId}
            statusNotice={statusNotice}
          />
        </div>
      </section>

      <ScoreSubmissionModal
        isOpen={isModalOpen}
        score={state.score}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onSubmit={handleScoreSubmit}
      />
    </main>
  );
};
