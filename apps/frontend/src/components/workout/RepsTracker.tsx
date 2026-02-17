import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import type { ExerciseSet } from '../../types/workouts';

interface RepsTrackerProps {
  targetSets: number;
  targetReps?: number;
  completedSets: ExerciseSet[];
  currentSet: number;
  onSetComplete: (data: { repsCompleted?: number; weightKg?: number }) => void;
}

export function RepsTracker({
  targetSets,
  targetReps,
  completedSets,
  currentSet,
  onSetComplete,
}: RepsTrackerProps) {
  const [reps, setReps] = useState(targetReps?.toString() || '');
  const [weight, setWeight] = useState('');

  const handleComplete = () => {
    const data = {
      repsCompleted: reps ? parseInt(reps, 10) : undefined,
      weightKg: weight ? parseFloat(weight) : undefined,
    };
    onSetComplete(data);
    // Reset for next set
    setReps(targetReps?.toString() || '');
    setWeight('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Sets Grid */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          Series Completadas
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: targetSets }).map((_, index) => {
            const setNumber = index + 1;
            const isCompleted = completedSets.some(
              (set) => set.setNumber === setNumber && set.completed
            );
            const isCurrent = setNumber === currentSet;

            return (
              <div
                key={setNumber}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center
                  transition-all
                  ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-primary-500 text-white ring-4 ring-primary-200'
                      : 'bg-slate-100 text-slate-400'
                  }
                `}
              >
                {isCompleted ? (
                  <FontAwesomeIcon icon={faCheck} className="text-2xl" />
                ) : (
                  <span className="text-xl font-bold">{setNumber}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Set Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Repeticiones realizadas
            {targetReps && (
              <span className="text-slate-500 ml-2">(objetivo: {targetReps})</span>
            )}
          </label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="input w-full text-center text-2xl font-bold"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Peso usado (kg) <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            type="number"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input w-full text-center text-2xl font-bold"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={!reps}
        className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Marcar Serie {currentSet} Completada
      </button>

      {/* Help Text */}
      <p className="text-xs text-slate-500 text-center mt-3">
        Ingresa las repeticiones realizadas y presiona el botón para continuar
      </p>
    </div>
  );
}
