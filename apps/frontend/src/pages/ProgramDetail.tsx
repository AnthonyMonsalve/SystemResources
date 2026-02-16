import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCalendarDays,
  faUsers,
  faSignal,
  faPen,
  faTrash,
  faClone,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import InfoCard from '../components/shared/InfoCard';
import { ConfirmModal } from '../shared/ConfirmModal';
import type { TrainingProgram } from '../types/programs';
import {
  FITNESS_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GOAL_COLORS,
  getProgramProgress,
} from '../types/programs';
import { DAY_LABELS } from '../types/routines';

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = program && user && program.createdById === user.id;
  const isTrainer = user?.role === 'trainer' || user?.role === 'admin';
  const isClient = user?.role === 'client';

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TrainingProgram>(`/programs/${id}`, { token });
      setProgram(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(`/programs/${id}`, {
        method: 'DELETE',
        token,
      });
      navigate('/programs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar programa');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando programa..." />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error || 'Programa no encontrado'}</p>
          <Link to="/programs" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Volver a programas
          </Link>
        </div>
      </div>
    );
  }

  const routineCount = program.routines.length;
  const clientCount = program.assignedClients.length;
  const myAssignment = program.assignedClients.find(
    (pc) => pc.clientId === user?.id
  );
  const progress = myAssignment
    ? getProgramProgress(myAssignment, program.durationWeeks)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/programs"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Volver a programas
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{program.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-600">
                {program.durationWeeks} {program.durationWeeks === 1 ? 'semana' : 'semanas'}
              </span>
              {program.isTemplate && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full inline-flex items-center gap-2">
                  <FontAwesomeIcon icon={faClone} className="text-xs" />
                  Plantilla
                </span>
              )}
              {program.targetGoal && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    GOAL_COLORS[program.targetGoal]
                  }`}
                >
                  {FITNESS_GOAL_LABELS[program.targetGoal]}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex gap-2">
              <Link to={`/programs/${program.id}/edit`} className="btn-primary">
                <FontAwesomeIcon icon={faPen} className="mr-2" />
                Editar
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          )}
        </div>

        {program.description && (
          <p className="text-slate-600 mb-4">{program.description}</p>
        )}

        {program.targetLevel && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">
            <FontAwesomeIcon icon={faSignal} />
            <span className="font-medium">
              Nivel: {FITNESS_LEVEL_LABELS[program.targetLevel]}
            </span>
          </div>
        )}
      </div>

      {/* Progress (if client is assigned) */}
      {myAssignment && progress !== null && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Tu Progreso
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Completado</span>
              <span className="text-2xl font-bold text-primary-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {myAssignment.startDate && (
              <div className="text-sm text-slate-600">
                Iniciado el{' '}
                <span className="font-medium text-slate-900">
                  {new Date(myAssignment.startDate).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon={faListCheck}
          label="Rutinas"
          value={routineCount}
          color="primary"
        />
        <InfoCard
          icon={faUsers}
          label={isTrainer ? 'Clientes Asignados' : 'Participantes'}
          value={clientCount}
          color="blue"
        />
      </div>

      {/* Routines List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Rutinas del Programa
        </h2>
        {routineCount === 0 ? (
          <p className="text-slate-600 text-center py-8">
            Este programa aún no tiene rutinas asignadas
          </p>
        ) : (
          <div className="space-y-3">
            {program.routines.map((routine, index) => (
              <Link
                key={routine.id}
                to={`/routines/${routine.id}`}
                className="block p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{routine.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                        {routine.dayOfWeek && (
                          <span>{DAY_LABELS[routine.dayOfWeek]}</span>
                        )}
                        <span>{routine.exercises.length} ejercicios</span>
                      </div>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className="text-slate-400 rotate-180"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Clients (Trainers only) */}
      {isTrainer && clientCount > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Clientes Asignados
          </h2>
          <div className="space-y-3">
            {program.assignedClients.map((pc) => {
              const clientProgress = getProgramProgress(pc, program.durationWeeks);
              return (
                <div
                  key={pc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{pc.client.name}</h3>
                      <p className="text-sm text-slate-600">{pc.client.email}</p>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      {clientProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${clientProgress}%` }}
                    ></div>
                  </div>
                  {pc.startDate && (
                    <p className="text-xs text-slate-600 mt-2">
                      Asignado el{' '}
                      {new Date(pc.assignedAt).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Created By */}
      {program.createdBy && (
        <div className="card bg-slate-50">
          <p className="text-sm text-slate-600">
            Creado por{' '}
            <span className="font-medium text-slate-900">{program.createdBy.name}</span>
            {' el '}
            <span className="font-medium">
              {new Date(program.createdAt).toLocaleDateString('es-ES')}
            </span>
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Programa"
        description={`¿Estás seguro de que deseas eliminar "${program.name}"? Esta acción no se puede deshacer y afectará a todos los clientes asignados.`}
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
