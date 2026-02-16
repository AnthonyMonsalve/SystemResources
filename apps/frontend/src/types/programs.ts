import type { Routine } from './routines';

// Import enums from users
export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_MUSCLE = 'gain_muscle',
  IMPROVE_ENDURANCE = 'improve_endurance',
  GENERAL_FITNESS = 'general_fitness',
  REHABILITATION = 'rehabilitation',
}

// Program Client type (join table with dates)
export interface ProgramClient {
  id: string;
  programId: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  assignedAt: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// Training Program type
export interface TrainingProgram {
  id: string;
  name: string;
  description?: string;
  durationWeeks: number;
  routines: Routine[];
  targetLevel?: FitnessLevel;
  targetGoal?: FitnessGoal;
  isTemplate: boolean;
  assignedClients: ProgramClient[];
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
export interface ProgramsResponse {
  data: TrainingProgram[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface CreateProgramData {
  name: string;
  description?: string;
  durationWeeks: number;
  targetLevel?: FitnessLevel;
  targetGoal?: FitnessGoal;
  isTemplate?: boolean;
  routineIds?: string[];
}

export interface UpdateProgramData extends Partial<CreateProgramData> {}

export interface AssignClientData {
  clientId: string;
  startDate?: string;
  endDate?: string;
}

export interface QueryProgramsParams {
  targetLevel?: FitnessLevel;
  targetGoal?: FitnessGoal;
  isTemplate?: boolean;
  createdById?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

// Helper constants for UI
export const FITNESS_LEVEL_LABELS: Record<FitnessLevel, string> = {
  [FitnessLevel.BEGINNER]: 'Principiante',
  [FitnessLevel.INTERMEDIATE]: 'Intermedio',
  [FitnessLevel.ADVANCED]: 'Avanzado',
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  [FitnessGoal.LOSE_WEIGHT]: 'Perder Peso',
  [FitnessGoal.GAIN_MUSCLE]: 'Ganar Músculo',
  [FitnessGoal.IMPROVE_ENDURANCE]: 'Mejorar Resistencia',
  [FitnessGoal.GENERAL_FITNESS]: 'Fitness General',
  [FitnessGoal.REHABILITATION]: 'Rehabilitación',
};

export const GOAL_COLORS: Record<FitnessGoal, string> = {
  [FitnessGoal.LOSE_WEIGHT]: 'bg-purple-100 text-purple-800',
  [FitnessGoal.GAIN_MUSCLE]: 'bg-blue-100 text-blue-800',
  [FitnessGoal.IMPROVE_ENDURANCE]: 'bg-green-100 text-green-800',
  [FitnessGoal.GENERAL_FITNESS]: 'bg-yellow-100 text-yellow-800',
  [FitnessGoal.REHABILITATION]: 'bg-red-100 text-red-800',
};

// Helper function to calculate program end date
export function calculateProgramEndDate(startDate: string, durationWeeks: number): Date {
  const start = new Date(startDate);
  start.setDate(start.getDate() + (durationWeeks * 7));
  return start;
}

// Helper function to get program progress
export function getProgramProgress(programClient: ProgramClient, durationWeeks: number): number {
  if (!programClient.startDate) return 0;

  const start = new Date(programClient.startDate);
  const end = calculateProgramEndDate(programClient.startDate, durationWeeks);
  const now = new Date();

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  return Math.round((elapsed / totalDuration) * 100);
}
