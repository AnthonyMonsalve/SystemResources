import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faFire,
  faDumbbell,
  faTrophy,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../components/shared/LoadingSpinner';

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
  duration: number; // minutes
  exercisesCompleted: number;
  calories?: number;
};

export function MyProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      // TODO: Endpoints /progress/stats and /progress/history need to be implemented
      // For now, return placeholder data
      const statsData: ProgressStats = {
        totalWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalWeeks: 0,
        averageWorkoutsPerWeek: 0,
      };
      const historyData: WorkoutHistory[] = [];
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar progreso');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando progreso..." />
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
        <h1 className="text-3xl font-bold text-slate-900">Mi Progreso</h1>
        <p className="text-slate-600 mt-1">
          Monitorea tu avance y logros en tu entrenamiento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Workouts */}
        <div className="card bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Total Entrenamientos
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalWorkouts || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faDumbbell} className="text-primary-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Current Streak */}
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

        {/* Longest Streak */}
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

        {/* Weeks Training */}
        <div className="card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Semanas Activas</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalWeeks || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workouts Over Time Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Entrenamientos por Semana
          </h2>
          <div className="h-64 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon icon={faChartLine} className="text-slate-400 text-4xl mb-3" />
              <p className="text-slate-600 font-medium">Gráfico de Progreso</p>
              <p className="text-sm text-slate-500 mt-1">
                Visualización de entrenamientos en el tiempo
              </p>
              <p className="text-xs text-slate-400 mt-2">
                (Chart.js - próximamente)
              </p>
            </div>
          </div>
        </div>

        {/* Muscle Groups Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Grupos Musculares Trabajados
          </h2>
          <div className="h-64 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon icon={faDumbbell} className="text-slate-400 text-4xl mb-3" />
              <p className="text-slate-600 font-medium">Distribución Muscular</p>
              <p className="text-sm text-slate-500 mt-1">
                Gráfico de grupos musculares más entrenados
              </p>
              <p className="text-xs text-slate-400 mt-2">
                (Chart.js - próximamente)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-slate-50">
            <p className="text-sm text-slate-600 mb-1">Promedio Semanal</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.averageWorkoutsPerWeek.toFixed(1)}
              <span className="text-sm ml-1 font-normal text-slate-600">entrenamientos</span>
            </p>
          </div>

          {stats.favoriteExercise && (
            <div className="card bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Ejercicio Favorito</p>
              <p className="text-lg font-bold text-slate-900">{stats.favoriteExercise}</p>
            </div>
          )}

          {stats.mostTargetedMuscle && (
            <div className="card bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">Músculo Más Trabajado</p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {stats.mostTargetedMuscle}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Workouts History */}
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
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{workout.routineName}</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(workout.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
                  {workout.calories && (
                    <div className="text-center">
                      <p className="text-slate-600">Calorías</p>
                      <p className="font-bold text-slate-900">{workout.calories}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
