import {
  MuscleGroup,
  EquipmentType,
  ExerciseDifficulty,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  QueryExercisesParams,
} from '../../types/exercises';

interface ExerciseFiltersProps {
  filters: QueryExercisesParams;
  onFiltersChange: (filters: QueryExercisesParams) => void;
}

export default function ExerciseFilters({
  filters,
  onFiltersChange,
}: ExerciseFiltersProps) {
  const handleFilterChange = (key: keyof QueryExercisesParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <i className="fas fa-filter mr-2"></i>
        Filtros
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Muscle Group Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grupo Muscular
          </label>
          <select
            value={filters.muscleGroup || ''}
            onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {Object.values(MuscleGroup).map((group) => (
              <option key={group} value={group}>
                {MUSCLE_GROUP_LABELS[group]}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipamiento
          </label>
          <select
            value={filters.equipment || ''}
            onChange={(e) => handleFilterChange('equipment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {Object.values(EquipmentType).map((equipment) => (
              <option key={equipment} value={equipment}>
                {EQUIPMENT_LABELS[equipment]}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificultad
          </label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {Object.values(ExerciseDifficulty).map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {DIFFICULTY_LABELS[difficulty]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      {(filters.muscleGroup || filters.equipment || filters.difficulty) && (
        <div className="mt-4">
          <button
            onClick={() => onFiltersChange({})}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <i className="fas fa-times mr-1"></i>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
