import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire,
  faTrophy,
  faClock,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import type { UserProfile } from '../../types/auth';
import type { TrainingProgram } from '../../types/programs';
import { apiFetch } from '../../lib/api';
import StatCard from './StatCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import EmptyState from '../shared/EmptyState';

interface ClientDashboardProps {
  user: UserProfile;
  token: string | null;
}

interface ClientStats {
  daysThisWeek: number;
  progress: number;
  nextRoutine: string;
}

export default function ClientDashboard({ user, token }: ClientDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ClientStats>({
    daysThisWeek: 0,
    progress: 0,
    nextRoutine: 'No programada',
  });
  const [currentProgram, setCurrentProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch current program
      const programs = await apiFetch<{ data: TrainingProgram[] }>(
        `/programs?clientId=${user.id}&limit=1`,
        { token }
      );

      if (programs.data && programs.data.length > 0) {
        setCurrentProgram(programs.data[0]);
        // Calculate progress based on program data
        const program = programs.data[0];
        const assignment = program.assignedClients?.find(
          (ac) => ac.clientId === user.id
        );
        if (assignment && assignment.startDate) {
          const start = new Date(assignment.startDate);
          const now = new Date();
          const weeksPassed = Math.floor(
            (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          const progress = Math.min(
            100,
            Math.round((weeksPassed / program.durationWeeks) * 100)
          );
          setStats((prev) => ({ ...prev, progress }));
        }
      }

      // Mock stats for now (could be fetched from a workout logs endpoint)
      setStats((prev) => ({
        ...prev,
        daysThisWeek: 3,
        nextRoutine: 'Hoy 18:00',
      }));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
          Hola, {user.name || 'Atleta'}
        </h1>
        <p className="text-slate-600">¿Listo para entrenar?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={faFire}
          label="Días esta semana"
          value={stats.daysThisWeek}
          color="accent"
        />
        <StatCard
          icon={faTrophy}
          label="Progreso"
          value={`${stats.progress}%`}
          color="green"
        />
        <StatCard
          icon={faClock}
          label="Próxima rutina"
          value={stats.nextRoutine}
          color="blue"
        />
      </div>

      {/* Current Program */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Mi programa actual
        </h2>
        {currentProgram ? (
          <div
            onClick={() => navigate(`/programs/${currentProgram.id}`)}
            className="card hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {currentProgram.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {currentProgram.durationWeeks} semanas
                </p>
              </div>
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="text-primary-500 text-2xl"
              />
            </div>

            {currentProgram.description && (
              <p className="text-sm text-slate-600 mb-4">
                {currentProgram.description}
              </p>
            )}

            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">Progreso</span>
                <span className="font-medium text-slate-900">{stats.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                {currentProgram.routines?.length || 0} rutinas en este programa
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={faCalendarDays}
            title="No tienes programa asignado"
            message="Tu entrenador te asignará un programa pronto"
          />
        )}
      </div>

      {/* Today's Routine - Placeholder */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Rutina de hoy
        </h2>
        <div className="card">
          <EmptyState
            icon={faClock}
            title="No hay rutina programada para hoy"
            message="Consulta tu calendario para ver las próximas rutinas"
            action={{
              label: 'Ver mis rutinas',
              onClick: () => navigate('/my-routines'),
            }}
          />
        </div>
      </div>
    </div>
  );
}
