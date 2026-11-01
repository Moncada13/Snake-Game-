import { renderHook } from '@testing-library/react';
import { useKeyboardControls } from './useKeyboardControls';

describe('useKeyboardControls', () => {
  let onDirectionChangeMock: jest.Mock;

  beforeEach(() => {
    onDirectionChangeMock = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listens to arrow keys and dispatches direction changes with preventDefault when running', () => {
    renderHook(() =>
      useKeyboardControls({
        isRunning: true,
        onDirectionChange: onDirectionChangeMock,
      })
    );

    const keys: Array<{ key: string; expected: string }> = [
      { key: 'ArrowUp', expected: 'UP' },
      { key: 'ArrowDown', expected: 'DOWN' },
      { key: 'ArrowLeft', expected: 'LEFT' },
      { key: 'ArrowRight', expected: 'RIGHT' },
    ];

    keys.forEach(({ key, expected }) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(onDirectionChangeMock).toHaveBeenCalledWith(expected);
    });
  });

  it('ignores other keyboard keys without calling preventDefault or callback', () => {
    renderHook(() =>
      useKeyboardControls({
        isRunning: true,
        onDirectionChange: onDirectionChangeMock,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'KeyA', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(onDirectionChangeMock).not.toHaveBeenCalled();
  });

  it('does not dispatch direction changes when isRunning is false', () => {
    renderHook(() =>
      useKeyboardControls({
        isRunning: false,
        onDirectionChange: onDirectionChangeMock,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(onDirectionChangeMock).not.toHaveBeenCalled();
  });

  it('removes window event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyboardControls({
        isRunning: true,
        onDirectionChange: onDirectionChangeMock,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

