import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import type { RoutineExercise } from '../../types/routines';

interface ExerciseTransitionProps {
  exercise: RoutineExercise;
  exerciseNumber: number;
  totalExercises: number;
  onContinue: () => void;
}

export function ExerciseTransition({
  exercise,
  exerciseNumber,
  totalExercises,
  onContinue,
}: ExerciseTransitionProps) {
  const targetSets = exercise.sets || exercise.exercise?.defaultSets || 3;
  const targetReps = exercise.reps || exercise.exercise?.defaultReps;
  const targetDuration = exercise.duration || exercise.exercise?.defaultDuration;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-xl w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
          <FontAwesomeIcon icon={faDumbbell} className="text-5xl text-white" />
        </div>

        {/* Exercise Number */}
        <p className="text-lg text-slate-300 mb-2">
          Ejercicio {exerciseNumber} de {totalExercises}
        </p>

        {/* Exercise Name */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {exercise.exercise?.name}
        </h1>

        {/* Exercise Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">{targetSets}</p>
              <p className="text-sm text-slate-300">Series</p>
            </div>
            <div>
              {targetReps ? (
                <>
                  <p className="text-3xl font-bold text-green-400">{targetReps}</p>
                  <p className="text-sm text-slate-300">Repeticiones</p>
                </>
              ) : targetDuration ? (
                <>
                  <p className="text-3xl font-bold text-green-400">{targetDuration}s</p>
                  <p className="text-sm text-slate-300">Duración</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-green-400">-</p>
                  <p className="text-sm text-slate-300">Por definir</p>
                </>
              )}
            </div>
          </div>

          {exercise.notes && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-slate-300">{exercise.notes}</p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-5 px-8 rounded-2xl text-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
        >
          ¡Vamos!
          <FontAwesomeIcon icon={faArrowRight} />
        </button>

        <p className="text-sm text-slate-400 mt-4">
          Prepárate para dar lo mejor de ti
        </p>
      </div>
    </div>
  );
}
