import { useEffect, useRef } from 'react';
import { Direction } from '../game/types';

interface UseKeyboardControlsOptions {
  isRunning: boolean;
  onDirectionChange: (direction: Direction) => void;
}

const KEY_TO_DIRECTION_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
};

export const useKeyboardControls = ({
  isRunning,
  onDirectionChange,
}: UseKeyboardControlsOptions): void => {
  const onDirectionChangeRef = useRef(onDirectionChange);

  useEffect(() => {
    onDirectionChangeRef.current = onDirectionChange;
  }, [onDirectionChange]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const targetDirection = KEY_TO_DIRECTION_MAP[event.key];
      if (targetDirection) {
        event.preventDefault();
        onDirectionChangeRef.current(targetDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning]);
};

