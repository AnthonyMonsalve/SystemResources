import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Routine } from '../types/routines';

interface RoutinesResponse {
  data: Routine[];
  total: number;
  page: number;
  limit: number;
}

interface RoutineFilters {
  dayOfWeek?: string;
  isPublic?: boolean;
}

export function useRoutines(filters?: RoutineFilters, page: number = 1, limit: number = 12) {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRoutines();
  }, [filters, page, limit]);

  const fetchRoutines = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.dayOfWeek && { dayOfWeek: filters.dayOfWeek }),
        ...(filters?.isPublic !== undefined && { isPublic: filters.isPublic.toString() }),
      });

      const data = await apiFetch<RoutinesResponse>(
        `/routines?${params.toString()}`,
        { token }
      );

      setRoutines(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutinas');
      setRoutines([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return { routines, loading, error, total, refetch: fetchRoutines };
}
