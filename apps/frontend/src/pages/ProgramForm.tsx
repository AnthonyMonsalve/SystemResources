import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSave,
  faPlus,
  faTrash,
  faTimes,
  faSearch,
  faCalendarDays,
  faDumbbell,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { TrainingProgram } from '../types/programs';
import type { Routine } from '../types/routines';
import {
  FitnessLevel,
  FitnessGoal,
  FITNESS_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
} from '../types/programs';
import { DAY_LABELS } from '../types/routines';

export function ProgramFormPage() {
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
  const [durationWeeks, setDurationWeeks] = useState('');
  const [targetLevel, setTargetLevel] = useState<FitnessLevel | ''>('');
  const [targetGoal, setTargetGoal] = useState<FitnessGoal | ''>('');
  const [isTemplate, setIsTemplate] = useState(false);

  // Routine management
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [availableRoutines, setAvailableRoutines] = useState<Routine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRoutines, setLoadingRoutines] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchProgram();
    }
  }, [id]);

  useEffect(() => {
    if (showRoutineModal) {
      fetchAvailableRoutines();
    }
  }, [showRoutineModal]);

  const fetchProgram = async () => {
    try {
      const data = await apiFetch<TrainingProgram>(`/programs/${id}`, { token });
      setName(data.name);
      setDescription(data.description || '');
      setDurationWeeks(data.durationWeeks.toString());
      setTargetLevel(data.targetLevel || '');
      setTargetGoal(data.targetGoal || '');
      setIsTemplate(data.isTemplate);
      setRoutines(data.routines || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programa');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoutines = async () => {
    setLoadingRoutines(true);
    try {
      const response = await apiFetch<{ data: Routine[] }>(
        '/routines?limit=100',
        { token }
      );
      setAvailableRoutines(response.data || []);
    } catch (err) {
      console.error('Error loading routines:', err);
    } finally {
      setLoadingRoutines(false);
    }
  };

  const handleAddRoutine = (routine: Routine) => {
    setRoutines([...routines, routine]);
    setShowRoutineModal(false);
    setSearchQuery('');
  };

  const handleRemoveRoutine = (routineId: string) => {
    setRoutines(routines.filter((r) => r.id !== routineId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        name,
        description: description || undefined,
        durationWeeks: parseInt(durationWeeks),
        targetLevel: targetLevel || undefined,
        targetGoal: targetGoal || undefined,
        isTemplate,
        routineIds: routines.map((r) => r.id),
      };

      let programId = id;

      if (isEditMode) {
        // Update program
        await apiFetch(`/programs/${id}`, {
          method: 'PATCH',
          body: payload,
          token,
        });

        // Update routines: set programId for selected routines
        // First, fetch current program to see which routines to unlink
        const currentProgram = await apiFetch<TrainingProgram>(
          `/programs/${id}`,
          { token }
        );

        // Unlink routines that were removed
        const currentRoutineIds = new Set(currentProgram.routines.map((r) => r.id));
        const newRoutineIds = new Set(routines.map((r) => r.id));

        for (const routineId of currentRoutineIds) {
          if (!newRoutineIds.has(routineId)) {
            // Remove programId from this routine
            await apiFetch(`/routines/${routineId}`, {
              method: 'PATCH',
              body: { programId: null },
              token,
            });
          }
        }

        // Link new routines
        for (const routineId of newRoutineIds) {
          if (!currentRoutineIds.has(routineId)) {
            // Add programId to this routine
            await apiFetch(`/routines/${routineId}`, {
              method: 'PATCH',
              body: { programId: id },
              token,
            });
          }
        }
      } else {
        // Create new program
        const newProgram = await apiFetch<TrainingProgram>('/programs', {
          method: 'POST',
          body: payload,
          token,
        });
        programId = newProgram.id;
      }

      navigate(`/programs/${programId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar programa');
    } finally {
      setSaving(false);
    }
  };

  const filteredRoutines = availableRoutines.filter((routine) =>
    routine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando programa..." />
      </div>
    );
  }

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

      {/* Form */}
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Editar Programa' : 'Crear Programa'}
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
                placeholder="Ej: Programa de Hipertrofia"
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
                placeholder="Descripción breve del programa..."
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duración (semanas) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="input w-full"
                required
                placeholder="8"
              />
            </div>
          </div>

          {/* Target Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Configuración del Programa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nivel Objetivo
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value as FitnessLevel | '')}
                  className="input w-full"
                >
                  <option value="">Sin especificar</option>
                  {Object.values(FitnessLevel).map((level) => (
                    <option key={level} value={level}>
                      {FITNESS_LEVEL_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Goal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Objetivo
                </label>
                <select
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value as FitnessGoal | '')}
                  className="input w-full"
                >
                  <option value="">Sin especificar</option>
                  {Object.values(FitnessGoal).map((goal) => (
                    <option key={goal} value={goal}>
                      {FITNESS_GOAL_LABELS[goal]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Is Template */}
            <div>
              <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isTemplate}
                  onChange={(e) => setIsTemplate(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    Marcar como plantilla
                  </span>
                  <p className="text-xs text-slate-600">
                    Las plantillas se pueden reutilizar para múltiples clientes
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Routines Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Rutinas del Programa ({routines.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowRoutineModal(true)}
                className="btn-primary text-sm"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Agregar Rutina
              </button>
            </div>

            {routines.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-slate-600">
                  No hay rutinas agregadas aún. Haz clic en "Agregar Rutina" para
                  comenzar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {routine.name}
                        </h3>
                        {routine.description && (
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {routine.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          {routine.dayOfWeek && (
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faCalendarDays} />
                              <span>{DAY_LABELS[routine.dayOfWeek]}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faDumbbell} />
                            <span>{routine.exercises?.length || 0} ejercicios</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRoutine(routine.id)}
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
            <Link to="/programs" className="btn-secondary">
              Cancelar
            </Link>
            <button type="submit" disabled={saving} className="btn-primary">
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {saving
                ? 'Guardando...'
                : isEditMode
                  ? 'Guardar Cambios'
                  : 'Crear Programa'}
            </button>
          </div>
        </form>
      </div>

      {/* Routine Selection Modal */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Seleccionar Rutina
              </h2>
              <button
                onClick={() => {
                  setShowRoutineModal(false);
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
                  placeholder="Buscar rutina..."
                  className="input w-full pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Routine List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingRoutines ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Cargando rutinas..." />
                </div>
              ) : filteredRoutines.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No se encontraron rutinas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredRoutines.map((routine) => {
                    const isAlreadyAdded = routines.some((r) => r.id === routine.id);

                    return (
                      <button
                        key={routine.id}
                        type="button"
                        onClick={() => handleAddRoutine(routine)}
                        disabled={isAlreadyAdded}
                        className={`p-4 border rounded-xl text-left transition ${
                          isAlreadyAdded
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                              {routine.name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                              {routine.dayOfWeek && (
                                <span>
                                  <FontAwesomeIcon
                                    icon={faCalendarDays}
                                    className="mr-1"
                                  />
                                  {DAY_LABELS[routine.dayOfWeek]}
                                </span>
                              )}
                              <span>
                                <FontAwesomeIcon
                                  icon={faDumbbell}
                                  className="mr-1"
                                />
                                {routine.exercises?.length || 0} ejercicios
                              </span>
                            </div>
                          </div>
                          {isAlreadyAdded && (
                            <span className="text-xs text-slate-500">
                              Ya agregada
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
