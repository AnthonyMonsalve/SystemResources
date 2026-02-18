import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faChartLine,
  faDumbbell,
  faSearch,
  faCalendarDays,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faBan,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import { SubscriptionsSummary } from '../components/clients/SubscriptionsSummary';
import type { UserProfile } from '../types/auth';
import type { TrainingProgram } from '../types/programs';

type ClientWithProgram = UserProfile & {
  currentProgram?: TrainingProgram;
  workoutsCompleted?: number;
  lastWorkout?: string;
};

export function MyClientsPage() {
  const { token } = useAuth();
  const { showToast, confirm, alert: showAlert } = useAlert();
  const [clients, setClients] = useState<ClientWithProgram[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Subscription modal states
  const [selectedClient, setSelectedClient] = useState<ClientWithProgram | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const [allClients, expiring] = await Promise.all([
        apiFetch<ClientWithProgram[]>('/trainer/clients', { token }),
        apiFetch<UserProfile[]>('/trainer/subscriptions/expiring-soon', { token }).catch(
          () => []
        ),
      ]);
      setClients(allClients);
      setExpiringSoon(expiring);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiFetch('/trainer/invite-client', {
        method: 'POST',
        body: { email: inviteEmail },
        token,
      });
      setShowInviteModal(false);
      setInviteEmail('');
      await showAlert({
        type: 'success',
        message: `Cliente invitado exitosamente.\n\nSe ha creado una cuenta para ${inviteEmail}.\nLa contraseña temporal se encuentra en los logs del servidor.`,
      });
      fetchClients();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al enviar invitación',
      });
    } finally {
      setInviting(false);
    }
  };

  const getSubscriptionStatus = (client: ClientWithProgram) => {
    if (!client.subscriptionEndDate) {
      return { status: 'none', label: 'Sin suscripción', color: 'slate', icon: faTimesCircle };
    }

    const now = new Date();
    const endDate = new Date(client.subscriptionEndDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (client.subscriptionStatus === 'cancelled') {
      return {
        status: 'cancelled',
        label: 'Cancelada',
        color: 'red',
        icon: faBan,
        daysLeft,
      };
    }

    if (endDate < now || client.subscriptionStatus === 'expired') {
      return {
        status: 'expired',
        label: 'Vencida',
        color: 'red',
        icon: faTimesCircle,
        daysLeft,
      };
    }

    if (daysLeft <= 7) {
      return {
        status: 'expiring',
        label: `${daysLeft} días`,
        color: 'yellow',
        icon: faClock,
        daysLeft,
      };
    }

    return {
      status: 'active',
      label: `${daysLeft} días`,
      color: 'green',
      icon: faCheckCircle,
      daysLeft,
    };
  };

  const openSubModal = (client: ClientWithProgram) => {
    setSelectedClient(client);
    setStartDate(
      client.subscriptionStartDate
        ? new Date(client.subscriptionStartDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setEndDate(
      client.subscriptionEndDate
        ? new Date(client.subscriptionEndDate).toISOString().split('T')[0]
        : ''
    );
    setShowSubModal(true);
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
          subscriptionStatus: 'active',
        },
        token,
      });
      setShowSubModal(false);
      showToast('Suscripción actualizada exitosamente', 'success');
      fetchClients();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al actualizar suscripción',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExtendSubscription = async (client: ClientWithProgram, days: number) => {
    try {
      const currentEndDate = client.subscriptionEndDate
        ? new Date(client.subscriptionEndDate)
        : new Date();
      const newEndDate = new Date(currentEndDate);
      newEndDate.setDate(newEndDate.getDate() + days);

      await apiFetch(`/trainer/clients/${client.id}/subscription`, {
        method: 'PATCH',
        body: {
          subscriptionStartDate:
            client.subscriptionStartDate || new Date().toISOString(),
          subscriptionEndDate: newEndDate.toISOString(),
          subscriptionStatus: 'active',
        },
        token,
      });

      showToast(`Suscripción extendida por ${days} días`, 'success');
      fetchClients();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al extender suscripción',
      });
    }
  };

  const handleCancelSubscription = async (client: ClientWithProgram) => {
    const confirmed = await confirm({
      title: 'Cancelar suscripción',
      message: `¿Cancelar la suscripción de ${client.name || client.email}? El cliente perderá acceso.`,
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
          subscriptionStartDate:
            client.subscriptionStartDate || new Date().toISOString(),
          subscriptionEndDate: new Date().toISOString(),
          subscriptionStatus: 'cancelled',
        },
        token,
      });

      showToast('Suscripción cancelada', 'success');
      fetchClients();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al cancelar suscripción',
      });
    }
  };

  // Filter clients by search query
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando clientes..." />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Clientes</h1>
          <p className="text-slate-600 mt-1">
            Gestiona tus clientes y sus suscripciones
          </p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="btn-primary">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Invitar Cliente
        </button>
      </div>

      {/* Subscriptions Summary */}
      <SubscriptionsSummary
        expiringSoon={expiringSoon}
        onClientClick={(client) => {
          const fullClient = clients.find((c) => c.id === client.id);
          if (fullClient) {
            setSelectedClient(fullClient);
          }
        }}
        onRenewClick={(client) => {
          const fullClient = clients.find((c) => c.id === client.id);
          if (fullClient) {
            openSubModal(fullClient);
          }
        }}
      />

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Invitar Cliente</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form onSubmit={handleInviteClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email del cliente
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input w-full"
                  placeholder="cliente@ejemplo.com"
                  required
                />
                <p className="text-xs text-slate-600 mt-2">
                  El cliente recibirá un correo para crear su cuenta.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={inviting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={inviting}>
                  {inviting ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Gestión de Suscripción</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedClient.name || selectedClient.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowSubModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Status */}
              {selectedClient.subscriptionEndDate && (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Estado Actual</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        getSubscriptionStatus(selectedClient).color === 'green'
                          ? 'bg-green-100 text-green-700'
                          : getSubscriptionStatus(selectedClient).color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-700'
                          : getSubscriptionStatus(selectedClient).color === 'red'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={getSubscriptionStatus(selectedClient).icon}
                        className="text-xs"
                      />
                      {getSubscriptionStatus(selectedClient).label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Fecha de inicio</p>
                      <p className="font-medium text-slate-900">
                        {selectedClient.subscriptionStartDate
                          ? new Date(selectedClient.subscriptionStartDate).toLocaleDateString(
                              'es-ES',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Vencimiento</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedClient.subscriptionEndDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {selectedClient.subscriptionEndDate &&
                getSubscriptionStatus(selectedClient).status !== 'cancelled' && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Acciones Rápidas
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          handleExtendSubscription(selectedClient, 5);
                          setShowSubModal(false);
                        }}
                        className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition group"
                      >
                        <div className="text-2xl font-bold text-green-700 mb-1">+5</div>
                        <div className="text-xs text-green-600 font-medium">días</div>
                      </button>
                      <button
                        onClick={() => {
                          handleExtendSubscription(selectedClient, 15);
                          setShowSubModal(false);
                        }}
                        className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition group"
                      >
                        <div className="text-2xl font-bold text-green-700 mb-1">+15</div>
                        <div className="text-xs text-green-600 font-medium">días</div>
                      </button>
                      <button
                        onClick={() => {
                          handleExtendSubscription(selectedClient, 30);
                          setShowSubModal(false);
                        }}
                        className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition group"
                      >
                        <div className="text-2xl font-bold text-green-700 mb-1">+30</div>
                        <div className="text-xs text-green-600 font-medium">días</div>
                      </button>
                    </div>
                  </div>
                )}

              {/* Manual Configuration */}
              <form onSubmit={handleSaveSubscription} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Configuración Manual
                </h3>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                {/* Quick extend buttons in form */}
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-2">
                    Ajustar fecha de vencimiento:
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = endDate ? new Date(endDate) : new Date();
                        current.setDate(current.getDate() + 5);
                        setEndDate(current.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium"
                    >
                      +5 días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = endDate ? new Date(endDate) : new Date();
                        current.setDate(current.getDate() + 15);
                        setEndDate(current.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium"
                    >
                      +15 días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = endDate ? new Date(endDate) : new Date();
                        current.setDate(current.getDate() + 30);
                        setEndDate(current.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-medium"
                    >
                      +30 días
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-800">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    <strong>Nota:</strong> Los cambios se guardarán y el cliente será notificado
                    automáticamente.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubModal(false)}
                    className="btn-secondary flex-1"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              {selectedClient.subscriptionEndDate &&
                getSubscriptionStatus(selectedClient).status !== 'cancelled' && (
                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-red-900 mb-3">Zona de Peligro</h3>
                    <button
                      onClick={() => {
                        handleCancelSubscription(selectedClient);
                        setShowSubModal(false);
                      }}
                      className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 rounded-xl transition font-medium text-sm"
                    >
                      <FontAwesomeIcon icon={faBan} className="mr-2" />
                      Cancelar Suscripción del Cliente
                    </button>
                    <p className="text-xs text-red-600 mt-2">
                      Esta acción cancelará inmediatamente el acceso del cliente.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={searchQuery ? faSearch : faUserPlus}
          title={
            searchQuery
              ? 'No se encontraron clientes'
              : 'No tienes clientes aún'
          }
          message={
            searchQuery
              ? 'Intenta con otro término de búsqueda'
              : 'Invita a tus clientes para comenzar a crear programas personalizados.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const sub = getSubscriptionStatus(client);

            return (
              <div
                key={client.id}
                className="card hover:shadow-lg transition-shadow relative"
              >
                {/* Subscription Badge */}
                <div className="absolute top-4 right-4">
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
                    <FontAwesomeIcon icon={sub.icon} className="text-xs" />
                    {sub.label}
                  </span>
                </div>

                {/* Client Header */}
                <div className="flex items-start gap-3 mb-4 pr-24">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {client.name?.[0]?.toUpperCase() || client.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {client.name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">{client.email}</p>
                  </div>
                </div>

                {/* Subscription Info - Read Only */}
                {client.subscriptionEndDate && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faCalendarDays}
                          className="text-slate-600 text-sm"
                        />
                        <span className="text-xs font-medium text-slate-700">Suscripción</span>
                      </div>
                      <button
                        onClick={() => openSubModal(client)}
                        className="px-3 py-1 text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 rounded font-medium"
                      >
                        Gestionar
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Vence:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(client.subscriptionEndDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Program Info */}
                {client.currentProgram && (
                  <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faDumbbell}
                        className="text-primary-600 text-sm"
                      />
                      <span className="text-sm font-medium text-slate-900">
                        Programa Actual
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">
                      {client.currentProgram.name}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FontAwesomeIcon
                        icon={faChartLine}
                        className="text-slate-600 text-sm"
                      />
                      <span className="text-xs text-slate-600">Entrenamientos</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {client.workoutsCompleted || 0}
                    </p>
                  </div>

                  {client.fitnessLevel && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-600 block mb-1">Nivel</span>
                      <p className="text-sm font-semibold text-slate-900 capitalize">
                        {client.fitnessLevel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  {!client.subscriptionEndDate ? (
                    <button
                      onClick={() => openSubModal(client)}
                      className="btn-primary w-full text-center text-sm py-2"
                    >
                      <FontAwesomeIcon icon={faCalendarDays} className="mr-1" />
                      Activar Suscripción
                    </button>
                  ) : (
                    <>
                      <Link
                        to={`/programs?assignTo=${client.id}`}
                        className="btn-primary w-full text-center text-sm py-2 block"
                      >
                        Asignar Programa
                      </Link>
                      <Link
                        to={`/clients/${client.id}/progress`}
                        className="btn-secondary w-full text-center text-sm py-2 block"
                      >
                        Ver Progreso
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
