import { useEffect, useRef } from 'react';
import { TICK_INTERVAL_MS } from '../game/constants';

interface UseGameLoopOptions {
  isRunning: boolean;
  onTick: () => void;
  intervalMs?: number;
}

export const useGameLoop = ({
  isRunning,
  onTick,
  intervalMs = TICK_INTERVAL_MS,
}: UseGameLoopOptions): void => {
  // Store the latest onTick callback in a ref to avoid resetting the interval if callback identity changes
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onTickRef.current();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, intervalMs]);
};

