import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays, faArrowLeft, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { usePrograms } from '../hooks/usePrograms';
import ProgramCard from '../components/programs/ProgramCard';
import ProgramFilters from '../components/programs/ProgramFilters';
import Pagination from '../components/shared/Pagination';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import { AssignProgramModal } from '../components/programs/AssignProgramModal';
import type { QueryProgramsParams, TrainingProgram } from '../types/programs';
import type { UserProfile } from '../types/auth';

export function ProgramsPage() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assignToClientId = searchParams.get('assignTo');

  const [filters, setFilters] = useState<QueryProgramsParams>({});
  const [page, setPage] = useState(1);
  const limit = 12;
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignToClient, setAssignToClient] = useState<UserProfile | null>(null);

  const { programs, loading, error, total, refetch } = usePrograms(filters, page, limit);
  const totalPages = Math.ceil(total / limit);
  const canCreate = user?.role === 'trainer' || user?.role === 'admin';
  const isClient = user?.role === 'client';

  // Clients only see their assigned programs
  const clientFilters = isClient ? { ...filters, clientId: user?.id } : filters;

  // Load client info if assignTo parameter exists
  useEffect(() => {
    if (assignToClientId && token) {
      fetchClientInfo();
    }
  }, [assignToClientId, token]);

  const fetchClientInfo = async () => {
    if (!assignToClientId || !token) return;

    try {
      const clientData = await apiFetch<UserProfile>(
        `/trainer/clients/${assignToClientId}`,
        { token }
      );
      setAssignToClient(clientData);
    } catch (err) {
      console.error('Error loading client info:', err);
    }
  };

  const handleAssign = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    refetch();
  };

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

      {/* Assign To Client Banner */}
      {assignToClient && (
        <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {assignToClient.name?.[0]?.toUpperCase() || assignToClient.email[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faUser} className="text-primary-600 text-sm" />
                  <span className="text-sm font-medium text-primary-900">
                    Asignando programa a:
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {assignToClient.name || assignToClient.email}
                </h3>
                {assignToClient.name && (
                  <p className="text-sm text-slate-600">{assignToClient.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/my-clients')}
              className="btn-secondary text-sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Volver a Clientes
            </button>
          </div>
          <p className="text-sm text-slate-700 mt-3">
            Selecciona un programa de la lista para asignárselo a este cliente.
          </p>
        </div>
      )}

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
                onAssign={canCreate ? handleAssign : undefined}
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

      {/* Assign Program Modal */}
      {selectedProgram && (
        <AssignProgramModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={handleAssignSuccess}
          program={selectedProgram}
          preselectedClientId={assignToClientId || undefined}
        />
      )}
    </div>
  );
}
