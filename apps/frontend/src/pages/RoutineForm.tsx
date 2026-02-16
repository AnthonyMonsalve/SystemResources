import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { Routine } from '../types/routines';
import { DayOfWeek, DAY_LABELS } from '../types/routines';

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

  useEffect(() => {
    if (isEditMode) {
      fetchRoutine();
    }
  }, [id]);

  const fetchRoutine = async () => {
    try {
      const data = await apiFetch<Routine>(`/routines/${id}`, { token });
      setName(data.name);
      setDescription(data.description || '');
      setDayOfWeek(data.dayOfWeek || '');
      setIsPublic(data.isPublic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutina');
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
        dayOfWeek: dayOfWeek || undefined,
        isPublic,
      };

      if (isEditMode) {
        await apiFetch(`/routines/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
          token,
        });
      } else {
        await apiFetch('/routines', {
          method: 'POST',
          body: JSON.stringify(payload),
          token,
        });
      }

      navigate('/routines');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar rutina');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando rutina..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                  <span className="text-sm text-slate-700">Hacer pública esta rutina</span>
                </label>
              </div>
            </div>
          </div>

          {/* Note about exercises */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Los ejercicios se pueden agregar después de crear la rutina desde la página de detalle.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <Link to="/routines" className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {saving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Rutina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
