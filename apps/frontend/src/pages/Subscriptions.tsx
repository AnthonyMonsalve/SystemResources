import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faBan,
  faPlus,
  faDumbbell,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import type { UserProfile } from '../types/auth';
import type { TrainingProgram } from '../types/programs';
import type { Routine } from '../types/routines';

export function SubscriptionsPage() {
  const { token } = useAuth();
  const { showToast, confirm, alert: showAlert } = useAlert();
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [clientPrograms, setClientPrograms] = useState<TrainingProgram[]>([]);
  const [clientRoutines, setClientRoutines] = useState<Routine[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allClients, expiring] = await Promise.all([
        apiFetch<UserProfile[]>('/trainer/clients', { token }),
        apiFetch<UserProfile[]>('/trainer/subscriptions/expiring-soon', { token }),
      ]);
      setClients(allClients);
      setExpiringSoon(expiring);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (client: UserProfile) => {
    setSelectedClient(client);
    setStartDate(
      client.subscriptionStartDate
        ? new Date(client.subscriptionStartDate).toISOString().split('T')[0]
        : ''
    );
    setEndDate(
      client.subscriptionEndDate
        ? new Date(client.subscriptionEndDate).toISOString().split('T')[0]
        : ''
    );
    setShowEditModal(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setSaving(true);
    try {
      await apiFetch(`/trainer/clients/${selectedClient.id}/subscription`, {
        method: 'PATCH',
        body: {
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
        },
        token,
      });
      setShowEditModal(false);
      showToast('Suscripción actualizada exitosamente', 'success');
      fetchData();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al actualizar suscripción',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExtendSubscription = async (client: UserProfile, days: number) => {
    const confirmed = await confirm({
      title: 'Extender suscripción',
      message: `¿Extender la suscripción de ${client.name || client.email} por ${days} días?`,
      confirmText: 'Extender',
    });

    if (!confirmed) {
      return;
    }

    try {
      const currentEndDate = client.subscriptionEndDate
        ? new Date(client.subscriptionEndDate)
        : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + days);

      await apiFetch(`/trainer/clients/${client.id}/subscription`, {
        method: 'PATCH',
        body: {
          subscriptionStartDate: client.subscriptionStartDate || new Date().toISOString(),
          subscriptionEndDate: newEndDate.toISOString(),
          subscriptionStatus: 'active',
        },
        token,
      });

      showToast(`Suscripción extendida por ${days} días exitosamente`, 'success');
      fetchData();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al extender suscripción',
      });
    }
  };

  const handleCancelSubscription = async (client: UserProfile) => {
    const confirmed = await confirm({
      title: 'Cancelar suscripción',
      message: `¿Cancelar la suscripción de ${client.name || client.email}? El cliente perderá acceso inmediatamente.`,
      confirmText: 'Cancelar suscripción',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(`/trainer/clients/${client.id}/subscription`, {
        method: 'PATCH',
        body: {
          subscriptionStartDate: client.subscriptionStartDate || new Date().toISOString(),
          subscriptionEndDate: new Date().toISOString(),
          subscriptionStatus: 'cancelled',
        },
        token,
      });

      showToast('Suscripción cancelada exitosamente', 'success');
      fetchData();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al cancelar suscripción',
      });
    }
  };

  const openDetailsModal = async (client: UserProfile) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      // Fetch client's programs and routines
      const [programs, routines] = await Promise.all([
        apiFetch<TrainingProgram[]>(`/programs/clients/${client.id}`, { token }).catch(() => []),
        apiFetch<Routine[]>(`/routines?clientId=${client.id}`, { token }).catch(() => []),
      ]);
      setClientPrograms(programs);
      setClientRoutines(routines);
    } catch (err) {
      console.error('Error loading client details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getSubscriptionStatus = (client: UserProfile) => {
    if (!client.subscriptionEndDate) {
      return { status: 'none', label: 'Sin suscripción', color: 'slate' };
    }

    const now = new Date();
    const endDate = new Date(client.subscriptionEndDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (client.subscriptionStatus === 'cancelled') {
      return { status: 'cancelled', label: 'Cancelada', color: 'red', daysLeft };
    }

    if (endDate < now || client.subscriptionStatus === 'expired') {
      return { status: 'expired', label: 'Vencida', color: 'red', daysLeft };
    }

    if (daysLeft <= 7) {
      return { status: 'expiring', label: `Vence en ${daysLeft} días`, color: 'yellow', daysLeft };
    }

    return { status: 'active', label: `Activa (${daysLeft} días)`, color: 'green', daysLeft };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando suscripciones..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Suscripciones</h1>
        <p className="text-slate-600 mt-1">
          Administra las suscripciones de tus clientes
        </p>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-yellow-600 text-xl mt-1"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                ⚠️ Suscripciones próximas a vencer ({expiringSoon.length})
              </h2>
              <div className="space-y-2">
                {expiringSoon.map((client) => {
                  const sub = getSubscriptionStatus(client);
                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {client.name || client.email}
                        </p>
                        <p className="text-sm text-slate-600">
                          Vence:{' '}
                          {client.subscriptionEndDate &&
                            new Date(client.subscriptionEndDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-yellow-700">
                          {sub.label}
                        </span>
                        <button
                          onClick={() => openEditModal(client)}
                          className="btn-primary text-sm py-1"
                        >
                          Renovar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Clients Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Todos los Clientes
        </h2>

        {clients.length === 0 ? (
          <EmptyState
            icon={faCalendarDays}
            title="No tienes clientes"
            message="Invita clientes desde la sección Mis Clientes"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Inicio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Vencimiento
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const sub = getSubscriptionStatus(client);
                  return (
                    <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {client.name || 'Sin nombre'}
                          </p>
                          <p className="text-sm text-slate-600">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-700">
                          {client.subscriptionStartDate
                            ? new Date(client.subscriptionStartDate).toLocaleDateString('es-ES')
                            : '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-700">
                          {client.subscriptionEndDate
                            ? new Date(client.subscriptionEndDate).toLocaleDateString('es-ES')
                            : '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            sub.color === 'green'
                              ? 'bg-green-100 text-green-700'
                              : sub.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-700'
                              : sub.color === 'red'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              sub.status === 'active'
                                ? faCheckCircle
                                : sub.status === 'expiring'
                                ? faClock
                                : sub.status === 'expired'
                                ? faTimesCircle
                                : faTimesCircle
                            }
                            className="text-xs"
                          />
                          {sub.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-end">
                          {client.subscriptionEndDate && sub.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleExtendSubscription(client, 5)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                                title="Extender 5 días"
                              >
                                +5d
                              </button>
                              <button
                                onClick={() => handleExtendSubscription(client, 15)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                                title="Extender 15 días"
                              >
                                +15d
                              </button>
                              <button
                                onClick={() => handleExtendSubscription(client, 30)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                                title="Extender 30 días"
                              >
                                +30d
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDetailsModal(client)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => openEditModal(client)}
                            className="px-2 py-1 text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 rounded"
                          >
                            {client.subscriptionEndDate ? 'Editar' : 'Config'}
                          </button>
                          {client.subscriptionEndDate && sub.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelSubscription(client)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                              title="Cancelar suscripción"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedClient.name || selectedClient.email}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{selectedClient.email}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Subscription Info */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Estado de Suscripción</p>
                    <p className="font-semibold text-slate-900">
                      {getSubscriptionStatus(selectedClient).label}
                    </p>
                  </div>
                  {selectedClient.subscriptionEndDate && (
                    <div>
                      <p className="text-xs text-slate-600">Vencimiento</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(selectedClient.subscriptionEndDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {selectedClient.subscriptionEndDate &&
                  getSubscriptionStatus(selectedClient).status !== 'cancelled' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                      <span className="text-xs text-slate-600">Extender:</span>
                      <button
                        onClick={() => {
                          handleExtendSubscription(selectedClient, 5);
                          setShowDetailsModal(false);
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                      >
                        +5 días
                      </button>
                      <button
                        onClick={() => {
                          handleExtendSubscription(selectedClient, 15);
                          setShowDetailsModal(false);
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                      >
                        +15 días
                      </button>
                      <button
                        onClick={() => {
                          handleExtendSubscription(selectedClient, 30);
                          setShowDetailsModal(false);
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                      >
                        +30 días
                      </button>
                      <button
                        onClick={() => {
                          handleCancelSubscription(selectedClient);
                          setShowDetailsModal(false);
                        }}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded ml-auto"
                      >
                        <FontAwesomeIcon icon={faBan} className="mr-1" />
                        Cancelar Suscripción
                      </button>
                    </div>
                  )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" text="Cargando detalles..." />
                </div>
              ) : (
                <>
                  {/* Programs Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-primary-600" />
                      Programas Asignados ({clientPrograms.length})
                    </h3>
                    {clientPrograms.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">
                        No tiene programas asignados
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {clientPrograms.map((program) => (
                          <div
                            key={program.id}
                            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-900">{program.name}</h4>
                                {program.description && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    {program.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                  <span>
                                    <strong>Duración:</strong> {program.durationWeeks} semanas
                                  </span>
                                  {program.targetLevel && (
                                    <span>
                                      <strong>Nivel:</strong> {program.targetLevel}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Link
                                to={`/programs/${program.id}`}
                                className="text-xs text-primary-600 hover:text-primary-700"
                              >
                                Ver →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Routines Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faListCheck} className="text-primary-600" />
                      Rutinas ({clientRoutines.length})
                    </h3>
                    {clientRoutines.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">No tiene rutinas asignadas</p>
                    ) : (
                      <div className="space-y-3">
                        {clientRoutines.map((routine) => (
                          <div
                            key={routine.id}
                            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-900">{routine.name}</h4>
                                {routine.description && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    {routine.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                  {routine.dayOfWeek && (
                                    <span>
                                      <strong>Día:</strong> {routine.dayOfWeek}
                                    </span>
                                  )}
                                  <span>
                                    <strong>Ejercicios:</strong>{' '}
                                    {routine.exercises?.length || 0}
                                  </span>
                                </div>
                              </div>
                              <Link
                                to={`/routines/${routine.id}`}
                                className="text-xs text-primary-600 hover:text-primary-700"
                              >
                                Ver →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-secondary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Gestionar Suscripción
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Cliente: <strong>{selectedClient.name || selectedClient.email}</strong>
            </p>

            <form onSubmit={handleSaveSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> El cliente perderá acceso automáticamente cuando su
                  suscripción venza.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
