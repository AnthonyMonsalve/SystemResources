import { Link } from 'react-router-dom';
import {
  Routine,
  DAY_LABELS,
  calculateRoutineDuration,
  formatDuration,
} from '../../types/routines';
import { MUSCLE_GROUP_LABELS } from '../../types/exercises';

interface RoutineCardProps {
  routine: Routine;
  onEdit?: (routine: Routine) => void;
  onDelete?: (routine: Routine) => void;
  showActions?: boolean;
}

export default function RoutineCard({
  routine,
  onEdit,
  onDelete,
  showActions = false,
}: RoutineCardProps) {
  const duration = calculateRoutineDuration(routine);
  const exerciseCount = routine.exercises.length;

  // Get unique muscle groups
  const muscleGroups = [
    ...new Set(routine.exercises.map((re) => re.exercise.muscleGroup)),
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{routine.name}</h3>
            {routine.dayOfWeek && (
              <span className="text-sm text-gray-500">
                {DAY_LABELS[routine.dayOfWeek]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {routine.isPublic && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <i className="fas fa-globe mr-1"></i>
                Pública
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {routine.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {routine.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <i className="fas fa-list w-5 text-gray-400"></i>
            <span className="ml-2">{exerciseCount} ejercicios</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <i className="fas fa-clock w-5 text-gray-400"></i>
            <span className="ml-2">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Muscle Groups */}
        {muscleGroups.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {muscleGroups.slice(0, 3).map((group) => (
                <span
                  key={group}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {MUSCLE_GROUP_LABELS[group]}
                </span>
              ))}
              {muscleGroups.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{muscleGroups.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Exercise Preview */}
        {exerciseCount > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
              Ejercicios
            </h4>
            <div className="space-y-1">
              {routine.exercises.slice(0, 3).map((re) => (
                <div key={re.id} className="text-sm text-gray-700">
                  {re.order}. {re.exercise.name}
                  {re.sets && re.reps && (
                    <span className="text-gray-500 ml-2">
                      ({re.sets} × {re.reps})
                    </span>
                  )}
                </div>
              ))}
              {exerciseCount > 3 && (
                <div className="text-sm text-gray-500 italic">
                  +{exerciseCount - 3} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/routines/${routine.id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm font-medium"
          >
            Ver rutina
          </Link>

          {showActions && onEdit && (
            <button
              onClick={() => onEdit(routine)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-edit"></i>
            </button>
          )}

          {showActions && onDelete && (
            <button
              onClick={() => onDelete(routine)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>

        {/* Created By */}
        {routine.createdBy && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Creado por:{' '}
              <span className="font-medium text-gray-700">
                {routine.createdBy.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
