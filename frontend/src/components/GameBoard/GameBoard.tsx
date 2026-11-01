import React, { useEffect, useRef } from 'react';
import { GameStatus, Position } from '../../game/types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../game/constants';
import { drawBoard, drawSnake } from '../../game/boardRenderer';
import './GameBoard.css';

interface GameBoardProps {
  status: GameStatus;
  score: number;
  snake?: Position[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  status,
  score,
  snake = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Handle HiDPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = BOARD_WIDTH * dpr;
    canvas.height = BOARD_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    drawBoard(ctx);
    drawSnake(ctx, snake);
  }, [status, snake]);

  return (
    <div
      className="game-board-container"
      style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Snake game board, ${BOARD_WIDTH} by ${BOARD_HEIGHT} pixels`}
        data-testid="game-board-canvas"
        style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}
      />

      {status === 'GAME_OVER' && (
        <div className="game-over-overlay" data-testid="game-over-overlay">
          <p className="game-over-title">Game Over</p>
          <p className="game-over-score">Final Score: {score}</p>
          <p className="game-over-hint">Press Reset to play again</p>
        </div>
      )}
    </div>
  );
};
