import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { QueryRoutinesParams } from '../../types/routines';
import {
  DayOfWeek,
  DAY_LABELS,
} from '../../types/routines';

interface RoutineFiltersProps {
  filters: QueryRoutinesParams;
  onFiltersChange: (filters: QueryRoutinesParams) => void;
}

export default function RoutineFilters({
  filters,
  onFiltersChange,
}: RoutineFiltersProps) {
  const handleFilterChange = (key: keyof QueryRoutinesParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handlePublicFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isPublic: value === '' ? undefined : value === 'true',
    });
  };

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faFilter} className="text-primary-600" />
        Filtros
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Day of Week Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Día de la Semana
          </label>
          <select
            value={filters.dayOfWeek || ''}
            onChange={(e) => handleFilterChange('dayOfWeek', e.target.value)}
            className="input w-full"
          >
            <option value="">Todos los días</option>
            {Object.values(DayOfWeek).map((day) => (
              <option key={day} value={day}>
                {DAY_LABELS[day]}
              </option>
            ))}
          </select>
        </div>

        {/* Public/Private Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Visibilidad
          </label>
          <select
            value={filters.isPublic === undefined ? '' : filters.isPublic.toString()}
            onChange={(e) => handlePublicFilterChange(e.target.value)}
            className="input w-full"
          >
            <option value="">Todas</option>
            <option value="true">Públicas</option>
            <option value="false">Privadas</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.dayOfWeek || filters.isPublic !== undefined) && (
        <div className="mt-4">
          <button
            onClick={() => onFiltersChange({})}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faXmark} />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
