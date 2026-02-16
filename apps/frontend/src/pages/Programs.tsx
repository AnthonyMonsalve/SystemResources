import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { usePrograms } from '../hooks/usePrograms';
import ProgramCard from '../components/programs/ProgramCard';
import ProgramFilters from '../components/programs/ProgramFilters';
import Pagination from '../components/shared/Pagination';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import type { QueryProgramsParams } from '../types/programs';

export function ProgramsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<QueryProgramsParams>({});
  const [page, setPage] = useState(1);
  const limit = 12;

  const { programs, loading, error, total } = usePrograms(filters, page, limit);
  const totalPages = Math.ceil(total / limit);
  const canCreate = user?.role === 'trainer' || user?.role === 'admin';
  const isClient = user?.role === 'client';

  // Clients only see their assigned programs
  const clientFilters = isClient ? { ...filters, clientId: user?.id } : filters;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isClient ? 'Mis Programas' : 'Programas'}
          </h1>
          <p className="text-slate-600">
            {isClient
              ? 'Programas de entrenamiento asignados'
              : 'Explora los programas de entrenamiento'}
          </p>
        </div>
        {canCreate && (
          <Link to="/programs/new" className="btn-primary">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Crear programa
          </Link>
        )}
      </div>

      {/* Filters - Only show for trainers/admins */}
      {!isClient && (
        <ProgramFilters filters={filters} onFiltersChange={setFilters} />
      )}

      {/* Error */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Cargando programas..." />
        </div>
      ) : programs.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={faCalendarDays}
          title={isClient ? 'No tienes programas asignados' : 'No hay programas'}
          message={
            isClient
              ? 'Tu entrenador aún no te ha asignado ningún programa de entrenamiento'
              : Object.keys(filters).length > 0
              ? 'No se encontraron programas con los filtros seleccionados'
              : 'Aún no hay programas creados'
          }
          action={
            canCreate
              ? {
                  label: 'Crear primer programa',
                  onClick: () => (window.location.href = '/programs/new'),
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                showActions={canCreate && program.createdById === user?.id}
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
