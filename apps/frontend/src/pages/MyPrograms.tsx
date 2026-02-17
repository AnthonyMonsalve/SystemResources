import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faDumbbell, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import type { TrainingProgram } from '../types/programs';
import type { ProgramClient } from '../types/programs';

type ProgramAssignment = {
  id: string;
  program: TrainingProgram;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  workoutsCompleted: number;
  totalWorkouts: number;
};

export function MyProgramsPage() {
  const { user, token } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    if (user?.id && token) {
      fetchMyPrograms();
    }
  }, [user?.id, token]);

  const fetchMyPrograms = async () => {
    if (!user?.id || !token) return;

    try {
      setLoading(true);
      // Fetch programs assigned to the current user
      const data = await apiFetch<TrainingProgram[]>(
        `/programs/clients/${user.id}`,
        { token }
      );
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programas');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs by assignment status
  const filteredPrograms = programs.filter((program) => {
    if (filter === 'all') return true;

    // Defensive check for assignedClients
    if (!program.assignedClients || !Array.isArray(program.assignedClients)) {
      return false;
    }

    // Find the current user's assignment
    const myAssignment = program.assignedClients.find(
      (pc) => pc.clientId === user?.id
    );

    if (!myAssignment) return false;

    // Calculate status based on dates
    const now = new Date();
    const startDate = new Date(myAssignment.startDate);
    const endDate = myAssignment.endDate ? new Date(myAssignment.endDate) : null;

    if (filter === 'active') {
      // Active if started and not ended, or no end date
      return startDate <= now && (!endDate || endDate >= now);
    } else if (filter === 'completed') {
      // Completed if end date has passed
      return endDate && endDate < now;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando programas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis Programas</h1>
        <p className="text-slate-600 mt-1">
          Programas de entrenamiento asignados por tu entrenador
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'active'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Activos
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Completados
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <EmptyState
          icon={faDumbbell}
          title={
            filter === 'active'
              ? 'No tienes programas activos'
              : filter === 'completed'
              ? 'No has completado programas aún'
              : 'No tienes programas asignados'
          }
          message="Tu entrenador te asignará un programa personalizado pronto."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => {
            // Defensive check for assignedClients
            if (!program.assignedClients || !Array.isArray(program.assignedClients)) {
              return null;
            }

            const myAssignment = program.assignedClients.find(
              (pc) => pc.clientId === user?.id
            );
            if (!myAssignment) return null;

            // Calculate status
            const now = new Date();
            const startDate = new Date(myAssignment.startDate);
            const endDate = myAssignment.endDate
              ? new Date(myAssignment.endDate)
              : null;
            const isActive =
              startDate <= now && (!endDate || endDate >= now);
            const isCompleted = endDate && endDate < now;
            const status = isCompleted
              ? 'completed'
              : isActive
              ? 'active'
              : 'pending';

            return (
              <div
                key={myAssignment.id}
                className="card hover:shadow-lg transition-shadow"
              >
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {program.name}
                    </h3>
                    {program.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {program.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ml-3 ${
                      status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {status === 'active'
                      ? 'Activo'
                      : status === 'completed'
                      ? 'Completado'
                      : 'Pendiente'}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className="text-slate-600 mb-1"
                    />
                    <p className="text-xs text-slate-600">Duración</p>
                    <p className="text-sm font-bold text-slate-900">
                      {program.durationWeeks} sem
                    </p>
                  </div>

                  {program.targetLevel && (
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <FontAwesomeIcon icon={faTrophy} className="text-slate-600 mb-1" />
                      <p className="text-xs text-slate-600">Nivel</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">
                        {program.targetLevel}
                      </p>
                    </div>
                  )}

                  {program.targetGoal && (
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <FontAwesomeIcon
                        icon={faDumbbell}
                        className="text-slate-600 mb-1"
                      />
                      <p className="text-xs text-slate-600">Objetivo</p>
                      <p className="text-sm font-bold text-slate-900 capitalize">
                        {program.targetGoal.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-700">
                    <strong>Inicio:</strong>{' '}
                    {new Date(myAssignment.startDate).toLocaleDateString('es-ES')}
                    {myAssignment.endDate && (
                      <>
                        {' • '}
                        <strong>Fin:</strong>{' '}
                        {new Date(myAssignment.endDate).toLocaleDateString('es-ES')}
                      </>
                    )}
                  </p>
                </div>

                {/* Action */}
                <Link
                  to={`/programs/${program.id}`}
                  className="btn-primary w-full text-center"
                >
                  Ver Detalles del Programa
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
