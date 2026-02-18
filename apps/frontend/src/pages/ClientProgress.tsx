import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faChartLine,
  faFire,
  faDumbbell,
  faTrophy,
  faCalendarCheck,
  faBan,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faCalendarDays,
  faListCheck,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { MeasurementHistory } from '../components/measurements/MeasurementHistory';
import type { UserProfile } from '../types/auth';
import type { TrainingProgram } from '../types/programs';
import type { Routine } from '../types/routines';

type ProgressStats = {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalWeeks: number;
  favoriteExercise?: string;
  mostTargetedMuscle?: string;
  averageWorkoutsPerWeek: number;
};

type WorkoutHistory = {
  id: string;
  date: string;
  routineName: string;
  duration: number;
  exercisesCompleted: number;
  calories?: number;
};

export function ClientProgressPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { token } = useAuth();
  const { showToast, confirm, alert: showAlert } = useAlert();
  const [client, setClient] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscription management
  const [showEditSubscription, setShowEditSubscription] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      // Fetch all client data in parallel
      const [clientData, programsData, routinesData] = await Promise.all([
        apiFetch<UserProfile>(`/trainer/clients/${clientId}`, { token }),
        apiFetch<TrainingProgram[]>(`/programs/clients/${clientId}`, { token }).catch(() => []),
        apiFetch<Routine[]>(`/routines?clientId=${clientId}`, { token }).catch(() => []),
      ]);

      setClient(clientData);
      setPrograms(programsData);
      setRoutines(routinesData);

      // Fetch workout history for the client
      try {
        const response = await apiFetch<{ data: any[] }>(
          `/workouts/clients/${clientId}/history?status=completed&limit=100`,
          { token }
        );

        const clientSessions = response.data || [];

        // Map to WorkoutHistory format
        const historyData: WorkoutHistory[] = clientSessions.map((session) => ({
          id: session.id,
          date: session.completedAt || session.startedAt,
          routineName: session.routine?.name || 'Rutina sin nombre',
          duration: Math.round((session.totalDurationSeconds || 0) / 60),
          exercisesCompleted: session.routine?.exercises?.length || 0,
          calories: session.routine?.estimatedCalories,
        }));

        // Calculate statistics (same logic as MyProgress)
        const totalWorkouts = clientSessions.length;

        // Calculate streaks
        const dates = clientSessions
          .map((s) => new Date(s.completedAt || s.startedAt))
          .sort((a, b) => b.getTime() - a.getTime());

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate: Date | null = null;

        for (const date of dates) {
          const dateStr = date.toDateString();

          if (!lastDate) {
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (dateStr === today || dateStr === yesterdayStr) {
              currentStreak = 1;
            }
            tempStreak = 1;
          } else {
            const diffDays = Math.floor(
              (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
              tempStreak++;
              if (currentStreak > 0) {
                currentStreak++;
              }
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
              currentStreak = 0;
            }
          }

          lastDate = date;
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Calculate total weeks with at least one workout
        const weeks = new Set(
          dates.map((date) => {
            const weekStart = new Date(date);
            const day = weekStart.getDay();
            const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
            weekStart.setDate(diff);
            return weekStart.toDateString();
          })
        );
        const totalWeeks = weeks.size;

        // Calculate average workouts per week
        const averageWorkoutsPerWeek = totalWeeks > 0 ? totalWorkouts / totalWeeks : 0;

        const statsData: ProgressStats = {
          totalWorkouts,
          currentStreak,
          longestStreak,
          totalWeeks,
          averageWorkoutsPerWeek,
        };

        setStats(statsData);
        setHistory(historyData);
      } catch (historyError) {
        console.error('Error fetching workout history:', historyError);
        // Set empty stats if history fetch fails
        setStats({
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalWeeks: 0,
          averageWorkoutsPerWeek: 0,
        });
        setHistory([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos del cliente');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = (client: UserProfile) => {
    if (!client.subscriptionEndDate) {
      return { status: 'none', label: 'Sin suscripción', color: 'slate', icon: faTimesCircle };
    }

    const now = new Date();
    const endDate = new Date(client.subscriptionEndDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (client.subscriptionStatus === 'cancelled') {
      return { status: 'cancelled', label: 'Cancelada', color: 'red', daysLeft, icon: faBan };
    }

    if (endDate < now || client.subscriptionStatus === 'expired') {
      return { status: 'expired', label: 'Vencida', color: 'red', daysLeft, icon: faTimesCircle };
    }

    if (daysLeft <= 7) {
      return { status: 'expiring', label: `Vence en ${daysLeft} días`, color: 'yellow', daysLeft, icon: faClock };
    }

    return { status: 'active', label: `Activa (${daysLeft} días)`, color: 'green', daysLeft, icon: faCheckCircle };
  };

  const handleExtendSubscription = async (days: number) => {
    if (!client) return;

    const confirmed = await confirm({
      title: 'Extender suscripción',
      message: `¿Extender la suscripción por ${days} días?`,
      confirmText: 'Extender',
    });

    if (!confirmed) return;

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
      fetchClientData();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al extender suscripción',
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!client) return;

    const confirmed = await confirm({
      title: 'Cancelar suscripción',
      message: '¿Cancelar la suscripción? El cliente perderá acceso inmediatamente.',
      confirmText: 'Cancelar suscripción',
      type: 'danger',
    });

    if (!confirmed) return;

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
      fetchClientData();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al cancelar suscripción',
      });
    }
  };

  const openEditSubscription = () => {
    if (!client) return;
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
    setShowEditSubscription(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setSaving(true);
    try {
      await apiFetch(`/trainer/clients/${client.id}/subscription`, {
        method: 'PATCH',
        body: {
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
        },
        token,
      });
      setShowEditSubscription(false);
      showToast('Suscripción actualizada exitosamente', 'success');
      fetchClientData();
    } catch (err) {
      await showAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al actualizar suscripción',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando información..." />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/my-clients"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver a mis clientes
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error || 'Cliente no encontrado'}
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus(client);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/my-clients"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">
            {client.name || client.email}
          </h1>
          <p className="text-slate-600 mt-1">{client.email}</p>
        </div>
      </div>

      {/* Client Info & Subscription Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Info */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Información del Cliente
            </h2>
            <div className="space-y-2 text-sm">
              {client.goal && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Objetivo:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {client.goal.replace('_', ' ')}
                  </span>
                </div>
              )}
              {client.fitnessLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nivel:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {client.fitnessLevel}
                  </span>
                </div>
              )}
              {client.weight && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Peso:</span>
                  <span className="font-medium text-slate-900">{client.weight} kg</span>
                </div>
              )}
              {client.height && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Altura:</span>
                  <span className="font-medium text-slate-900">{client.height} cm</span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Management */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Gestión de Suscripción
            </h2>

            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                  subscriptionStatus.color === 'green'
                    ? 'bg-green-100 text-green-700'
                    : subscriptionStatus.color === 'yellow'
                    ? 'bg-yellow-100 text-yellow-700'
                    : subscriptionStatus.color === 'red'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <FontAwesomeIcon icon={subscriptionStatus.icon} />
                {subscriptionStatus.label}
              </span>
            </div>

            {/* Dates */}
            {client.subscriptionEndDate && (
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Inicio:</span>
                  <span className="font-medium text-slate-900">
                    {client.subscriptionStartDate &&
                      new Date(client.subscriptionStartDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Vencimiento:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(client.subscriptionEndDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {subscriptionStatus.status !== 'cancelled' && client.subscriptionEndDate && (
                <>
                  <button
                    onClick={() => handleExtendSubscription(5)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                  >
                    +5 días
                  </button>
                  <button
                    onClick={() => handleExtendSubscription(15)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                  >
                    +15 días
                  </button>
                  <button
                    onClick={() => handleExtendSubscription(30)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                  >
                    +30 días
                  </button>
                </>
              )}
              <button
                onClick={openEditSubscription}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-1" />
                {client.subscriptionEndDate ? 'Editar' : 'Configurar'}
              </button>
              {subscriptionStatus.status !== 'cancelled' && client.subscriptionEndDate && (
                <button
                  onClick={handleCancelSubscription}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                >
                  <FontAwesomeIcon icon={faBan} className="mr-1" />
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Programs & Routines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="text-primary-600" />
              Programas ({programs.length})
            </h2>
            <Link to="/programs" className="text-sm text-primary-600 hover:text-primary-700">
              Asignar nuevo →
            </Link>
          </div>
          {programs.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No tiene programas asignados</p>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div key={program.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{program.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {program.durationWeeks} semanas
                        {program.targetLevel && ` • ${program.targetLevel}`}
                      </p>
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

        {/* Routines */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faListCheck} className="text-primary-600" />
              Rutinas ({routines.length})
            </h2>
            <Link to="/routines" className="text-sm text-primary-600 hover:text-primary-700">
              Asignar nueva →
            </Link>
          </div>
          {routines.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No tiene rutinas asignadas</p>
          ) : (
            <div className="space-y-3">
              {routines.map((routine) => (
                <div key={routine.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{routine.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {routine.dayOfWeek && `${routine.dayOfWeek} • `}
                        {routine.exercises?.length || 0} ejercicios
                      </p>
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
      </div>

      {/* Progress Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Entrenamientos</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalWorkouts || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faDumbbell} className="text-primary-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Racha Actual</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.currentStreak || 0}
                <span className="text-lg ml-1">días</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faFire} className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Mejor Racha</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.longestStreak || 0}
                <span className="text-lg ml-1">días</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faTrophy} className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Semanas Activas</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalWeeks || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Measurement History */}
      {token && clientId && (
        <MeasurementHistory token={token} isClient={false} clientId={clientId} />
      )}

      {/* Progress Charts - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Entrenamientos por Semana
          </h2>
          <div className="h-64 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon icon={faChartLine} className="text-slate-400 text-4xl mb-3" />
              <p className="text-slate-600 font-medium">Gráfico de Progreso</p>
              <p className="text-xs text-slate-400 mt-2">(Próximamente)</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Grupos Musculares Trabajados
          </h2>
          <div className="h-64 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon icon={faDumbbell} className="text-slate-400 text-4xl mb-3" />
              <p className="text-slate-600 font-medium">Distribución Muscular</p>
              <p className="text-xs text-slate-400 mt-2">(Próximamente)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Entrenamientos */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Historial de Entrenamientos
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No hay entrenamientos registrados aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{workout.routineName}</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(workout.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-slate-600">Duración</p>
                    <p className="font-bold text-slate-900">{workout.duration} min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600">Ejercicios</p>
                    <p className="font-bold text-slate-900">{workout.exercisesCompleted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      {showEditSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Gestionar Suscripción</h2>
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
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditSubscription(false)}
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
