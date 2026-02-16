import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faDumbbell,
  faToolbox,
  faSignal,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import InfoCard from '../components/shared/InfoCard';
import ParamCard from '../components/shared/ParamCard';
import { ConfirmModal } from '../shared/ConfirmModal';
import type {
  Exercise,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '../types/exercises';
import {
  MuscleGroup,
  EquipmentType,
  ExerciseDifficulty,
} from '../types/exercises';

// Import labels
const muscleLabels: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'Pecho',
  [MuscleGroup.BACK]: 'Espalda',
  [MuscleGroup.SHOULDERS]: 'Hombros',
  [MuscleGroup.ARMS]: 'Brazos',
  [MuscleGroup.LEGS]: 'Piernas',
  [MuscleGroup.CORE]: 'Core',
  [MuscleGroup.FULL_BODY]: 'Cuerpo Completo',
  [MuscleGroup.CARDIO]: 'Cardio',
};

const equipmentLabels: Record<EquipmentType, string> = {
  [EquipmentType.NONE]: 'Sin Equipo',
  [EquipmentType.DUMBBELLS]: 'Mancuernas',
  [EquipmentType.BARBELL]: 'Barra',
  [EquipmentType.KETTLEBELL]: 'Kettlebell',
  [EquipmentType.RESISTANCE_BAND]: 'Banda Elástica',
  [EquipmentType.MACHINE]: 'Máquina',
  [EquipmentType.CABLE]: 'Polea',
  [EquipmentType.OTHER]: 'Otro',
};

const difficultyLabels: Record<ExerciseDifficulty, string> = {
  [ExerciseDifficulty.BEGINNER]: 'Principiante',
  [ExerciseDifficulty.INTERMEDIATE]: 'Intermedio',
  [ExerciseDifficulty.ADVANCED]: 'Avanzado',
};

const difficultyColors: Record<ExerciseDifficulty, string> = {
  [ExerciseDifficulty.BEGINNER]: 'bg-green-100 text-green-800',
  [ExerciseDifficulty.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800',
  [ExerciseDifficulty.ADVANCED]: 'bg-red-100 text-red-800',
};

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = exercise && user && exercise.createdById === user.id;

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Exercise>(`/exercises/${id}`, { token });
      setExercise(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiFetch(`/exercises/${id}`, {
        method: 'DELETE',
        token,
      });
      navigate('/exercises');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar ejercicio');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando ejercicio..." />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error || 'Ejercicio no encontrado'}</p>
          <Link to="/exercises" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Volver a ejercicios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/exercises"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Volver a ejercicios
      </Link>

      {/* Hero Section */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Media */}
          <div className="space-y-4">
            {exercise.videoUrl ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                <video
                  src={exercise.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={exercise.thumbnailUrl}
                >
                  Tu navegador no soporta videos.
                </video>
              </div>
            ) : exercise.thumbnailUrl ? (
              <img
                src={exercise.thumbnailUrl}
                alt={exercise.name}
                className="w-full aspect-video object-cover rounded-xl"
              />
            ) : (
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">
                  {exercise.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-slate-900">{exercise.name}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                  difficultyColors[exercise.difficulty]
                }`}
              >
                {difficultyLabels[exercise.difficulty]}
              </span>
            </div>

            {exercise.description && (
              <p className="text-slate-600">{exercise.description}</p>
            )}

            {/* Action Buttons */}
            {canEdit && (
              <div className="flex gap-2 pt-4">
                <Link to={`/exercises/${exercise.id}/edit`} className="btn-primary flex-1">
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
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={faDumbbell}
          label="Grupo Muscular"
          value={muscleLabels[exercise.muscleGroup]}
          color="primary"
        />
        <InfoCard
          icon={faToolbox}
          label="Equipamiento"
          value={equipmentLabels[exercise.equipment]}
          color="blue"
        />
        <InfoCard
          icon={faSignal}
          label="Dificultad"
          value={difficultyLabels[exercise.difficulty]}
          color="accent"
        />
      </div>

      {/* Parameters */}
      {(exercise.defaultSets || exercise.defaultReps || exercise.defaultDuration || exercise.defaultRest) && (
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Parámetros Recomendados
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exercise.defaultSets && (
              <ParamCard label="Series" value={exercise.defaultSets} icon="🔢" />
            )}
            {exercise.defaultReps && (
              <ParamCard label="Repeticiones" value={exercise.defaultReps} icon="🔁" />
            )}
            {exercise.defaultDuration && (
              <ParamCard label="Duración" value={exercise.defaultDuration} unit="seg" icon="⏱️" />
            )}
            {exercise.defaultRest && (
              <ParamCard label="Descanso" value={exercise.defaultRest} unit="seg" icon="⏸️" />
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Instrucciones
          </h2>
          <div className="prose max-w-none">
            <p className="text-slate-700 whitespace-pre-line">{exercise.instructions}</p>
          </div>
        </div>
      )}

      {/* Created By */}
      {exercise.createdBy && (
        <div className="card bg-slate-50">
          <p className="text-sm text-slate-600">
            Creado por{' '}
            <span className="font-medium text-slate-900">{exercise.createdBy.name}</span>
            {' el '}
            <span className="font-medium">
              {new Date(exercise.createdAt).toLocaleDateString('es-ES')}
            </span>
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Ejercicio"
        description={`¿Estás seguro de que deseas eliminar "${exercise.name}"? Esta acción no se puede deshacer.`}
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
