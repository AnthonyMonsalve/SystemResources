interface ProgressBarProps {
  currentExercise: number;
  totalExercises: number;
  currentSet: number;
  totalSets: number;
}

export function ProgressBar({
  currentExercise,
  totalExercises,
  currentSet,
  totalSets,
}: ProgressBarProps) {
  const overallProgress = totalExercises > 0
    ? Math.round(((currentExercise + 1) / totalExercises) * 100)
    : 0;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Progress Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              Ejercicio {currentExercise + 1}/{totalExercises}
            </span>
            <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold">
              Serie {currentSet}/{totalSets}
            </span>
          </div>
          <span className="text-sm font-semibold text-slate-600">
            {overallProgress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
