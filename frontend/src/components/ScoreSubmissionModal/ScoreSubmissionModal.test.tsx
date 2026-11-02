import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScoreSubmissionModal } from './ScoreSubmissionModal';

describe('ScoreSubmissionModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ScoreSubmissionModal
        isOpen={false}
        score={300}
        isSubmitting={false}
        submitError={null}
        onSubmit={jest.fn()}
      />
    );

    expect(
      screen.queryByTestId('score-submission-modal')
    ).not.toBeInTheDocument();
  });

  it('auto-focuses player-name-input when opened and displays score', () => {
    render(
      <ScoreSubmissionModal
        isOpen={true}
        score={300}
        isSubmitting={false}
        submitError={null}
        onSubmit={jest.fn()}
      />
    );

    const input = screen.getByTestId('player-name-input');
    expect(screen.getByTestId('score-submission-modal')).toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('shows validation error and does not call onSubmit when name is empty or contains < or >', () => {
    const onSubmit = jest.fn();
    render(
      <ScoreSubmissionModal
        isOpen={true}
        score={300}
        isSubmitting={false}
        submitError={null}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByTestId('player-name-input');
    const submitBtn = screen.getByTestId('submit-score-button');

    // Empty name submit
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('submit-score-error')).toHaveTextContent(
      'Please enter a player name (1–30 characters).'
    );
    expect(onSubmit).not.toHaveBeenCalled();

    // Typing clears the local validation error
    fireEvent.change(input, { target: { value: '<bad>' } });
    expect(screen.queryByTestId('submit-score-error')).not.toBeInTheDocument();

    // XSS angle bracket submit
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('submit-score-error')).toHaveTextContent(
      'Player name cannot contain < or > characters.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims valid playerName and invokes onSubmit on form submission', () => {
    const onSubmit = jest.fn();
    render(
      <ScoreSubmissionModal
        isOpen={true}
        score={400}
        isSubmitting={false}
        submitError={null}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByTestId('player-name-input');
    fireEvent.change(input, { target: { value: '  Maria  ' } });
    fireEvent.submit(input.closest('form')!);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Maria');
  });

  it('disables input and submit button and blocks duplicate submission when isSubmitting is true', () => {
    const onSubmit = jest.fn();
    render(
      <ScoreSubmissionModal
        isOpen={true}
        score={400}
        isSubmitting={true}
        submitError="Network error"
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByTestId('player-name-input');
    const submitBtn = screen.getByTestId('submit-score-button');

    expect(input).toBeDisabled();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent('Submitting...');
    expect(screen.getByTestId('submit-score-error')).toHaveTextContent(
      'Network error'
    );

    fireEvent.submit(input.closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

