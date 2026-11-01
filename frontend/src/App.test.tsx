import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App Root Component', () => {
  it('renders the SnakeGame component', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /snake game/i })).toBeInTheDocument();
  });
});

