import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from './ScoreBoard';

describe('ScoreBoard Component', () => {
  it('renders initial score of 0 with accessible polite live region', () => {
    render(<ScoreBoard score={0} />);

    const scoreDisplay = screen.getByTestId('score-value');
    expect(scoreDisplay).toBeInTheDocument();
    expect(scoreDisplay).toHaveTextContent('0');

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('Score: 0');
  });

  it('reactively displays updated score values', () => {
    const { rerender } = render(<ScoreBoard score={200} />);
    expect(screen.getByTestId('score-value')).toHaveTextContent('200');

    rerender(<ScoreBoard score={500} />);
    expect(screen.getByTestId('score-value')).toHaveTextContent('500');
  });
});

