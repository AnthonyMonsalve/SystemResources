import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faDumbbell,
  faFire,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import type { Routine } from '../types/routines';
import type { TrainingProgram } from '../types/programs';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export function MyRoutinesPage() {
  const { token, user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');

  useEffect(() => {
    fetchMyRoutines();
  }, []);

  const fetchMyRoutines = async () => {
    if (!token || !user?.id) return;

    try {
      setLoading(true);
      // Fetch programs assigned to the client
      const programs = await apiFetch<TrainingProgram[]>(`/programs/clients/${user.id}`, { token });

      // Extract all routines from assigned programs
      const allRoutines: Routine[] = [];
      if (Array.isArray(programs)) {
        programs.forEach((program) => {
          if (program.routines && Array.isArray(program.routines)) {
            allRoutines.push(...program.routines);
          }
        });
      }

      setRoutines(allRoutines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutinas');
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  // Ensure routines is always an array
  const safeRoutines = Array.isArray(routines) ? routines : [];

  const filteredRoutines = safeRoutines.filter((routine) => {
    if (selectedDay === 'all') return true;
    return routine.dayOfWeek === selectedDay;
  });

  // Group routines by day of week
  const routinesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.value] = safeRoutines.filter((r) => r.dayOfWeek === day.value);
    return acc;
  }, {} as Record<string, Routine[]>);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return 'No definido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Cargando rutinas..." />
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
        <h1 className="text-3xl font-bold text-slate-900">Mis Rutinas</h1>
        <p className="text-slate-600 mt-1">
          Rutinas de entrenamiento organizadas por día de la semana
        </p>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
              selectedDay === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                selectedDay === day.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {day.label}
              {routinesByDay[day.value].length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {routinesByDay[day.value].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Routines Grid or Day View */}
      {selectedDay === 'all' ? (
        // Week Overview
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day.value}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-primary-50 to-white border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  {day.label}
                </h3>
                <p className="text-sm text-slate-600">
                  {routinesByDay[day.value].length} rutina(s)
                </p>
              </div>

              <div className="p-4">
                {routinesByDay[day.value].length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Sin rutinas para este día
                  </p>
                ) : (
                  <div className="space-y-3">
                    {routinesByDay[day.value].map((routine) => (
                      <Link
                        key={routine.id}
                        to={`/routines/${routine.id}`}
                        className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                      >
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {routine.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faDumbbell} />
                            <span>{routine.exercises?.length || 0} ejercicios</span>
                          </div>
                          {routine.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} />
                              <span>{routine.estimatedDuration} min</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Filtered Routines
        <div>
          {filteredRoutines.length === 0 ? (
            <EmptyState
              icon={faListCheck}
              title={`No hay rutinas para ${
                DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.label
              }`}
              message="Selecciona otro día o contacta a tu entrenador para que te asigne rutinas."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="card hover:shadow-lg transition-shadow group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition">
                        {routine.name}
                      </h3>
                      {routine.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {routine.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-primary-50 rounded-xl">
                      <div className="flex items-center gap-2 text-primary-600 mb-1">
                        <FontAwesomeIcon icon={faDumbbell} />
                        <span className="text-xs font-medium">Ejercicios</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {routine.exercises?.length || 0}
                      </p>
                    </div>

                    {routine.estimatedDuration && (
                      <div className="p-3 bg-accent-50 rounded-xl">
                        <div className="flex items-center gap-2 text-accent-600 mb-1">
                          <FontAwesomeIcon icon={faClock} />
                          <span className="text-xs font-medium">Duración</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          {routine.estimatedDuration}
                          <span className="text-sm font-normal text-slate-600 ml-1">
                            min
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Difficulty Badge */}
                  {routine.difficulty && (
                    <div className="mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                          routine.difficulty
                        )}`}
                      >
                        {getDifficultyLabel(routine.difficulty)}
                      </span>
                    </div>
                  )}

                  {/* Calories */}
                  {routine.estimatedCalories && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-600">
                          <FontAwesomeIcon icon={faFire} />
                          <span className="text-sm font-medium">Calorías estimadas</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                          {routine.estimatedCalories}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    to={`/routines/${routine.id}`}
                    className="btn-primary w-full text-center"
                  >
                    Ver Detalles
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Total Count */}
      {safeRoutines.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-600">
            Total: {filteredRoutines.length} de {safeRoutines.length} rutinas
          </p>
        </div>
      )}
    </div>
  );
}
