import {
  faChartLine,
  faPlus,
  faTable,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import type { BodyMeasurement, CreateMeasurementDto } from '../../types/measurements';
import { MeasurementCharts } from './MeasurementCharts';

type MeasurementHistoryProps = {
  token: string;
  isClient: boolean;
  clientId?: string;
};

type AddMeasurementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
};

function AddMeasurementModal({
  isOpen,
  onClose,
  onSuccess,
  token,
}: AddMeasurementModalProps) {
  const [formData, setFormData] = useState<CreateMeasurementDto>({
    weight: 0,
    height: undefined,
    bodyFatPercentage: undefined,
    muscleMass: undefined,
    chest: undefined,
    waist: undefined,
    hips: undefined,
    arms: undefined,
    thighs: undefined,
    notes: '',
    measurementDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      // Clean up the payload - only send defined values
      const payload: CreateMeasurementDto = {
        weight: formData.weight,
        measurementDate: formData.measurementDate,
      };

      if (formData.height) payload.height = formData.height;
      if (formData.bodyFatPercentage) payload.bodyFatPercentage = formData.bodyFatPercentage;
      if (formData.muscleMass) payload.muscleMass = formData.muscleMass;
      if (formData.chest) payload.chest = formData.chest;
      if (formData.waist) payload.waist = formData.waist;
      if (formData.hips) payload.hips = formData.hips;
      if (formData.arms) payload.arms = formData.arms;
      if (formData.thighs) payload.thighs = formData.thighs;
      if (formData.notes) payload.notes = formData.notes;

      await apiFetch<BodyMeasurement>('/measurements', {
        method: 'POST',
        token,
        body: payload,
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        weight: 0,
        measurementDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar medición');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Registrar Nueva Medición
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Registra tus medidas corporales para hacer seguimiento de tu progreso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de medición *
            </label>
            <input
              type="date"
              required
              value={formData.measurementDate}
              onChange={(e) =>
                setFormData({ ...formData, measurementDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Basic Measurements */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Medidas básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  max="300"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  step="0.1"
                  value={formData.height || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="170"
                />
              </div>
            </div>
          </div>

          {/* Body Composition */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Composición corporal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  % Grasa corporal
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.bodyFatPercentage || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyFatPercentage: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Masa muscular (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  value={formData.muscleMass || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      muscleMass: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="35.0"
                />
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Medidas corporales (cm)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pecho
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  value={formData.chest || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chest: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cintura
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  value={formData.waist || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waist: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cadera
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  value={formData.hips || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hips: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="95"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brazos
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.arms || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      arms: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Muslos
                </label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  step="0.1"
                  value={formData.thighs || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thighs: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="55"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              maxLength={500}
              placeholder="Ej: Me siento más fuerte, empezando a ver definición..."
            />
            <p className="text-xs text-slate-500 mt-1">
              {(formData.notes?.length || 0)}/500 caracteres
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Medición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MeasurementHistory({
  token,
  isClient,
  clientId,
}: MeasurementHistoryProps) {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');

  const fetchMeasurements = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const endpoint = isClient
        ? '/measurements/my-measurements'
        : `/measurements/client/${clientId}`;

      const data = await apiFetch<BodyMeasurement[]>(endpoint, { token });
      setMeasurements(data);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [token, isClient, clientId]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta medición?')) return;

    try {
      await apiFetch(`/measurements/${id}`, {
        method: 'DELETE',
        token,
      });
      setMeasurements(measurements.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Error al eliminar la medición');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getWeightChange = (index: number) => {
    if (index >= measurements.length - 1) return null;
    const current = measurements[index].weight;
    const previous = measurements[index + 1].weight;
    const diff = current - previous;
    return diff;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Historial de Mediciones
              </h3>
              <p className="text-sm text-slate-600">
                {measurements.length} mediciones registradas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            {measurements.length >= 2 && (
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('charts')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    viewMode === 'charts'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                  Gráficas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    viewMode === 'table'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faTable} className="mr-2" />
                  Tabla
                </button>
              </div>
            )}
            {isClient && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Nueva Medición
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {measurements.length === 0 ? (
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-2xl text-slate-400"
              />
            </div>
            <p className="text-slate-600 mb-4">
              No hay mediciones registradas aún
            </p>
            {isClient && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition"
              >
                Registrar primera medición
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'charts' && measurements.length >= 2 ? (
        <div className="p-6">
          <MeasurementCharts measurements={measurements} />
        </div>
      ) : (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-sm font-semibold text-slate-700 pb-3">
                    Fecha
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-700 pb-3">
                    Peso (kg)
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-700 pb-3">
                    Altura (cm)
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-700 pb-3">
                    % Grasa
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-700 pb-3">
                    Cintura (cm)
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-700 pb-3">
                    Notas
                  </th>
                  {isClient && (
                    <th className="text-right text-sm font-semibold text-slate-700 pb-3">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {measurements.map((measurement, index) => {
                  const weightChange = getWeightChange(index);
                  return (
                    <tr
                      key={measurement.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="py-3 text-sm text-slate-900">
                        {formatDate(measurement.measurementDate)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {measurement.weight}
                          </span>
                          {weightChange !== null && (
                            <span
                              className={`text-xs font-medium ${
                                weightChange > 0
                                  ? 'text-red-600'
                                  : weightChange < 0
                                    ? 'text-green-600'
                                    : 'text-slate-500'
                              }`}
                            >
                              {weightChange > 0 ? '+' : ''}
                              {weightChange.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-slate-700">
                        {measurement.height || '-'}
                      </td>
                      <td className="py-3 text-sm text-slate-700">
                        {measurement.bodyFatPercentage
                          ? `${measurement.bodyFatPercentage}%`
                          : '-'}
                      </td>
                      <td className="py-3 text-sm text-slate-700">
                        {measurement.waist || '-'}
                      </td>
                      <td className="py-3 text-sm text-slate-600 max-w-xs truncate">
                        {measurement.notes || '-'}
                      </td>
                      {isClient && (
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(measurement.id)}
                            className="text-red-600 hover:text-red-700 transition p-2"
                            title="Eliminar medición"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isClient && (
        <AddMeasurementModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchMeasurements();
          }}
          token={token}
        />
      )}
    </div>
  );
}
