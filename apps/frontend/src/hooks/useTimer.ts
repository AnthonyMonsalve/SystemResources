import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  durationSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
}

export function useTimer({
  durationSeconds,
  onComplete,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Calculate progress percentage
  const progress = ((durationSeconds - timeRemaining) / durationSeconds) * 100;

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning && !isPaused) {
      pausedTimeRef.current = Date.now();
      setIsPaused(true);
    }
  }, [isRunning, isPaused]);

  const resume = useCallback(() => {
    if (isRunning && isPaused && pausedTimeRef.current) {
      // Add paused duration to start time to "skip" the paused time
      const pauseDuration = Date.now() - pausedTimeRef.current;
      if (startTimeRef.current) {
        startTimeRef.current += pauseDuration;
      }
      pausedTimeRef.current = 0;
      setIsPaused(false);
    }
  }, [isRunning, isPaused]);

  const reset = useCallback(() => {
    setTimeRemaining(durationSeconds);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [durationSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update timer using Date.now() to prevent drift
    intervalRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete?.();
      }
    }, 100); // Update every 100ms for smooth UI

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, durationSeconds, onComplete]);

  // Reset when duration changes
  useEffect(() => {
    reset();
  }, [durationSeconds, reset]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    progress,
    start,
    pause,
    resume,
    reset,
    stop,
  };
}
