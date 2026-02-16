import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { Exercise } from '../types/exercises';
import {
  MuscleGroup,
  EquipmentType,
  ExerciseDifficulty,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
} from '../types/exercises';

export function ExerciseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = id !== undefined && id !== 'new';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(MuscleGroup.CHEST);
  const [equipment, setEquipment] = useState<EquipmentType>(EquipmentType.NONE);
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>(ExerciseDifficulty.BEGINNER);
  const [defaultSets, setDefaultSets] = useState('');
  const [defaultReps, setDefaultReps] = useState('');
  const [defaultDuration, setDefaultDuration] = useState('');
  const [defaultRest, setDefaultRest] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchExercise();
    }
  }, [id]);

  const fetchExercise = async () => {
    try {
      const data = await apiFetch<Exercise>(`/exercises/${id}`, { token });
      setName(data.name);
      setDescription(data.description || '');
      setInstructions(data.instructions || '');
      setVideoUrl(data.videoUrl || '');
      setThumbnailUrl(data.thumbnailUrl || '');
      setMuscleGroup(data.muscleGroup);
      setEquipment(data.equipment);
      setDifficulty(data.difficulty);
      setDefaultSets(data.defaultSets?.toString() || '');
      setDefaultReps(data.defaultReps?.toString() || '');
      setDefaultDuration(data.defaultDuration?.toString() || '');
      setDefaultRest(data.defaultRest?.toString() || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name,
        description: description || undefined,
        instructions: instructions || undefined,
        videoUrl: videoUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        muscleGroup,
        equipment,
        difficulty,
        defaultSets: defaultSets ? parseInt(defaultSets) : undefined,
        defaultReps: defaultReps ? parseInt(defaultReps) : undefined,
        defaultDuration: defaultDuration ? parseInt(defaultDuration) : undefined,
        defaultRest: defaultRest ? parseInt(defaultRest) : undefined,
      };

      if (isEditMode) {
        await apiFetch(`/exercises/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiFetch('/exercises', {
          method: 'POST',
          body: JSON.stringify(payload),
          token,
        });
      }

      navigate('/exercises');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar ejercicio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando ejercicio..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/exercises"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Volver a ejercicios
      </Link>

      {/* Form */}
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Editar Ejercicio' : 'Crear Ejercicio'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Información Básica</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                required
                placeholder="Ej: Press de banca"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full h-24 resize-none"
                placeholder="Descripción breve del ejercicio..."
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instrucciones
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="input w-full h-32 resize-none"
                placeholder="Paso a paso de cómo realizar el ejercicio..."
              />
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Multimedia</h2>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL del Video
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="input w-full"
                placeholder="https://..."
              />
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL de la Miniatura
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Exercise Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Detalles del Ejercicio</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Muscle Group */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Grupo Muscular <span className="text-red-500">*</span>
                </label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                  className="input w-full"
                  required
                >
                  {Object.values(MuscleGroup).map((mg) => (
                    <option key={mg} value={mg}>
                      {MUSCLE_GROUP_LABELS[mg]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Equipamiento <span className="text-red-500">*</span>
                </label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value as EquipmentType)}
                  className="input w-full"
                  required
                >
                  {Object.values(EquipmentType).map((eq) => (
                    <option key={eq} value={eq}>
                      {EQUIPMENT_LABELS[eq]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dificultad <span className="text-red-500">*</span>
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
                  className="input w-full"
                  required
                >
                  {Object.values(ExerciseDifficulty).map((diff) => (
                    <option key={diff} value={diff}>
                      {DIFFICULTY_LABELS[diff]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Default Parameters */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Parámetros Predeterminados</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Default Sets */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Series
                </label>
                <input
                  type="number"
                  min="0"
                  value={defaultSets}
                  onChange={(e) => setDefaultSets(e.target.value)}
                  className="input w-full"
                  placeholder="3"
                />
              </div>

              {/* Default Reps */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Repeticiones
                </label>
                <input
                  type="number"
                  min="0"
                  value={defaultReps}
                  onChange={(e) => setDefaultReps(e.target.value)}
                  className="input w-full"
                  placeholder="12"
                />
              </div>

              {/* Default Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duración (seg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  className="input w-full"
                  placeholder="30"
                />
              </div>

              {/* Default Rest */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descanso (seg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={defaultRest}
                  onChange={(e) => setDefaultRest(e.target.value)}
                  className="input w-full"
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link to="/exercises" className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {saving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Ejercicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
