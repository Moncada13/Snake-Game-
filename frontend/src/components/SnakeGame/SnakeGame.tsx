import React, { useReducer } from 'react';
import { gameStateReducer, INITIAL_GAME_STATE } from '../../game/gameStateReducer';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { GameBoard } from '../GameBoard/GameBoard';
import { ControlPanel } from '../ControlPanel/ControlPanel';
import { ScoreBoard } from '../ScoreBoard/ScoreBoard';
import { LeaderboardPanel } from '../LeaderboardPanel/LeaderboardPanel';
import './SnakeGame.css';

export const SnakeGame: React.FC = () => {
  const [state, dispatch] = useReducer(gameStateReducer, INITIAL_GAME_STATE);

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
    dispatch({ type: 'RESET' });
  };

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
          <LeaderboardPanel />
        </div>
      </section>
    </main>
  );
};
