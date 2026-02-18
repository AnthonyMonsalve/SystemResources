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
  nextRoutine: string;
}

interface ProgramWithProgress extends TrainingProgram {
  progress: number;
}

export default function ClientDashboard({ user, token }: ClientDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ClientStats>({
    daysThisWeek: 0,
    nextRoutine: 'No programada',
  });
  const [programs, setPrograms] = useState<ProgramWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch workout history (used for both progress and days this week)
      const history = await apiFetch<{ data: any[] }>(
        '/workouts/history?status=completed&limit=100',
        { token }
      );

      // Fetch all programs using the correct endpoint
      const fetchedPrograms = await apiFetch<TrainingProgram[]>(
        `/programs/clients/${user.id}`,
        { token }
      );

      if (fetchedPrograms && fetchedPrograms.length > 0) {
        // Calculate progress for each program
        const programsWithProgress: ProgramWithProgress[] = fetchedPrograms.map(program => {
          let progress = 0;

          if (history.data && program.routines && program.routines.length > 0) {
            // Get unique routine IDs from the program
            const programRoutineIds = new Set(program.routines.map(r => r.id));

            // Count completed sessions that belong to this program's routines
            const completedProgramSessions = history.data.filter(session =>
              session.routine && programRoutineIds.has(session.routine.id)
            );

            // Calculate progress based on completed routines
            const expectedSessions = program.routines.length * 4 * program.durationWeeks;
            progress = Math.min(
              100,
              Math.round((completedProgramSessions.length / expectedSessions) * 100)
            );
          } else {
            // If no history or routines, try time-based calculation
            const assignment = program.assignedClients?.find(
              (ac) => ac.clientId === user.id
            );
            if (assignment && assignment.startDate) {
              const start = new Date(assignment.startDate);
              const now = new Date();
              const weeksPassed = Math.floor(
                (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
              );
              progress = Math.min(
                100,
                Math.round((weeksPassed / program.durationWeeks) * 100)
              );
            }
          }

          return {
            ...program,
            progress,
          };
        });

        setPrograms(programsWithProgress);
      }

      // Calculate days this week from history (already fetched above)
      if (history && history.data) {
        // Get the start of this week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        // Filter sessions from this week and get unique days
        const sessionsThisWeek = history.data.filter((session) => {
          const sessionDate = new Date(session.completedAt || session.startedAt);
          return sessionDate >= startOfWeek;
        });

        // Get unique days (count each day only once)
        const uniqueDays = new Set(
          sessionsThisWeek.map((session) => {
            const date = new Date(session.completedAt || session.startedAt);
            return date.toDateString(); // Use date string to group by day
          })
        );

        setStats((prev) => ({
          ...prev,
          daysThisWeek: uniqueDays.size,
          nextRoutine: 'No programada', // TODO: Implement scheduled routines
        }));
      }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={faFire}
          label="Días esta semana"
          value={stats.daysThisWeek}
          color="accent"
        />
        <StatCard
          icon={faClock}
          label="Próxima rutina"
          value={stats.nextRoutine}
          color="blue"
        />
      </div>

      {/* My Programs */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Mis programas de entrenamiento
        </h2>
        {programs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                onClick={() => navigate(`/programs/${program.id}`)}
                className="card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {program.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {program.durationWeeks} semanas
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-primary-500 text-2xl"
                  />
                </div>

                {program.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {program.description}
                  </p>
                )}

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">Progreso</span>
                    <span className="font-medium text-slate-900">{program.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    {program.routines?.length || 0} rutinas en este programa
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={faCalendarDays}
            title="No tienes programas asignados"
            message="Tu entrenador te asignará programas pronto"
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
