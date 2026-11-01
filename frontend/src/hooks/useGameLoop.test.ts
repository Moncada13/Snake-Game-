import { renderHook, act } from '@testing-library/react';
import { useGameLoop } from './useGameLoop';

describe('useGameLoop', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('triggers onTick at specified interval when isRunning is true', () => {
    const onTickMock = jest.fn();

    renderHook(() =>
      useGameLoop({
        isRunning: true,
        onTick: onTickMock,
        intervalMs: 150,
      })
    );

    expect(onTickMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(onTickMock).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onTickMock).toHaveBeenCalledTimes(3);
  });

  it('does not trigger onTick when isRunning is false', () => {
    const onTickMock = jest.fn();

    renderHook(() =>
      useGameLoop({
        isRunning: false,
        onTick: onTickMock,
        intervalMs: 150,
      })
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onTickMock).not.toHaveBeenCalled();
  });

  it('clears interval when isRunning transitions from true to false', () => {
    const onTickMock = jest.fn();

    const { rerender } = renderHook(
      ({ isRunning }) =>
        useGameLoop({
          isRunning,
          onTick: onTickMock,
          intervalMs: 150,
        }),
      { initialProps: { isRunning: true } }
    );

    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(onTickMock).toHaveBeenCalledTimes(1);

    rerender({ isRunning: false });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Count remains 1 since timer was stopped
    expect(onTickMock).toHaveBeenCalledTimes(1);
  });

  it('clears interval when unmounted', () => {
    const onTickMock = jest.fn();

    const { unmount } = renderHook(() =>
      useGameLoop({
        isRunning: true,
        onTick: onTickMock,
        intervalMs: 150,
      })
    );

    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(onTickMock).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onTickMock).toHaveBeenCalledTimes(1);
  });
});

