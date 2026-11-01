import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from './ControlPanel';
import { GameStatus } from '../../game/types';

describe('ControlPanel Component', () => {
  let onStartMock: jest.Mock;
  let onResetMock: jest.Mock;

  beforeEach(() => {
    onStartMock = jest.fn();
    onResetMock = jest.fn();
  });

  it('renders Start and Reset buttons', () => {
    render(
      <ControlPanel status="IDLE" onStart={onStartMock} onReset={onResetMock} />
    );

    expect(screen.getByTestId('start-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  describe('Start button states', () => {
    it('is enabled when status is IDLE', () => {
      render(
        <ControlPanel status="IDLE" onStart={onStartMock} onReset={onResetMock} />
      );

      const startBtn = screen.getByTestId('start-button');
      expect(startBtn).toBeEnabled();
    });

    it('is disabled when status is RUNNING', () => {
      render(
        <ControlPanel status="RUNNING" onStart={onStartMock} onReset={onResetMock} />
      );

      const startBtn = screen.getByTestId('start-button');
      expect(startBtn).toBeDisabled();
    });

    it('is disabled when status is GAME_OVER', () => {
      render(
        <ControlPanel status="GAME_OVER" onStart={onStartMock} onReset={onResetMock} />
      );

      const startBtn = screen.getByTestId('start-button');
      expect(startBtn).toBeDisabled();
    });

    it('triggers onStart and immediately blurs focus on click', () => {
      render(
        <ControlPanel status="IDLE" onStart={onStartMock} onReset={onResetMock} />
      );

      const startBtn = screen.getByTestId('start-button');
      const blurSpy = jest.spyOn(startBtn, 'blur');

      fireEvent.click(startBtn);

      expect(onStartMock).toHaveBeenCalledTimes(1);
      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('Reset button states', () => {
    const statuses: GameStatus[] = ['IDLE', 'RUNNING', 'GAME_OVER'];

    statuses.forEach((status) => {
      it(`is always enabled when status is ${status}`, () => {
        render(
          <ControlPanel status={status} onStart={onStartMock} onReset={onResetMock} />
        );

        const resetBtn = screen.getByTestId('reset-button');
        expect(resetBtn).toBeEnabled();
      });
    });

    it('triggers onReset and immediately blurs focus on click', () => {
      render(
        <ControlPanel status="RUNNING" onStart={onStartMock} onReset={onResetMock} />
      );

      const resetBtn = screen.getByTestId('reset-button');
      const blurSpy = jest.spyOn(resetBtn, 'blur');

      fireEvent.click(resetBtn);

      expect(onResetMock).toHaveBeenCalledTimes(1);
      expect(blurSpy).toHaveBeenCalled();
    });
  });
});

