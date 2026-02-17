import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../types/workouts';

interface TimerDisplayProps {
  durationSeconds: number;
  onComplete: () => void;
  autoStart?: boolean;
}

export function TimerDisplay({
  durationSeconds,
  onComplete,
  autoStart = true,
}: TimerDisplayProps) {
  const { timeRemaining, isRunning, isPaused, progress, start, pause, resume } =
    useTimer({
      durationSeconds,
      onComplete,
      autoStart,
    });

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart, isRunning, start]);

  const handleToggle = () => {
    if (isPaused) {
      resume();
    } else if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[400px] py-12">
      {/* Circular Progress */}
      <div className="relative w-80 h-80 mb-8">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-slate-200"
          />
          {/* Progress Circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-300"
            strokeDasharray={`${2 * Math.PI * 140}`}
            strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-7xl font-bold text-slate-900 font-mono">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-lg text-slate-600 mt-2">
            {Math.round(progress)}% completado
          </p>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={handleToggle}
        className="w-20 h-20 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label={isPaused ? 'Reanudar' : isRunning ? 'Pausar' : 'Iniciar'}
      >
        <FontAwesomeIcon
          icon={isPaused || !isRunning ? faPlay : faPause}
          className="text-2xl"
        />
      </button>

      {/* Status Text */}
      <p className="mt-4 text-sm font-medium text-slate-600">
        {!isRunning && !isPaused && 'Presiona para iniciar'}
        {isRunning && !isPaused && 'En progreso...'}
        {isPaused && 'Pausado - Presiona para continuar'}
      </p>
    </div>
  );
}
