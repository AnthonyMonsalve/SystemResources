import type { Routine } from './routines';

// Enums
export enum WorkoutStatus {
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum CommentType {
  QUESTION = 'question',
  ISSUE = 'issue',
  NOTE = 'note',
}

// Entity interfaces
export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  programId?: string;
  status: WorkoutStatus;
  startedAt: string;
  pausedAt?: string;
  completedAt?: string;
  totalDurationSeconds: number;
  currentExerciseIndex: number;
  currentSetNumber: number;
  notes?: string;
  routine?: Routine;
  sets: ExerciseSet[];
  comments: WorkoutComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  id: string;
  sessionId: string;
  routineExerciseId: string;
  setNumber: number;
  repsCompleted?: number;
  durationSeconds?: number;
  weightKg?: number;
  completed: boolean;
  skipped: boolean;
  completedAt: string;
  notes?: string;
  createdAt: string;
}

export interface WorkoutComment {
  id: string;
  sessionId: string;
  routineExerciseId: string;
  content: string;
  type: CommentType;
  createdAt: string;
}

// DTOs for API requests
export interface CreateSessionDto {
  routineId: string;
  programId?: string;
}

export interface UpdateSessionDto {
  status?: WorkoutStatus;
  currentExerciseIndex?: number;
  currentSetNumber?: number;
  notes?: string;
  totalDurationSeconds?: number;
}

export interface LogSetDto {
  routineExerciseId: string;
  setNumber: number;
  repsCompleted?: number;
  durationSeconds?: number;
  weightKg?: number;
  completed?: boolean;
  skipped?: boolean;
  notes?: string;
}

export interface AddCommentDto {
  routineExerciseId: string;
  content: string;
  type?: CommentType;
}

// State management types for useWorkoutSession
export interface WorkoutState {
  sessionId: string | null;
  routineId: string;
  routine: Routine | null;
  status: WorkoutStatus | 'loading' | 'resting';
  currentExerciseIndex: number;
  currentSetNumber: number;
  completedSets: ExerciseSet[];
  comments: WorkoutComment[];
  startTime: Date | null;
  totalElapsedSeconds: number;
  restTimeRemaining: number | null;
  error: string | null;
}

export type WorkoutAction =
  | { type: 'INIT_SESSION'; payload: { session: WorkoutSession; routine: Routine } }
  | { type: 'COMPLETE_SET'; payload: ExerciseSet }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'START_REST'; payload: { restSeconds: number } }
  | { type: 'COMPLETE_REST' }
  | { type: 'SKIP_EXERCISE' }
  | { type: 'ADD_COMMENT'; payload: WorkoutComment }
  | { type: 'COMPLETE_WORKOUT'; payload: { notes?: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_ELAPSED_TIME'; payload: number };

// Helper types
export interface SessionHistoryResponse {
  data: WorkoutSession[];
  total: number;
  page: number;
  limit: number;
}

// Helper functions
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function getWorkoutProgress(
  currentExerciseIndex: number,
  totalExercises: number,
): number {
  if (totalExercises === 0) return 0;
  return Math.round(((currentExerciseIndex + 1) / totalExercises) * 100);
}
