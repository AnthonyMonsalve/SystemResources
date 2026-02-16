import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { TrainingProgram } from '../types/programs';
import {
  FitnessLevel,
  FitnessGoal,
  FITNESS_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
} from '../types/programs';

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

  useEffect(() => {
    if (isEditMode) {
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      const data = await apiFetch<TrainingProgram>(`/programs/${id}`, { token });
      setName(data.name);
      setDescription(data.description || '');
      setDurationWeeks(data.durationWeeks.toString());
      setTargetLevel(data.targetLevel || '');
      setTargetGoal(data.targetGoal || '');
      setIsTemplate(data.isTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programa');
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
        durationWeeks: parseInt(durationWeeks),
        targetLevel: targetLevel || undefined,
        targetGoal: targetGoal || undefined,
        isTemplate,
      };

      if (isEditMode) {
        await apiFetch(`/programs/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiFetch('/programs', {
          method: 'POST',
          body: JSON.stringify(payload),
          token,
        });
      }

      navigate('/programs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar programa');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando programa..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h2 className="text-lg font-semibold text-slate-900">Configuración del Programa</h2>

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
                  <span className="text-sm font-medium text-slate-900">Marcar como plantilla</span>
                  <p className="text-xs text-slate-600">Las plantillas se pueden reutilizar para múltiples clientes</p>
                </div>
              </label>
            </div>
          </div>

          {/* Note about routines */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Las rutinas se pueden agregar después de crear el programa desde la página de detalle.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link to="/programs" className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {saving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
