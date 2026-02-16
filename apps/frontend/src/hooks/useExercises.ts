import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Exercise, QueryExercisesParams } from '../types/exercises';

interface ExercisesResponse {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
}

export function useExercises(filters?: QueryExercisesParams, page: number = 1, limit: number = 12) {
  const { token } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchExercises();
  }, [filters, page, limit]);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.muscleGroup && { muscleGroup: filters.muscleGroup }),
        ...(filters?.equipment && { equipment: filters.equipment }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
      });

      const data = await apiFetch<ExercisesResponse>(
        `/exercises?${params.toString()}`,
        { token }
      );

      setExercises(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejercicios');
      setExercises([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return { exercises, loading, error, total, refetch: fetchExercises };
}
