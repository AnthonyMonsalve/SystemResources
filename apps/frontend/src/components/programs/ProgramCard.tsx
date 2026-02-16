import { Link } from 'react-router-dom';
import type { TrainingProgram } from '../../types/programs';
import {
  FITNESS_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GOAL_COLORS,
  getProgramProgress,
} from '../../types/programs';

interface ProgramCardProps {
  program: TrainingProgram;
  onEdit?: (program: TrainingProgram) => void;
  onDelete?: (program: TrainingProgram) => void;
  showActions?: boolean;
  currentUserId?: string;
}

export default function ProgramCard({
  program,
  onEdit,
  onDelete,
  showActions = false,
  currentUserId,
}: ProgramCardProps) {
  const routineCount = program.routines.length;
  const clientCount = program.assignedClients.length;

  // Check if current user is assigned to this program
  const myAssignment = program.assignedClients.find(
    (pc) => pc.clientId === currentUserId
  );
  const progress = myAssignment
    ? getProgramProgress(myAssignment, program.durationWeeks)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
            <p className="text-sm text-gray-500">{program.durationWeeks} semanas</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {program.isTemplate && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                <i className="fas fa-clone mr-1"></i>
                Plantilla
              </span>
            )}
            {program.targetGoal && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  GOAL_COLORS[program.targetGoal]
                }`}
              >
                {FITNESS_GOAL_LABELS[program.targetGoal]}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {program.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Target Level */}
        {program.targetLevel && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
              <i className="fas fa-signal mr-2"></i>
              Nivel: {FITNESS_LEVEL_LABELS[program.targetLevel]}
            </span>
          </div>
        )}

        {/* Progress (if assigned) */}
        {myAssignment && progress !== null && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progreso</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <i className="fas fa-calendar-alt w-5 text-gray-400"></i>
            <span className="ml-2">{routineCount} rutinas</span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <i className="fas fa-users w-5 text-gray-400"></i>
            <span className="ml-2">{clientCount} clientes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/programs/${program.id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center text-sm font-medium"
          >
            Ver programa
          </Link>

          {showActions && onEdit && (
            <button
              onClick={() => onEdit(program)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-edit"></i>
            </button>
          )}

          {showActions && onDelete && (
            <button
              onClick={() => onDelete(program)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>

        {/* Created By */}
        {program.createdBy && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Creado por:{' '}
              <span className="font-medium text-gray-700">
                {program.createdBy.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
