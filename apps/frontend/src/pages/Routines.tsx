import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useRoutines } from '../hooks/useRoutines';
import RoutineCard from '../components/routines/RoutineCard';
import RoutineFilters from '../components/routines/RoutineFilters';
import Pagination from '../components/shared/Pagination';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import type { QueryRoutinesParams } from '../types/routines';

export function RoutinesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<QueryRoutinesParams>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  const { routines, loading, error, total } = useRoutines(filters, page, limit);
  const totalPages = Math.ceil(total / limit);
  const canCreate = user?.role === 'trainer' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rutinas</h1>
          <p className="text-slate-600">Explora las rutinas de entrenamiento</p>
        </div>
        {canCreate && (
          <Link to="/routines/new" className="btn-primary">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear rutina
          </Link>
        )}
      </div>

      {/* Filters */}
      <RoutineFilters filters={filters} onFiltersChange={setFilters} />

      {/* Error */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Cargando rutinas..." />
        </div>
      ) : routines.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={faListCheck}
          title="No hay rutinas"
          message={
            Object.keys(filters).length > 0
              ? 'No se encontraron rutinas con los filtros seleccionados'
              : 'Aún no hay rutinas creadas'
          }
          action={
            canCreate
              ? {
                  label: 'Crear primera rutina',
                  onClick: () => (window.location.href = '/routines/new'),
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                showActions={canCreate && routine.createdById === user?.id}
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
