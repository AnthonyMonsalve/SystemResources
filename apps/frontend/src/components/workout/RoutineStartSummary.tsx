import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faClock, faFire, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import type { Routine } from '../../types/routines';

interface RoutineStartSummaryProps {
  routine: Routine;
  onStart: () => void;
  onRestart: () => void;
  onCancel: () => void;
  hasActiveSession?: boolean;
  activeSessionProgress?: {
    currentExerciseIndex: number;
    currentExerciseName: string;
  };
}

export function RoutineStartSummary({
  routine,
  onStart,
  onRestart,
  onCancel,
  hasActiveSession = false,
  activeSessionProgress,
}: RoutineStartSummaryProps) {
  const [isExerciseListExpanded, setIsExerciseListExpanded] = useState(false);
  const totalExercises = routine.exercises?.length || 0;

  // Calculate estimated total time
  const estimatedMinutes = routine.exercises?.reduce((total, ex) => {
    const sets = ex.sets || ex.exercise?.defaultSets || 3;
    const duration = ex.duration || ex.exercise?.defaultDuration || 0;
    const rest = ex.rest || ex.exercise?.defaultRest || 60;

    // If it's a timer-based exercise, use duration * sets
    // If it's reps-based, estimate 30 seconds per set
    const exerciseTime = duration > 0 ? duration * sets : sets * 30;
    const restTime = rest * (sets - 1); // Rest between sets, not after last set

    return total + exerciseTime + restTime;
  }, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full my-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faDumbbell} className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{routine.name}</h1>
          {routine.description && (
            <p className="text-sm md:text-base text-slate-300">{routine.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
            <FontAwesomeIcon icon={faDumbbell} className="text-xl text-blue-400 mb-1" />
            <p className="text-2xl font-bold">{totalExercises}</p>
            <p className="text-xs text-slate-300">Ejercicios</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
            <FontAwesomeIcon icon={faClock} className="text-xl text-green-400 mb-1" />
            <p className="text-2xl font-bold">~{Math.round(estimatedMinutes / 60)}</p>
            <p className="text-xs text-slate-300">Minutos</p>
          </div>
        </div>

        {/* Exercise List - Accordion */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-4 overflow-hidden">
          <button
            onClick={() => setIsExerciseListExpanded(!isExerciseListExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFire} className="text-orange-400" />
              <h2 className="text-lg font-bold">Ejercicios de hoy</h2>
            </div>
            <FontAwesomeIcon
              icon={isExerciseListExpanded ? faChevronUp : faChevronDown}
              className="text-slate-400"
            />
          </button>

          {isExerciseListExpanded && (
            <div className="px-4 pb-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {routine.exercises?.map((ex, index) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{ex.exercise?.name}</p>
                      <p className="text-xs text-slate-400">
                        {ex.sets || ex.exercise?.defaultSets || 3} series
                        {ex.reps && ` × ${ex.reps} reps`}
                        {ex.duration && ` × ${ex.duration}s`}
                        {!ex.reps && !ex.duration && ex.exercise?.defaultReps && ` × ${ex.exercise.defaultReps} reps`}
                        {!ex.reps && !ex.duration && ex.exercise?.defaultDuration && ` × ${ex.exercise.defaultDuration}s`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Session Info */}
        {hasActiveSession && activeSessionProgress && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-green-500/30">
            <p className="text-sm text-green-300 mb-1">Tienes una sesión en progreso</p>
            <p className="text-base font-semibold">
              Ejercicio {activeSessionProgress.currentExerciseIndex + 1}: {activeSessionProgress.currentExerciseName}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {hasActiveSession ? (
          <div className="space-y-3">
            {/* Botones principales lado a lado en desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={onStart}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl text-base md:text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Continuar
              </button>
              <button
                onClick={onRestart}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl text-base md:text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Empezar de Nuevo
              </button>
            </div>
            <button
              onClick={onCancel}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-2xl text-base transition-all border border-white/20"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              ¡Comenzar Rutina!
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-2xl text-base transition-all border border-white/20"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
