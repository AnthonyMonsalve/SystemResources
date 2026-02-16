import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { TrainingProgram, FitnessLevel, FitnessGoal } from '../types/programs';

interface ProgramsResponse {
  data: TrainingProgram[];
  total: number;
  page: number;
  limit: number;
}

interface ProgramFilters {
  targetLevel?: FitnessLevel;
  targetGoal?: FitnessGoal;
  isTemplate?: boolean;
}

export function usePrograms(filters?: ProgramFilters, page: number = 1, limit: number = 12) {
  const { token } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPrograms();
  }, [filters, page, limit]);

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.targetLevel && { targetLevel: filters.targetLevel }),
        ...(filters?.targetGoal && { targetGoal: filters.targetGoal }),
        ...(filters?.isTemplate !== undefined && { isTemplate: filters.isTemplate.toString() }),
      });

      const data = await apiFetch<ProgramsResponse>(
        `/programs?${params.toString()}`,
        { token }
      );

      setPrograms(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar programas');
      setPrograms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return { programs, loading, error, total, refetch: fetchPrograms };
}
