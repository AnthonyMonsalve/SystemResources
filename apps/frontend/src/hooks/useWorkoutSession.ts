import { useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { WorkoutStatus, CommentType } from '../types/workouts';
import type {
  WorkoutState,
  WorkoutAction,
  WorkoutSession,
  CreateSessionDto,
  LogSetDto,
  AddCommentDto,
  UpdateSessionDto,
  ExerciseSet,
  WorkoutComment,
} from '../types/workouts';
import type { RoutineExercise } from '../types/routines';

const STORAGE_KEY = 'activeWorkout';

// Initial state
const initialState: WorkoutState = {
  sessionId: null,
  routineId: '',
  routine: null,
  status: 'loading',
  currentExerciseIndex: 0,
  currentSetNumber: 1,
  completedSets: [],
  comments: [],
  startTime: null,
  totalElapsedSeconds: 0,
  restTimeRemaining: null,
  error: null,
};

// Reducer
function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'INIT_SESSION':
      return {
        ...state,
        sessionId: action.payload.session.id,
        routineId: action.payload.session.routineId,
        routine: action.payload.routine,
        status: action.payload.session.status as WorkoutState['status'],
        currentExerciseIndex: action.payload.session.currentExerciseIndex,
        currentSetNumber: action.payload.session.currentSetNumber,
        completedSets: action.payload.session.sets || [],
        comments: action.payload.session.comments || [],
        startTime: new Date(action.payload.session.startedAt),
        totalElapsedSeconds: action.payload.session.totalDurationSeconds,
        error: null,
      };

    case 'COMPLETE_SET':
      return {
        ...state,
        completedSets: [...state.completedSets, action.payload],
      };

    case 'PAUSE':
      return {
        ...state,
        status: WorkoutStatus.PAUSED,
      };

    case 'RESUME':
      return {
        ...state,
        status: WorkoutStatus.IN_PROGRESS,
      };

    case 'START_REST':
      return {
        ...state,
        status: 'resting',
        restTimeRemaining: action.payload.restSeconds,
      };

    case 'TICK_REST':
      return {
        ...state,
        restTimeRemaining: state.restTimeRemaining ? state.restTimeRemaining - 1 : null,
      };

    case 'COMPLETE_REST':
      return {
        ...state,
        status: WorkoutStatus.IN_PROGRESS,
        restTimeRemaining: null,
      };

    case 'SKIP_EXERCISE':
      return {
        ...state,
        currentExerciseIndex: state.currentExerciseIndex + 1,
        currentSetNumber: 1,
      };

    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };

    case 'COMPLETE_WORKOUT':
      return {
        ...state,
        status: WorkoutStatus.COMPLETED,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'UPDATE_ELAPSED_TIME':
      return {
        ...state,
        totalElapsedSeconds: action.payload,
      };

    default:
      return state;
  }
}

