import { Link } from 'react-router-dom';
import type { Exercise } from '../../types/exercises';
import {
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '../../types/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  showActions?: boolean;
}

export default function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
  showActions = false,
}: ExerciseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail or placeholder */}
      {exercise.thumbnailUrl ? (
        <img
          src={exercise.thumbnailUrl}
          alt={exercise.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {exercise.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {exercise.name}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              DIFFICULTY_COLORS[exercise.difficulty]
            }`}
          >
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
        </div>

        {/* Description */}
        {exercise.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {exercise.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <i className="fas fa-dumbbell w-5 text-gray-400"></i>
            <span className="ml-2">{MUSCLE_GROUP_LABELS[exercise.muscleGroup]}</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <i className="fas fa-toolbox w-5 text-gray-400"></i>
            <span className="ml-2">{EQUIPMENT_LABELS[exercise.equipment]}</span>
          </div>

          {(exercise.defaultSets || exercise.defaultReps || exercise.defaultDuration) && (
            <div className="flex items-center text-sm text-gray-700">
              <i className="fas fa-list-ol w-5 text-gray-400"></i>
              <span className="ml-2">
                {exercise.defaultSets && `${exercise.defaultSets} series`}
                {exercise.defaultReps && ` × ${exercise.defaultReps} reps`}
                {exercise.defaultDuration && ` × ${exercise.defaultDuration}s`}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/exercises/${exercise.id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm font-medium"
          >
            Ver detalles
          </Link>

          {showActions && onEdit && (
            <button
              onClick={() => onEdit(exercise)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-edit"></i>
            </button>
          )}

          {showActions && onDelete && (
            <button
              onClick={() => onDelete(exercise)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
