import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { WorkoutStatus } from '../types/workouts';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmModal from '../components/shared/ConfirmModal';
import { ProgressBar } from '../components/workout/ProgressBar';
import { ExerciseView } from '../components/workout/ExerciseView';
import { TimerDisplay } from '../components/workout/TimerDisplay';
import { RepsTracker } from '../components/workout/RepsTracker';
import { RestTimer } from '../components/workout/RestTimer';

export function WorkoutSessionPage() {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

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
    getCurrentExercise,
    isLastExercise,
    isLastSet,
  } = useWorkoutSession(routineId);

  const currentExercise = getCurrentExercise();

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

  const handleSetComplete = async (data: { repsCompleted?: number; weightKg?: number; durationSeconds?: number }) => {
    await completeSet(data);
  };

  const handleTimerComplete = async () => {
    // For timer-based exercises, log the set with duration
    const exercise = getCurrentExercise();
    if (!exercise) return;

    const duration = exercise.duration || exercise.exercise?.defaultDuration || 0;
    await completeSet({ durationSeconds: duration });
  };

  // Loading state
  if (state.status === 'loading' || !state.routine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando entrenamiento..." />
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center p-4">
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

  // Completed state
  if (state.status === WorkoutStatus.COMPLETED) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            ¡Entrenamiento Completado!
          </h2>
          <p className="text-slate-600 mb-8">
            Has completado todos los ejercicios de {state.routine.name}
          </p>
          <button
            onClick={() => navigate('/my-routines')}
            className="btn-primary w-full"
          >
            Volver a Mis Rutinas
          </button>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center p-4">
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

  // Get next exercise for preview
  const nextExercise = state.routine.exercises && state.currentExerciseIndex < state.routine.exercises.length - 1
    ? state.routine.exercises[state.currentExerciseIndex + 1]
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500">
      {/* Progress Bar */}
      <ProgressBar
        currentExercise={state.currentExerciseIndex}
        totalExercises={state.routine.exercises?.length || 0}
        currentSet={state.currentSetNumber}
        totalSets={targetSets}
      />

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {state.routine.name}
            </h1>
            <p className="text-sm text-white/80">
              {state.routine.exercises?.length || 0} ejercicios
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Pause/Resume Button */}
            {state.status !== 'resting' && (
              <button
                onClick={handlePauseResume}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white"
                aria-label={state.status === WorkoutStatus.PAUSED ? 'Reanudar' : 'Pausar'}
              >
                <FontAwesomeIcon
                  icon={state.status === WorkoutStatus.PAUSED ? faPlay : faPause}
                  className="text-sm"
                />
              </button>
            )}

            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white"
              aria-label="Salir"
            >
              <FontAwesomeIcon icon={faXmark} className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Paused Overlay */}
          {state.status === WorkoutStatus.PAUSED && (
            <div className="bg-yellow-500 text-white rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Entrenamiento Pausado</h3>
              <p className="mb-4">Presiona el botón de play para continuar</p>
              <button onClick={resumeWorkout} className="btn-primary bg-white text-yellow-600 hover:bg-slate-100">
                Reanudar Entrenamiento
              </button>
            </div>
          )}

          {/* Resting State */}
          {state.status === 'resting' && state.restTimeRemaining && (
            <RestTimer
              restSeconds={state.restTimeRemaining}
              onComplete={completeRest}
              nextExercise={nextExercise}
            />
          )}

          {/* Active Exercise */}
          {state.status === WorkoutStatus.IN_PROGRESS && (
            <>
              {/* Exercise Info */}
              <ExerciseView
                routineExercise={currentExercise}
                currentSet={state.currentSetNumber}
                totalSets={targetSets}
              />

              {/* Timer or Reps Tracker */}
              {targetDuration ? (
                <TimerDisplay
                  durationSeconds={targetDuration}
                  onComplete={handleTimerComplete}
                  autoStart={true}
                />
              ) : (
                <RepsTracker
                  targetSets={targetSets}
                  targetReps={targetReps}
                  completedSets={state.completedSets.filter(
                    (set) => set.routineExerciseId === currentExercise.id
                  )}
                  currentSet={state.currentSetNumber}
                  onSetComplete={handleSetComplete}
                />
              )}

              {/* Skip Exercise Button */}
              <button
                onClick={handleSkipExercise}
                className="btn-secondary w-full"
              >
                Saltar Ejercicio
              </button>
            </>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={confirmExit}
        title="¿Salir del entrenamiento?"
        message="Tu progreso se guardará y podrás continuar más tarde."
        confirmText="Salir"
        cancelText="Continuar entrenando"
        tone="primary"
      />

      {/* Skip Exercise Confirmation Modal */}
      <ConfirmModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={confirmSkip}
        title="¿Saltar este ejercicio?"
        message="El ejercicio se marcará como omitido. No podrás deshacer esta acción."
        confirmText="Saltar"
        cancelText="Cancelar"
        tone="danger"
      />
    </div>
  );
}
