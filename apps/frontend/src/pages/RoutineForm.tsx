import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faPlus,
  faTrash,
  faGripVertical,
  faTimes,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { Routine, AddExerciseToRoutineData } from '../types/routines';
import type { Exercise } from '../types/exercises';
import { DayOfWeek, DAY_LABELS } from '../types/routines';
import { MUSCLE_GROUP_LABELS } from '../types/exercises';

interface ExerciseFormData extends AddExerciseToRoutineData {
  tempId: string;
  exercise?: Exercise;
}

export function RoutineFormPage() {
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
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | ''>('');
  const [isPublic, setIsPublic] = useState(false);

  // Exercise management
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchRoutine();
    }
  }, [id]);

  useEffect(() => {
    if (showExerciseModal) {
      fetchAvailableExercises();
    }
  }, [showExerciseModal]);

  const fetchRoutine = async () => {
    try {
      const data = await apiFetch<Routine>(`/routines/${id}`, { token });
      setName(data.name);
      setDescription(data.description || '');
      setDayOfWeek(data.dayOfWeek || '');
      setIsPublic(data.isPublic);

      // Convert existing routine exercises to form data
      const exerciseData: ExerciseFormData[] = data.exercises.map((re) => ({
        tempId: re.id,
        exerciseId: re.exerciseId,
        exercise: re.exercise,
        order: re.order,
        sets: re.sets,
        reps: re.reps,
        duration: re.duration,
        rest: re.rest,
        notes: re.notes,
      }));
      setExercises(exerciseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutina');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExercises = async () => {
    setLoadingExercises(true);
    try {
      const response = await apiFetch<{ data: Exercise[] }>(
        '/exercises?limit=100',
        { token }
      );
      setAvailableExercises(response.data || []);
    } catch (err) {
      console.error('Error loading exercises:', err);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: ExerciseFormData = {
      tempId: `temp-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      order: exercises.length + 1,
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      duration: exercise.defaultDuration,
      rest: exercise.defaultRest,
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseModal(false);
    setSearchQuery('');
  };

  const handleRemoveExercise = (tempId: string) => {
    const updatedExercises = exercises
      .filter((ex) => ex.tempId !== tempId)
      .map((ex, index) => ({ ...ex, order: index + 1 }));
    setExercises(updatedExercises);
  };

  const handleUpdateExercise = (tempId: string, field: string, value: any) => {
    setExercises(
      exercises.map((ex) =>
        ex.tempId === tempId ? { ...ex, [field]: value } : ex
      )
    );
  };

  const handleMoveExercise = (tempId: string, direction: 'up' | 'down') => {
    const index = exercises.findIndex((ex) => ex.tempId === tempId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === exercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...exercises];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newExercises[index], newExercises[swapIndex]] = [
      newExercises[swapIndex],
      newExercises[index],
    ];

    // Update order
    const reorderedExercises = newExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1,
    }));
    setExercises(reorderedExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const routinePayload = {
        name,
        description: description || undefined,
        dayOfWeek: dayOfWeek || undefined,
        isPublic,
      };

      let routineId = id;

      // Create or update routine
      if (isEditMode) {
        await apiFetch(`/routines/${id}`, {
          method: 'PATCH',
          body: routinePayload,
          token,
        });
      } else {
        const newRoutine = await apiFetch<Routine>('/routines', {
          method: 'POST',
          body: routinePayload,
          token,
        });
        routineId = newRoutine.id;
      }

      // In edit mode, remove all existing exercises and add new ones
      // This is simpler than trying to diff and update
      if (isEditMode && routineId) {
        // Fetch current routine to get exercise IDs
        const currentRoutine = await apiFetch<Routine>(`/routines/${routineId}`, {
          token,
        });

        // Delete all existing exercises
        for (const re of currentRoutine.exercises) {
          await apiFetch(`/routines/${routineId}/exercises/${re.exerciseId}`, {
            method: 'DELETE',
            token,
          });
        }
      }

      // Add all exercises
      if (routineId) {
        for (const ex of exercises) {
          const exercisePayload: AddExerciseToRoutineData = {
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            duration: ex.duration,
            rest: ex.rest,
            notes: ex.notes,
          };

          await apiFetch(`/routines/${routineId}/exercises`, {
            method: 'POST',
            body: exercisePayload,
            token,
          });
        }
      }

      navigate(`/routines/${routineId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar rutina');
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando rutina..." />
      </div>
    );
  }

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

      {/* Form */}
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Editar Rutina' : 'Crear Rutina'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Información Básica
            </h2>

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
                placeholder="Ej: Día de Pecho"
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
                placeholder="Descripción breve de la rutina..."
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Programación</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day of Week */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Día de la Semana
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek | '')}
                  className="input w-full"
                >
                  <option value="">Sin asignar</option>
                  {Object.values(DayOfWeek).map((day) => (
                    <option key={day} value={day}>
                      {DAY_LABELS[day]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Public */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Visibilidad
                </label>
                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">
                    Hacer pública esta rutina
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Exercises Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Ejercicios ({exercises.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowExerciseModal(true)}
                className="btn-primary text-sm"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Agregar Ejercicio
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-600">
                  No hay ejercicios agregados aún. Haz clic en "Agregar Ejercicio"
                  para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex, index) => (
                  <div
                    key={ex.tempId}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag handle & order */}
                      <div className="flex flex-col items-center gap-1">
                        <FontAwesomeIcon
                          icon={faGripVertical}
                          className="text-slate-400 cursor-move"
                        />
                        <span className="text-xs font-bold text-slate-600">
                          #{ex.order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(ex.tempId, 'up')}
                            disabled={index === 0}
                            className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(ex.tempId, 'down')}
                            disabled={index === exercises.length - 1}
                            className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      {/* Exercise info & config */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {ex.exercise?.name}
                          </h3>
                          <p className="text-xs text-slate-600">
                            {ex.exercise
                              ? MUSCLE_GROUP_LABELS[ex.exercise.muscleGroup]
                              : ''}
                          </p>
                        </div>

                        {/* Configuration Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Series
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={ex.sets || ''}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.tempId,
                                  'sets',
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              className="input w-full text-sm"
                              placeholder="3"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Reps
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={ex.reps || ''}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.tempId,
                                  'reps',
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              className="input w-full text-sm"
                              placeholder="12"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Duración (s)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={ex.duration || ''}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.tempId,
                                  'duration',
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              className="input w-full text-sm"
                              placeholder="60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Descanso (s)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={ex.rest || ''}
                              onChange={(e) =>
                                handleUpdateExercise(
                                  ex.tempId,
                                  'rest',
                                  parseInt(e.target.value) || undefined
                                )
                              }
                              className="input w-full text-sm"
                              placeholder="90"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Notas (opcional)
                          </label>
                          <input
                            type="text"
                            value={ex.notes || ''}
                            onChange={(e) =>
                              handleUpdateExercise(ex.tempId, 'notes', e.target.value)
                            }
                            className="input w-full text-sm"
                            placeholder="Ej: Aumentar peso cada semana"
                          />
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(ex.tempId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link to="/routines" className="btn-secondary">
              Cancelar
            </Link>
            <button type="submit" disabled={saving} className="btn-primary">
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {saving
                ? 'Guardando...'
                : isEditMode
                  ? 'Guardar Cambios'
                  : 'Crear Rutina'}
            </button>
          </div>
        </form>
      </div>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Seleccionar Ejercicio
              </h2>
              <button
                onClick={() => {
                  setShowExerciseModal(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-slate-200">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar ejercicio..."
                  className="input w-full pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingExercises ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Cargando ejercicios..." />
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No se encontraron ejercicios</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredExercises.map((exercise) => {
                    const isAlreadyAdded = exercises.some(
                      (ex) => ex.exerciseId === exercise.id
                    );

                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => handleAddExercise(exercise)}
                        disabled={isAlreadyAdded}
                        className={`p-4 border rounded-xl text-left transition ${
                          isAlreadyAdded
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {exercise.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                              {exercise.defaultSets && (
                                <span className="ml-2">
                                  • {exercise.defaultSets} series
                                </span>
                              )}
                              {exercise.defaultReps && (
                                <span className="ml-2">
                                  • {exercise.defaultReps} reps
                                </span>
                              )}
                            </p>
                          </div>
                          {isAlreadyAdded && (
                            <span className="text-xs text-slate-500">
                              Ya agregado
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
