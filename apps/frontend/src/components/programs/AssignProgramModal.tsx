import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import type { UserProfile } from '../../types/auth';
import type { TrainingProgram } from '../../types/programs';

type AssignProgramModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  program: TrainingProgram;
  preselectedClientId?: string;
};

export function AssignProgramModal({
  isOpen,
  onClose,
  onSuccess,
  program,
  preselectedClientId,
}: AssignProgramModalProps) {
  const { token } = useAuth();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      if (preselectedClientId) {
        setSelectedClientId(preselectedClientId);
      }
    }
  }, [isOpen, preselectedClientId]);

  const fetchClients = async () => {
    if (!token) return;

    try {
      setLoadingClients(true);
      const data = await apiFetch<UserProfile[]>('/trainer/clients', { token });
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Error al cargar clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClientId) return;

    setLoading(true);
    setError('');

    try {
      await apiFetch(`/programs/${program.id}/clients`, {
        method: 'POST',
        token,
        body: {
          clientId: selectedClientId,
          startDate: new Date(startDate).toISOString(),
        },
      });

      onSuccess();
      onClose();
      // Reset form
      setSelectedClientId(preselectedClientId || '');
      setStartDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar programa');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter out clients already assigned to this program
  const assignedClientIds = program.assignedClients.map((ac) => ac.clientId);
  const availableClients = clients.filter((c) => !assignedClientIds.includes(c.id));
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Asignar Programa</h2>
            <p className="text-sm text-slate-600 mt-1">{program.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {preselectedClientId ? 'Cliente seleccionado' : 'Seleccionar cliente *'}
            </label>
            {loadingClients ? (
              <div className="text-sm text-slate-500 py-2">Cargando clientes...</div>
            ) : preselectedClientId && selectedClient ? (
              <div className="p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {selectedClient.name?.[0]?.toUpperCase() || selectedClient.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {selectedClient.name || selectedClient.email}
                    </p>
                    {selectedClient.name && (
                      <p className="text-sm text-slate-600">{selectedClient.email}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : availableClients.length === 0 ? (
              <div className="text-sm text-slate-500 py-2 bg-slate-50 rounded-xl px-4">
                {clients.length === 0
                  ? 'No tienes clientes aún'
                  : 'Todos tus clientes ya tienen este programa asignado'}
              </div>
            ) : (
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleccionar cliente...</option>
                {availableClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name || client.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de inicio *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Program Info */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Detalles del Programa
            </h3>
            <div className="space-y-1 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Duración:</span>
                <span className="font-medium">{program.durationWeeks} semanas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Rutinas:</span>
                <span className="font-medium">{program.routines.length}</span>
              </div>
              {program.targetLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nivel:</span>
                  <span className="font-medium capitalize">
                    {program.targetLevel}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || availableClients.length === 0}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              {loading ? 'Asignando...' : 'Asignar Programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
