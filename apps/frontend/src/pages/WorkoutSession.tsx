import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPause, faPlay, faForward, faRotateRight, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { WorkoutStatus } from '../types/workouts';
import { useAuth } from '../context/AuthContext';
import { apiUpload, apiFetch } from '../lib/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { ConfirmModal } from '../shared/ConfirmModal';
import { MotivationalMessage } from '../components/workout/MotivationalMessage';
import { WorkoutSummary } from '../components/workout/WorkoutSummary';
import { ExerciseFeedback } from '../components/workout/ExerciseFeedback';
import { RoutineStartSummary } from '../components/workout/RoutineStartSummary';
import { ExerciseTransition } from '../components/workout/ExerciseTransition';

type MessageType = 'setComplete' | 'exerciseComplete' | 'rest' | 'halfway' | 'almostDone';

export function WorkoutSessionPage() {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showRestartRoutineModal, setShowRestartRoutineModal] = useState(false);
  const [showRestartExerciseModal, setShowRestartExerciseModal] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState<{
    show: boolean;
    type: MessageType;
  }>({ show: false, type: 'setComplete' });
  const [hasShownHalfway, setHasShownHalfway] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastExerciseIndex, setLastExerciseIndex] = useState(0);
  const [showRoutineSummary, setShowRoutineSummary] = useState(() => {
    // Si hay flag de skip summary, no mostrar resumen
    const skipSummary = localStorage.getItem('skipWorkoutSummary');
    if (skipSummary) {
      localStorage.removeItem('skipWorkoutSummary');
      return false;
    }
    return true;
  });
  const [showExerciseTransition, setShowExerciseTransition] = useState(() => {
    // Si hay flag de skip summary, mostrar transición directamente
    const skipSummary = localStorage.getItem('skipWorkoutSummary');
    return !!skipSummary;
  });
  const [hasCheckedActiveSession, setHasCheckedActiveSession] = useState(false);
  const [pendingExerciseTransition, setPendingExerciseTransition] = useState(false);

  if (!routineId) {
    navigate('/my-routines');
    return null;
  }

  const {
    state,
    completeSet,
    pauseWorkout,
    resumeWorkout,
    skipExercise,
    completeRest,
    addComment,
    completeWorkout,
    getCurrentExercise,
    isLastExercise,
    isLastSet,
  } = useWorkoutSession(routineId);

  const currentExercise = getCurrentExercise();

  // Detectar si hay una sesión activa al cargar
  useEffect(() => {
    if (state.status !== 'loading' && state.routine && !hasCheckedActiveSession) {
      setHasCheckedActiveSession(true);
    }
  }, [state.status, state.routine, hasCheckedActiveSession]);

  // Detectar cuando se completa un ejercicio (cambia el índice)
  useEffect(() => {
    if (state.status === 'loading' || !state.routine || showRoutineSummary) return;

    // Si avanzamos a un nuevo ejercicio (índice aumentó)
    if (state.currentExerciseIndex > lastExerciseIndex && lastExerciseIndex >= 0) {
      // Mostrar transición inmediatamente sin mensaje motivacional
      if (state.currentExerciseIndex > 0 || lastExerciseIndex > 0) {
        setPendingExerciseTransition(true);
        // Usar setTimeout para asegurar que la transición se muestre en el siguiente render
        setTimeout(() => {
          setShowExerciseTransition(true);
          setPendingExerciseTransition(false);
        }, 0);
      }
    }

    // Actualizar el último índice conocido
    if (state.currentExerciseIndex !== lastExerciseIndex) {
      setLastExerciseIndex(state.currentExerciseIndex);
    }
  }, [state.currentExerciseIndex, state.status, state.routine, showRoutineSummary, lastExerciseIndex]);

  // Mensajes motivacionales deshabilitados temporalmente
  // TODO: Re-implementar mensajes motivacionales en el futuro
  /*
  useEffect(() => {
    if (!state.routine?.exercises || state.status === 'loading') return;

    const totalExercises = state.routine.exercises.length;
    const currentIndex = state.currentExerciseIndex;
    const progress = ((currentIndex + 1) / totalExercises) * 100;

    // Mostrar mensaje de mitad solo una vez cuando llegamos al 50%
    if (progress >= 50 && !hasShownHalfway && currentIndex > 0) {
      setHasShownHalfway(true);
      setTimeout(() => {
        setMotivationalMessage({ show: true, type: 'halfway' });
      }, 2000);
    }

    // Mostrar mensaje de "casi terminas" al llegar al último ejercicio
    if (currentIndex === totalExercises - 1 && state.currentSetNumber === 1 && currentIndex > 0) {
      setTimeout(() => {
        setMotivationalMessage({ show: true, type: 'almostDone' });
      }, 2000);
    }
  }, [state.currentExerciseIndex, state.currentSetNumber, state.routine, state.status, hasShownHalfway]);
  */

  const handleExit = () => {
    if (state.status === WorkoutStatus.IN_PROGRESS || state.status === 'resting') {
      setShowExitModal(true);
    } else {
      navigate('/my-routines');
    }
  };

  const confirmExit = async () => {
    if (state.status === WorkoutStatus.IN_PROGRESS || state.status === 'resting') {
      await pauseWorkout();
    }
    setShowExitModal(false);
    navigate('/my-routines');
  };

  const handlePauseResume = async () => {
    if (state.status === WorkoutStatus.PAUSED) {
      await resumeWorkout();
    } else if (state.status === WorkoutStatus.IN_PROGRESS) {
      await pauseWorkout();
    }
  };

  const handleSkipExercise = () => {
    setShowSkipModal(true);
  };

  const confirmSkip = async () => {
    await skipExercise();
    setShowSkipModal(false);
  };

  const handleRestartRoutine = () => {
    setShowRestartRoutineModal(true);
  };

  const confirmRestartRoutine = async () => {
    if (!state.sessionId || !token) return;

    try {
      // Abandon current session to mark it as abandoned
      await apiFetch(`/workouts/sessions/${state.sessionId}`, {
        method: 'PATCH',
        token,
        body: { status: WorkoutStatus.ABANDONED },
      });

      // Clear localStorage
      localStorage.removeItem('activeWorkout');

      // Reload to start fresh
      window.location.reload();
    } catch (error) {
      console.error('Error al reiniciar rutina:', error);
      alert('Error al reiniciar la rutina');
      setShowRestartRoutineModal(false);
    }
  };

  const handleRestartFromSummary = async () => {
    if (!state.sessionId || !token) {
      // No hay sesión activa, solo cerrar el resumen
      setShowRoutineSummary(false);
      setShowExerciseTransition(true);
      return;
    }

    try {
      // Borrar todos los sets completados de la sesión
      for (const set of state.completedSets) {
        await apiFetch(`/workouts/sessions/${state.sessionId}/sets/${set.id}`, {
          method: 'DELETE',
          token,
        });
      }

      // Resetear la sesión al primer ejercicio
      await apiFetch(`/workouts/sessions/${state.sessionId}`, {
        method: 'PATCH',
        token,
        body: {
          currentExerciseIndex: 0,
          currentSetNumber: 1,
        },
      });

      // Marcar que debe saltarse el resumen al recargar
      localStorage.setItem('skipWorkoutSummary', 'true');
      localStorage.removeItem('activeWorkout');

      // Recargar para obtener el estado actualizado
      window.location.reload();
    } catch (error) {
      console.error('Error al empezar de nuevo:', error);
      alert('Error al empezar de nuevo');
    }
  };

  const handleStartFromSummary = () => {
    setShowRoutineSummary(false);
    // Siempre mostrar transición antes del ejercicio
    setShowExerciseTransition(true);
  };

  const handleRestartExercise = () => {
    setShowRestartExerciseModal(true);
  };

  const confirmRestartExercise = async () => {
    if (!state.sessionId || !token) return;

    const currentExercise = getCurrentExercise();
    if (!currentExercise) return;

    try {
      // Delete all sets for the current exercise
      const setsToDelete = state.completedSets.filter(
        (set) => set.routineExerciseId === currentExercise.id
      );

      for (const set of setsToDelete) {
        await apiFetch(`/workouts/sessions/${state.sessionId}/sets/${set.id}`, {
          method: 'DELETE',
          token,
        });
      }

      // Reload to refresh state
      window.location.reload();
    } catch (error) {
      console.error('Error al reiniciar ejercicio:', error);
      alert('Error al reiniciar el ejercicio');
    } finally {
      setShowRestartExerciseModal(false);
    }
  };

  const handleSetComplete = async (data: { repsCompleted?: number; weightKg?: number; durationSeconds?: number }) => {
    await completeSet(data);
    // El mensaje motivacional se mostrará automáticamente cuando cambie el índice del ejercicio
  };

  const handleTimerComplete = async () => {
    const exercise = getCurrentExercise();
    if (!exercise) return;

    const duration = exercise.duration || exercise.exercise?.defaultDuration || 0;
    await completeSet({ durationSeconds: duration });
    // El mensaje motivacional se mostrará automáticamente cuando cambie el índice del ejercicio
  };

  // Loading state
  if (state.status === 'loading' || !state.routine) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando entrenamiento..." />
      </div>
    );
  }

  // Routine Start Summary (shown once at the beginning)
  if (showRoutineSummary) {
    // Detectar si hay una sesión activa (no abandonada ni completada)
    const hasActiveSession = state.sessionId !== null &&
                             state.currentExerciseIndex >= 0 &&
                             state.status !== WorkoutStatus.COMPLETED &&
                             state.status !== WorkoutStatus.ABANDONED;
    const activeSessionProgress = hasActiveSession && currentExercise
      ? {
          currentExerciseIndex: state.currentExerciseIndex,
          currentExerciseName: currentExercise.exercise?.name || 'Ejercicio',
        }
      : undefined;

    return (
      <RoutineStartSummary
        routine={state.routine}
        onStart={handleStartFromSummary}
        onRestart={handleRestartFromSummary}
        onCancel={() => navigate('/my-routines')}
        hasActiveSession={hasActiveSession}
        activeSessionProgress={activeSessionProgress}
      />
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-700 mb-6">{state.error}</p>
          <button
            onClick={() => navigate('/my-routines')}
            className="btn-primary w-full"
          >
            Volver a Rutinas
          </button>
        </div>
      </div>
    );
  }

  // Completed state - Show summary form
  if (state.status === WorkoutStatus.COMPLETED) {
    const handleSummaryComplete = async (notes?: string, photos?: { blob: Blob; filename: string }[]) => {
      await completeWorkout(notes);

      if (photos && photos.length > 0 && state.sessionId && token) {
        try {
          const formData = new FormData();
          photos.forEach((photo) => {
            formData.append('photos', photo.blob, photo.filename);
          });

          await apiUpload(
            `/workouts/sessions/${state.sessionId}/photos`,
            formData,
            { method: 'POST', token }
          );

          console.log(`✅ ${photos.length} photos uploaded successfully (${
            Math.round(photos.reduce((sum, p) => sum + p.blob.size, 0) / 1024)
          } KB total)`);
        } catch (error) {
          console.error('Error uploading photos:', error);
          alert('No se pudieron subir las fotos, pero tu entrenamiento se guardó correctamente.');
        }
      }

      navigate('/my-routines');
    };

    const handleSummarySkip = () => {
      navigate('/my-routines');
    };

    const sessionData = {
      id: state.sessionId || '',
      routineId: state.routineId,
      routine: state.routine,
      status: state.status,
      currentExerciseIndex: state.currentExerciseIndex,
      currentSetNumber: state.currentSetNumber,
      sets: state.completedSets,
      comments: state.comments,
      startedAt: state.startTime?.toISOString() || new Date().toISOString(),
      totalDurationSeconds: state.totalElapsedSeconds,
    };

    return (
      <WorkoutSummary
        session={sessionData as any}
        onComplete={handleSummaryComplete}
        onSkip={handleSummarySkip}
      />
    );
  }

  // Exercise Transition Screen (shown between exercises)
  if (showExerciseTransition && currentExercise) {
    return (
      <ExerciseTransition
        exercise={currentExercise}
        exerciseNumber={state.currentExerciseIndex + 1}
        totalExercises={state.routine.exercises?.length || 0}
        onContinue={() => setShowExerciseTransition(false)}
      />
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            No hay ejercicios
          </h2>
          <p className="text-slate-700 mb-6">
            No se encontraron ejercicios en esta rutina.
          </p>
          <button
            onClick={() => navigate('/my-routines')}
            className="btn-primary w-full"
          >
            Volver a Rutinas
          </button>
        </div>
      </div>
    );
  }

  const targetSets = currentExercise.sets || currentExercise.exercise?.defaultSets || 3;
  const targetReps = currentExercise.reps || currentExercise.exercise?.defaultReps;
  const targetDuration = currentExercise.duration || currentExercise.exercise?.defaultDuration;
  const restSeconds = currentExercise.rest || currentExercise.exercise?.defaultRest || 60;

  const nextExercise = state.routine.exercises && state.currentExerciseIndex < state.routine.exercises.length - 1
    ? state.routine.exercises[state.currentExerciseIndex + 1]
    : undefined;

  const completedSetsCount = state.completedSets.filter(
    (set) => set.routineExerciseId === currentExercise.id
  ).length;

  const progress = ((state.currentExerciseIndex * targetSets + completedSetsCount) /
    ((state.routine.exercises?.length || 1) * targetSets)) * 100;

  // Si estamos esperando mostrar la transición, no renderizar nada todavía
  if (pendingExerciseTransition) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // FULLSCREEN WORKOUT UI
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm shrink-0">
        <div className="flex-1">
          <h1 className="text-lg font-bold truncate">{state.routine.name}</h1>
          <p className="text-sm text-slate-300">
            Ejercicio {state.currentExerciseIndex + 1} de {state.routine.exercises?.length || 0}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Restart Exercise Button */}
          <button
            onClick={handleRestartExercise}
            className="w-12 h-12 rounded-full bg-orange-500/20 hover:bg-orange-500/30 transition flex items-center justify-center border border-orange-500/40"
            title="Reiniciar ejercicio actual"
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} className="text-lg text-orange-400" />
          </button>

          {/* Restart Routine Button */}
          <button
            onClick={handleRestartRoutine}
            className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 transition flex items-center justify-center border border-red-500/40"
            title="Reiniciar toda la rutina"
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-lg text-red-400" />
          </button>

          {state.status !== 'resting' && state.status !== WorkoutStatus.PAUSED && (
            <button
              onClick={handlePauseResume}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              title="Pausar"
            >
              <FontAwesomeIcon icon={faPause} className="text-lg" />
            </button>
          )}

          <button
            onClick={handleExit}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            title="Salir"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-black/30 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content - Fullscreen */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        {/* Paused Overlay */}
        {state.status === WorkoutStatus.PAUSED && (
          <div className="text-center">
            <div className="text-8xl mb-6">⏸️</div>
            <h2 className="text-4xl font-bold mb-4">Pausado</h2>
            <button onClick={resumeWorkout} className="btn-primary px-8 py-4 text-xl">
              Reanudar
            </button>
          </div>
        )}

        {/* Resting State */}
        {state.status === 'resting' && state.restTimeRemaining && (
          <div className="text-center w-full max-w-2xl">
            <p className="text-xl md:text-2xl text-slate-300 mb-4">Descanso</p>
            <div className="text-7xl md:text-9xl font-bold mb-6 tabular-nums">
              {Math.floor(state.restTimeRemaining / 60)}:{String(state.restTimeRemaining % 60).padStart(2, '0')}
            </div>

            {/* Show different content based on whether we're between sets or between exercises */}
            {completedSetsCount > 0 ? (
              // Between sets of the same exercise - show current exercise progress
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                <p className="text-lg md:text-xl font-semibold mb-3">{currentExercise.exercise?.name}</p>
                <div className="flex items-center justify-center gap-4 text-slate-300">
                  <div>
                    <p className="text-2xl font-bold text-green-400">{completedSetsCount}</p>
                    <p className="text-sm">Completadas</p>
                  </div>
                  <div className="text-3xl text-slate-600">/</div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{targetSets}</p>
                    <p className="text-sm">Total</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-3">
                  Siguiente: Serie {state.currentSetNumber}
                </p>
              </div>
            ) : (() => {
              // After last set of previous exercise - show PREVIOUS exercise completion info
              const prevExerciseIndex = state.currentExerciseIndex - 1;
              const prevExercise = prevExerciseIndex >= 0 ? state.routine.exercises?.[prevExerciseIndex] : null;
              const prevExerciseSets = prevExercise?.sets || prevExercise?.exercise?.defaultSets || 3;

              return prevExercise ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                  <p className="text-lg md:text-xl font-semibold mb-3">{prevExercise.exercise?.name}</p>
                  <div className="flex items-center justify-center gap-4 text-slate-300">
                    <div>
                      <p className="text-2xl font-bold text-green-400">{prevExerciseSets}</p>
                      <p className="text-sm">Completadas</p>
                    </div>
                    <div className="text-3xl text-slate-600">/</div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">{prevExerciseSets}</p>
                      <p className="text-sm">Total</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-400 mt-3 font-semibold">
                    ¡Ejercicio completado!
                  </p>
                </div>
              ) : null;
            })()}

            <button
              onClick={completeRest}
              className="btn-primary px-6 py-3 text-lg"
            >
              <FontAwesomeIcon icon={faForward} className="mr-2" />
              Saltar Descanso
            </button>
          </div>
        )}

        {/* Active Exercise */}
        {state.status === WorkoutStatus.IN_PROGRESS && (
          <div className="text-center w-full max-w-3xl">
            {/* Exercise Name */}
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{currentExercise.exercise?.name}</h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-6">
              Serie {state.currentSetNumber} de {targetSets}
            </p>

            {/* Timer or Reps Display */}
            {targetDuration ? (
              <TimerDisplayFullscreen
                durationSeconds={targetDuration}
                onComplete={handleTimerComplete}
                autoStart={true}
              />
            ) : (
              <RepsDisplayFullscreen
                targetReps={targetReps}
                completedSetsCount={completedSetsCount}
                onComplete={handleSetComplete}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Comment Button - Bottom Left */}
      {state.status === WorkoutStatus.IN_PROGRESS && (
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Dejar comentario"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Floating Skip/Next Button - Center Right */}
      {state.status === WorkoutStatus.IN_PROGRESS && !isLastExercise() && (
        <button
          onClick={handleSkipExercise}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Siguiente ejercicio"
        >
          <FontAwesomeIcon icon={faForward} className="text-xl" />
        </button>
      )}

      {/* Feedback Semi-Modal */}
      {showFeedback && state.sessionId && currentExercise && currentExercise.exercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-start p-6 pointer-events-none">
          <div className="pointer-events-auto bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Comentario</h3>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <ExerciseFeedback
              routineExerciseId={currentExercise.id}
              sessionId={state.sessionId}
              exerciseName={currentExercise.exercise.name}
              onSubmit={async (content, type) => {
                await addComment(content, type);
                setShowFeedback(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={confirmExit}
        title="¿Salir del entrenamiento?"
        description="Tu progreso se guardará y podrás continuar más tarde."
        confirmLabel="Salir"
        cancelLabel="Continuar entrenando"
        confirmTone="primary"
      />

      <ConfirmModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={confirmSkip}
        title="¿Saltar este ejercicio?"
        description="El ejercicio se marcará como omitido."
        confirmLabel="Saltar"
        cancelLabel="Cancelar"
        confirmTone="danger"
      />

      <ConfirmModal
        isOpen={showRestartRoutineModal}
        onClose={() => setShowRestartRoutineModal(false)}
        onConfirm={confirmRestartRoutine}
        title="¿Reiniciar toda la rutina?"
        description="Perderás TODO el progreso de la rutina y comenzarás desde el primer ejercicio. Esta acción no se puede deshacer."
        confirmLabel="Reiniciar Todo"
        cancelLabel="Cancelar"
        confirmTone="danger"
      />

      <ConfirmModal
        isOpen={showRestartExerciseModal}
        onClose={() => setShowRestartExerciseModal(false)}
        onConfirm={confirmRestartExercise}
        title="¿Reiniciar ejercicio actual?"
        description="Borrarás todas las series completadas de este ejercicio y comenzarás desde la serie 1."
        confirmLabel="Reiniciar Ejercicio"
        cancelLabel="Cancelar"
        confirmTone="danger"
      />

      {/* Mensajes motivacionales deshabilitados temporalmente */}
      {/* <MotivationalMessage
        type={motivationalMessage.type}
        show={motivationalMessage.show}
        onClose={() => setMotivationalMessage({ ...motivationalMessage, show: false })}
        autoCloseDelay={1200}
      /> */}
    </div>
  );
}

// Fullscreen Timer Component
function TimerDisplayFullscreen({
  durationSeconds,
  onComplete,
  autoStart,
}: {
  durationSeconds: number;
  onComplete: () => void;
  autoStart: boolean;
}) {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onComplete]);

  const progress = ((durationSeconds - timeRemaining) / durationSeconds) * 100;

  return (
    <div className="space-y-6">
      <div className="text-7xl md:text-9xl font-bold tabular-nums">
        {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
      </div>

      <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        onClick={() => setIsRunning(!isRunning)}
        className="btn-primary px-6 py-3 text-lg"
      >
        <FontAwesomeIcon icon={isRunning ? faPause : faPlay} className="mr-2" />
        {isRunning ? 'Pausar' : 'Continuar'}
      </button>
    </div>
  );
}

// Fullscreen Reps Display
function RepsDisplayFullscreen({
  targetReps,
  completedSetsCount,
  onComplete,
}: {
  targetReps?: number;
  completedSetsCount: number;
  onComplete: (data: { repsCompleted?: number; weightKg?: number }) => void;
}) {
  const [reps, setReps] = useState(targetReps || 0);
  const [weight, setWeight] = useState('');

  const handleComplete = () => {
    onComplete({
      repsCompleted: reps,
      weightKg: weight ? parseFloat(weight) : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xl text-slate-300 block">Repeticiones</label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(parseInt(e.target.value) || 0)}
          className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-3 text-5xl md:text-6xl font-bold text-center focus:outline-none focus:border-white/40"
          min="0"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xl text-slate-300 block">Peso (kg) - Opcional</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="0"
          className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-3 text-3xl md:text-4xl font-bold text-center focus:outline-none focus:border-white/40"
          step="0.5"
          min="0"
        />
      </div>

      <button
        onClick={handleComplete}
        className="btn-primary w-full px-6 py-4 text-xl"
        disabled={reps === 0}
      >
        ✓ Completar Serie
      </button>
    </div>
  );
}
