import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnakeGame } from './SnakeGame';

describe('SnakeGame Root Component Integration', () => {
  it('renders initial game interface in IDLE status with score 0 and enabled Start button', () => {
    render(<SnakeGame />);

    expect(screen.getByRole('heading', { name: /snake game/i })).toBeInTheDocument();
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
    expect(screen.getByTestId('start-button')).toBeEnabled();
    expect(screen.getByTestId('reset-button')).toBeEnabled();
    expect(screen.getByTestId('game-board-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-panel')).toBeInTheDocument();
  });

  it('clicking Start transitions the game to RUNNING and disables the Start button', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    expect(startBtn).toBeEnabled();

    fireEvent.click(startBtn);

    expect(startBtn).toBeDisabled();
    expect(screen.getByTestId('reset-button')).toBeEnabled();
  });

  it('clicking Reset during RUNNING re-enables Start and resets score to 0', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('start-button');
    const resetBtn = screen.getByTestId('reset-button');

    fireEvent.click(startBtn);
    expect(startBtn).toBeDisabled();

    fireEvent.click(resetBtn);
    expect(startBtn).toBeEnabled();
    expect(screen.getByTestId('score-value')).toHaveTextContent('0');
  });
});

