import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import type { RoutineExercise } from '../../types/routines';
import {
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
} from '../../types/exercises';

interface ExerciseViewProps {
  routineExercise: RoutineExercise;
  currentSet: number;
  totalSets: number;
}

export function ExerciseView({
  routineExercise,
  currentSet,
  totalSets,
}: ExerciseViewProps) {
  const { exercise } = routineExercise;

  if (!exercise) return null;

  const targetReps = routineExercise.reps || exercise.defaultReps;
  const targetDuration = routineExercise.duration || exercise.defaultDuration;
  const restTime = routineExercise.rest || exercise.defaultRest;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Exercise Image/Video */}
      {exercise.thumbnailUrl && (
        <div className="aspect-video bg-slate-100 relative">
          <img
            src={exercise.thumbnailUrl}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
          {exercise.videoUrl && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                Video disponible
              </span>
            </div>
          )}
        </div>
      )}

      {/* Exercise Info */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {exercise.name}
        </h2>

        {/* Current Set Info */}
        <div className="mb-4 p-3 bg-primary-50 rounded-xl">
          <p className="text-sm font-medium text-primary-600 mb-1">
            Serie Actual
          </p>
          <p className="text-3xl font-bold text-primary-700">
            {currentSet} / {totalSets}
          </p>
        </div>

        {/* Exercise Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Muscle Group */}
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <FontAwesomeIcon icon={faDumbbell} className="text-sm" />
              <span className="text-xs font-medium">Músculo</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup] || 'N/A'}
            </p>
          </div>

          {/* Equipment */}
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
              <span className="text-xs font-medium">Equipo</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {EQUIPMENT_LABELS[exercise.equipment] || 'N/A'}
            </p>
          </div>
        </div>

        {/* Target Parameters */}
        <div className="space-y-2 mb-4">
          {targetReps && (
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Repeticiones objetivo</span>
              <span className="text-lg font-bold text-slate-900">{targetReps}</span>
            </div>
          )}
          {targetDuration && (
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Duración objetivo</span>
              <span className="text-lg font-bold text-slate-900">{targetDuration}s</span>
            </div>
          )}
          {restTime && (
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Descanso</span>
              <span className="text-lg font-bold text-slate-900">{restTime}s</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        {exercise.instructions && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Instrucciones
            </h3>
            <p className="text-sm text-blue-800 whitespace-pre-line">
              {exercise.instructions}
            </p>
          </div>
        )}

        {/* Notes */}
        {routineExercise.notes && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              Notas del entrenador
            </h3>
            <p className="text-sm text-yellow-800">
              {routineExercise.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