export function useWorkoutSession(routineId: string) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  const { token } = useAuth();

  // Save to localStorage on every state change
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Initialize session
  useEffect(() => {
    initSession();
  }, [routineId]);

  // Rest timer countdown
  useEffect(() => {
    if (state.status !== 'resting' || !state.restTimeRemaining) return;

    if (state.restTimeRemaining <= 0) {
      dispatch({ type: 'COMPLETE_REST' });
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_REST' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.restTimeRemaining]);

  const initSession = async () => {
    if (!token) return;

    try {
      // Check for active session first (resume capability)
      const activeSession = await apiFetch<WorkoutSession | null>('/workouts/active', {
        token,
      });

      if (activeSession && activeSession.routineId === routineId) {
        // Resume existing session
        dispatch({
          type: 'INIT_SESSION',
          payload: {
            session: activeSession,
            routine: activeSession.routine!,
          },
        });
      } else {
        // Create new session
        const createDto: CreateSessionDto = { routineId };
        const newSession = await apiFetch<WorkoutSession>('/workouts/sessions', {
          method: 'POST',
          token,
          body: createDto,
        });

        dispatch({
          type: 'INIT_SESSION',
          payload: {
            session: newSession,
            routine: newSession.routine!,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al iniciar sesión',
      });
    }
  };

  const completeSet = useCallback(
    async (setData: Omit<LogSetDto, 'routineExerciseId' | 'setNumber'>) => {
      if (!token || !state.sessionId || !state.routine) return;

      try {
        const currentExercise = getCurrentExercise();
        if (!currentExercise) return;

        // Check if this is the last set BEFORE updating state
        const targetSets = currentExercise.sets || currentExercise.exercise?.defaultSets || 3;
        const completedSetsForExercise = state.completedSets.filter(
          (set) => set.routineExerciseId === currentExercise.id,
        ).length;
        const isLastSetOfExercise = completedSetsForExercise >= targetSets - 1;
        const isLastExerciseInWorkout = state.currentExerciseIndex === (state.routine.exercises?.length || 0) - 1;

        const logSetDto: LogSetDto = {
          routineExerciseId: currentExercise.id,
          setNumber: state.currentSetNumber,
          ...setData,
          completed: true,
        };

        const exerciseSet = await apiFetch<ExerciseSet>(
          `/workouts/sessions/${state.sessionId}/sets`,
          {
            method: 'POST',
            token,
            body: logSetDto,
          },
        );

        dispatch({ type: 'COMPLETE_SET', payload: exerciseSet });

        // Fetch updated session to get auto-advanced state
        const updatedSession = await apiFetch<WorkoutSession>(
          `/workouts/sessions/${state.sessionId}`,
          { token },
        );

        // Update state with new indices from backend
        dispatch({
          type: 'INIT_SESSION',
          payload: {
            session: updatedSession,
            routine: state.routine,
          },
        });

        // SIEMPRE iniciar descanso después de cada serie (incluso la última)
        // Solo NO descansar si es la última serie del último ejercicio (fin de rutina)
        const restSeconds = currentExercise.rest || currentExercise.exercise?.defaultRest || 0;
        const isFinalSetOfRoutine = isLastSetOfExercise && isLastExerciseInWorkout;

        if (restSeconds > 0 && !isFinalSetOfRoutine) {
          dispatch({ type: 'START_REST', payload: { restSeconds } });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Error al registrar set',
        });
      }
    },
    [token, state.sessionId, state.routine, state.currentSetNumber, state.completedSets, state.currentExerciseIndex],
  );

  const pauseWorkout = useCallback(async () => {
    if (!token || !state.sessionId) return;

    try {
      const updateDto: UpdateSessionDto = { status: WorkoutStatus.PAUSED };
      await apiFetch(`/workouts/sessions/${state.sessionId}`, {
        method: 'PATCH',
        token,
        body: updateDto,
      });

      dispatch({ type: 'PAUSE' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al pausar',
      });
    }
  }, [token, state.sessionId]);

  const resumeWorkout = useCallback(async () => {
    if (!token || !state.sessionId) return;

    try {
      const updateDto: UpdateSessionDto = { status: WorkoutStatus.IN_PROGRESS };
      await apiFetch(`/workouts/sessions/${state.sessionId}`, {
        method: 'PATCH',
        token,
        body: updateDto,
      });

      dispatch({ type: 'RESUME' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al reanudar',
      });
    }
  }, [token, state.sessionId]);

  const skipExercise = useCallback(async () => {
    if (!token || !state.sessionId || !state.routine) return;

    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    try {
      // Log skipped sets for the exercise
      const targetSets = currentExercise.sets || currentExercise.exercise?.defaultSets || 3;
      for (let i = state.currentSetNumber; i <= targetSets; i++) {
        const logSetDto: LogSetDto = {
          routineExerciseId: currentExercise.id,
          setNumber: i,
          completed: false,
          skipped: true,
        };

        await apiFetch(`/workouts/sessions/${state.sessionId}/sets`, {
          method: 'POST',
          token,
          body: logSetDto,
        });
      }

      // Update backend with new exercise index
      const newExerciseIndex = state.currentExerciseIndex + 1;
      const updateDto: UpdateSessionDto = {
        currentExerciseIndex: newExerciseIndex,
        currentSetNumber: 1,
      };

      await apiFetch(`/workouts/sessions/${state.sessionId}`, {
        method: 'PATCH',
        token,
        body: updateDto,
      });

      dispatch({ type: 'SKIP_EXERCISE' });

      // Fetch updated session
      const updatedSession = await apiFetch<WorkoutSession>(
        `/workouts/sessions/${state.sessionId}`,
        { token },
      );

      dispatch({
        type: 'INIT_SESSION',
        payload: {
          session: updatedSession,
          routine: state.routine,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al saltar ejercicio',
      });
    }
  }, [token, state.sessionId, state.routine, state.currentSetNumber, state.currentExerciseIndex]);

  const goToPreviousExercise = useCallback(async () => {
    if (!token || !state.sessionId || !state.routine) return;
    if (state.currentExerciseIndex === 0) return; // No ir atrás si ya estamos en el primero

    try {
      // Update backend with previous exercise index
      const previousExerciseIndex = state.currentExerciseIndex - 1;
      const updateDto: UpdateSessionDto = {
        currentExerciseIndex: previousExerciseIndex,
        currentSetNumber: 1,
      };

      await apiFetch(`/workouts/sessions/${state.sessionId}`, {
        method: 'PATCH',
        token,
        body: updateDto,
      });

      // Fetch updated session
      const updatedSession = await apiFetch<WorkoutSession>(
        `/workouts/sessions/${state.sessionId}`,
        { token },
      );

      dispatch({
        type: 'INIT_SESSION',
        payload: {
          session: updatedSession,
          routine: state.routine,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error al volver al ejercicio anterior',
      });
    }
  }, [token, state.sessionId, state.routine, state.currentExerciseIndex]);

  const addComment = useCallback(
    async (content: string, type: CommentType = CommentType.NOTE) => {
      if (!token || !state.sessionId) return;

      const currentExercise = getCurrentExercise();
      if (!currentExercise) return;

      try {
        const commentDto: AddCommentDto = {
          routineExerciseId: currentExercise.id,
          content,
          type,
        };

        const comment = await apiFetch<WorkoutComment>(`/workouts/sessions/${state.sessionId}/comments`, {
          method: 'POST',
          token,
          body: commentDto,
        });

        dispatch({ type: 'ADD_COMMENT', payload: comment });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Error al agregar comentario',
        });
      }
    },
    [token, state.sessionId],
  );

  const completeWorkout = useCallback(
    async (notes?: string) => {
      if (!token || !state.sessionId) return;

      try {
        const updateDto: UpdateSessionDto = {
          status: WorkoutStatus.COMPLETED,
          notes,
        };

        await apiFetch(`/workouts/sessions/${state.sessionId}`, {
          method: 'PATCH',
          token,
          body: updateDto,
        });

        dispatch({ type: 'COMPLETE_WORKOUT' });

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Error al completar entrenamiento',
        });
      }
    },
    [token, state.sessionId],
  );

  const completeRest = useCallback(() => {
    dispatch({ type: 'COMPLETE_REST' });
  }, []);

  // Helper functions
  const getCurrentExercise = useCallback((): RoutineExercise | null => {
    if (!state.routine?.exercises) return null;
    return state.routine.exercises[state.currentExerciseIndex] || null;
  }, [state.routine, state.currentExerciseIndex]);

  const isLastExercise = useCallback((): boolean => {
    if (!state.routine?.exercises) return false;
    return state.currentExerciseIndex === state.routine.exercises.length - 1;
  }, [state.routine, state.currentExerciseIndex]);

  const isLastSet = useCallback((): boolean => {
    const currentExercise = getCurrentExercise();
    if (!currentExercise) return false;

    const targetSets = currentExercise.sets || currentExercise.exercise?.defaultSets || 3;
    const completedSetsForExercise = state.completedSets.filter(
      (set) => set.routineExerciseId === currentExercise.id,
    ).length;

    return completedSetsForExercise >= targetSets - 1; // -1 because we're checking before completing current set
  }, [state.completedSets, getCurrentExercise]);

  return {
    state,
    completeSet,
    pauseWorkout,
    resumeWorkout,
    skipExercise,
    goToPreviousExercise,
    addComment,
    completeWorkout,
    completeRest,
    getCurrentExercise,
    isLastExercise,
    isLastSet,
  };
}
