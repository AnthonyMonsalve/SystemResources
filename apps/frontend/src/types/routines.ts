import { Exercise } from './exercises';

// Enums matching backend
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

// Routine Exercise type (join table with custom params)
export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
  notes?: string;
}

// Routine type
export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  dayOfWeek?: DayOfWeek;
  isPublic: boolean;
  programId?: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface RoutinesResponse {
  data: Routine[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface AddExerciseToRoutineData {
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
  notes?: string;
}

export interface CreateRoutineData {
  name: string;
  description?: string;
  dayOfWeek?: DayOfWeek;
  isPublic?: boolean;
  exercises?: AddExerciseToRoutineData[];
}

export interface UpdateRoutineData extends Partial<CreateRoutineData> {}

export interface QueryRoutinesParams {
  dayOfWeek?: DayOfWeek;
  isPublic?: boolean;
  createdById?: string;
  page?: number;
  limit?: number;
}

// Helper constants for UI
export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo',
};

export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lun',
  [DayOfWeek.TUESDAY]: 'Mar',
  [DayOfWeek.WEDNESDAY]: 'Mié',
  [DayOfWeek.THURSDAY]: 'Jue',
  [DayOfWeek.FRIDAY]: 'Vie',
  [DayOfWeek.SATURDAY]: 'Sáb',
  [DayOfWeek.SUNDAY]: 'Dom',
};

// Helper function to calculate total duration
export function calculateRoutineDuration(routine: Routine): number {
  return routine.exercises.reduce((total, re) => {
    const sets = re.sets || re.exercise.defaultSets || 0;
    const duration = re.duration || re.exercise.defaultDuration || 0;
    const rest = re.rest || re.exercise.defaultRest || 0;
    return total + (sets * duration) + ((sets - 1) * rest);
  }, 0);
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}
