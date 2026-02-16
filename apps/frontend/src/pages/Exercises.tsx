import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../hooks/useExercises';
import ExerciseCard from '../components/exercises/ExerciseCard';
import ExerciseFilters from '../components/exercises/ExerciseFilters';
import Pagination from '../components/shared/Pagination';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import type { QueryExercisesParams } from '../types/exercises';

export function ExercisesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<QueryExercisesParams>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  const { exercises, loading, error, total } = useExercises(filters, page, limit);
  const totalPages = Math.ceil(total / limit);
  const canCreate = user?.role === 'trainer' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ejercicios</h1>
          <p className="text-slate-600">Explora la biblioteca de ejercicios</p>
        </div>
        {canCreate && (
          <Link to="/exercises/new" className="btn-primary">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear ejercicio
          </Link>
        )}
      </div>

      {/* Filters */}
      <ExerciseFilters filters={filters} onFiltersChange={setFilters} />

      {/* Error */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Cargando ejercicios..." />
        </div>
      ) : exercises.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={faDumbbell}
          title="No hay ejercicios"
          message={
            Object.keys(filters).length > 0
              ? 'No se encontraron ejercicios con los filtros seleccionados'
              : 'Aún no hay ejercicios creados'
          }
          action={
            canCreate
              ? {
                  label: 'Crear primer ejercicio',
                  onClick: () => (window.location.href = '/exercises/new'),
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                showActions={canCreate && exercise.createdById === user?.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
