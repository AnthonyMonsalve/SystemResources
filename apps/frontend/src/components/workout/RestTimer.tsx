import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faForward } from '@fortawesome/free-solid-svg-icons';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../types/workouts';
import type { RoutineExercise } from '../../types/routines';

interface RestTimerProps {
  restSeconds: number;
  onComplete: () => void;
  nextExercise?: RoutineExercise;
}

export function RestTimer({ restSeconds, onComplete, nextExercise }: RestTimerProps) {
  const { timeRemaining, progress } = useTimer({
    durationSeconds: restSeconds,
    onComplete,
    autoStart: true,
  });

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="text-3xl text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Tiempo de Descanso</h2>
        <p className="text-slate-600">
          Relájate y prepárate para la siguiente serie
        </p>
      </div>

      {/* Timer Display */}
      <div className="relative mb-8">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time Remaining */}
        <div className="text-center">
          <div className="text-6xl font-bold text-slate-900 font-mono">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-slate-600 mt-2">segundos restantes</p>
        </div>
      </div>

      {/* Next Exercise Preview */}
      {nextExercise && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 mb-1">
            Siguiente Ejercicio
          </p>
          <p className="text-sm font-bold text-slate-900">
            {nextExercise.exercise?.name || 'Próximo ejercicio'}
          </p>
        </div>
      )}

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={faForward} />
        Saltar Descanso
      </button>
    </div>
  );
}
