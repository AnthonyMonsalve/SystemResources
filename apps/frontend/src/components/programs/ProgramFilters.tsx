import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  FitnessLevel,
  FitnessGoal,
  FITNESS_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  QueryProgramsParams,
} from '../../types/programs';

interface ProgramFiltersProps {
  filters: QueryProgramsParams;
  onFiltersChange: (filters: QueryProgramsParams) => void;
}

export default function ProgramFilters({
  filters,
  onFiltersChange,
}: ProgramFiltersProps) {
  const handleFilterChange = (key: keyof QueryProgramsParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handleTemplateFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isTemplate: value === '' ? undefined : value === 'true',
    });
  };

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faFilter} className="text-primary-600" />
        Filtros
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nivel
          </label>
          <select
            value={filters.targetLevel || ''}
            onChange={(e) => handleFilterChange('targetLevel', e.target.value)}
            className="input w-full"
          >
            <option value="">Todos los niveles</option>
            {Object.values(FitnessLevel).map((level) => (
              <option key={level} value={level}>
                {FITNESS_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>

        {/* Goal Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Objetivo
          </label>
          <select
            value={filters.targetGoal || ''}
            onChange={(e) => handleFilterChange('targetGoal', e.target.value)}
            className="input w-full"
          >
            <option value="">Todos los objetivos</option>
            {Object.values(FitnessGoal).map((goal) => (
              <option key={goal} value={goal}>
                {FITNESS_GOAL_LABELS[goal]}
              </option>
            ))}
          </select>
        </div>

        {/* Template Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo
          </label>
          <select
            value={filters.isTemplate === undefined ? '' : filters.isTemplate.toString()}
            onChange={(e) => handleTemplateFilterChange(e.target.value)}
            className="input w-full"
          >
            <option value="">Todos</option>
            <option value="true">Plantillas</option>
            <option value="false">Personalizados</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.targetLevel || filters.targetGoal || filters.isTemplate !== undefined) && (
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
