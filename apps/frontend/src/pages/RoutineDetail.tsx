import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faList,
  faClock,
  faGlobe,
  faPen,
  faTrash,
  faPlay,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import InfoCard from '../components/shared/InfoCard';
import { ConfirmModal } from '../shared/ConfirmModal';
import type { Routine } from '../types/routines';
import {
  DAY_LABELS,
  calculateRoutineDuration,
  formatDuration,
} from '../types/routines';
import { MUSCLE_GROUP_LABELS } from '../types/exercises';

export function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = routine && user && routine.createdById === user.id;
  const isClient = user?.role === 'client';

  useEffect(() => {
    fetchRoutine();
  }, [id]);

  const fetchRoutine = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Routine>(`/routines/${id}`, { token });
      setRoutine(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(`/routines/${id}`, {
        method: 'DELETE',
        token,
      });
      navigate('/routines');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar rutina');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando rutina..." />
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error || 'Rutina no encontrada'}</p>
          <Link to="/routines" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Volver a rutinas
          </Link>
        </div>
      </div>
    );
  }

  const duration = calculateRoutineDuration(routine);
  const exerciseCount = routine.exercises.length;
  const muscleGroups = [
    ...new Set(routine.exercises.map((re) => re.exercise.muscleGroup)),
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/routines"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Volver a rutinas
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{routine.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {routine.dayOfWeek && (
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
                  {DAY_LABELS[routine.dayOfWeek]}
                </span>
              )}
              {routine.isPublic && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faGlobe} className="text-xs" />
                  Pública
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isClient && (
              <button
                onClick={() => navigate(`/workouts/session/${routine.id}`)}
                className="btn-primary"
              >
                <FontAwesomeIcon icon={faPlay} className="mr-2" />
                Comenzar Rutina
              </button>
            )}
            {canEdit && (
              <>
                <Link to={`/routines/${routine.id}/edit`} className="btn-primary">
                  <FontAwesomeIcon icon={faPen} className="mr-2" />
                  Editar
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-danger"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            )}
          </div>
        </div>

        {routine.description && (
          <p className="text-slate-600">{routine.description}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon={faList}
          label="Ejercicios"
          value={exerciseCount}
          color="primary"
        />
        <InfoCard
          icon={faClock}
          label="Duración Estimada"
          value={formatDuration(duration)}
          color="blue"
        />
      </div>

      {/* Muscle Groups */}
      {muscleGroups.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Grupos Musculares Trabajados
          </h2>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((group) => (
              <span
                key={group}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg"
              >
                {MUSCLE_GROUP_LABELS[group]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Exercises Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Ejercicios de la Rutina
        </h2>
        {exerciseCount === 0 ? (
          <p className="text-slate-600 text-center py-8">
            Esta rutina aún no tiene ejercicios asignados
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Ejercicio
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Series
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Reps
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Duración
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    Descanso
                  </th>
                </tr>
              </thead>
              <tbody>
                {routine.exercises.map((re) => (
                  <tr key={re.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 text-slate-900 font-medium">
                      {re.order}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/exercises/${re.exercise.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {re.exercise.name}
                      </Link>
                      {re.notes && (
                        <p className="text-sm text-slate-600 mt-1">{re.notes}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-900">
                      {re.sets || re.exercise.defaultSets || '-'}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-900">
                      {re.reps || re.exercise.defaultReps || '-'}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-900">
                      {re.duration || re.exercise.defaultDuration
                        ? `${re.duration || re.exercise.defaultDuration}s`
                        : '-'}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-900">
                      {re.rest || re.exercise.defaultRest
                        ? `${re.rest || re.exercise.defaultRest}s`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Created By */}
      {routine.createdBy && (
        <div className="card bg-slate-50">
          <p className="text-sm text-slate-600">
            Creado por{' '}
            <span className="font-medium text-slate-900">{routine.createdBy.name}</span>
            {' el '}
            <span className="font-medium">
              {new Date(routine.createdAt).toLocaleDateString('es-ES')}
            </span>
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Rutina"
        description={`¿Estás seguro de que deseas eliminar "${routine.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmTone="danger"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
        busy={deleting}
      />
    </div>
  );
}
