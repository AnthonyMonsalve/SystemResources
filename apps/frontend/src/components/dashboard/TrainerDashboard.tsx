import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faListCheck,
  faCalendarDays,
  faUsers,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import type { UserProfile } from '../../types/auth';
import { apiFetch } from '../../lib/api';
import StatCard from './StatCard';
import QuickActionCard from './QuickActionCard';
import LoadingSpinner from '../shared/LoadingSpinner';

interface TrainerDashboardProps {
  user: UserProfile;
  token: string | null;
}

interface TrainerStats {
  exercises: number;
  routines: number;
  programs: number;
  clients: number;
}

export default function TrainerDashboard({ user, token }: TrainerDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch stats from multiple endpoints
      const [exercises, routines, programs, clients] = await Promise.all([
        apiFetch<{ total: number }>('/exercises?limit=1', { token }),
        apiFetch<{ total: number }>('/routines?limit=1', { token }),
        apiFetch<{ total: number }>('/programs?limit=1', { token }),
        apiFetch<{ total: number }>(`/users?role=client&trainerId=${user.id}&limit=1`, { token }),
      ]);

      setStats({
        exercises: exercises.total || 0,
        routines: routines.total || 0,
        programs: programs.total || 0,
        clients: clients.total || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default values on error
      setStats({
        exercises: 0,
        routines: 0,
        programs: 0,
        clients: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Hola, {user.name || 'Entrenador'}
        </h1>
        <p className="text-slate-600">Panel de entrenador</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={faDumbbell}
          label="Ejercicios"
          value={stats?.exercises || 0}
          color="primary"
        />
        <StatCard
          icon={faListCheck}
          label="Rutinas"
          value={stats?.routines || 0}
          color="blue"
        />
        <StatCard
          icon={faCalendarDays}
          label="Programas"
          value={stats?.programs || 0}
          color="accent"
        />
        <StatCard
          icon={faUsers}
          label="Clientes"
          value={stats?.clients || 0}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={faDumbbell}
            title="Crear Ejercicio"
            description="Agregar un nuevo ejercicio a la biblioteca"
            onClick={() => navigate('/exercises/new')}
            color="primary"
          />
          <QuickActionCard
            icon={faListCheck}
            title="Crear Rutina"
            description="Diseñar una nueva rutina de entrenamiento"
            onClick={() => navigate('/routines/new')}
            color="accent"
          />
          <QuickActionCard
            icon={faCalendarDays}
            title="Crear Programa"
            description="Configurar un programa completo"
            onClick={() => navigate('/programs/new')}
            color="primary"
          />
        </div>
      </div>

      {/* Recent Activity Section - Placeholder */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Actividad reciente
        </h2>
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faListCheck}
                className="text-4xl text-slate-300 mb-3"
              />
              <p className="text-sm text-slate-600">
                La actividad reciente se mostrará aquí
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
