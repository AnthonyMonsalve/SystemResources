import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faImage,
  faXmark,
  faCheckCircle,
  faClock,
  faDumbbell,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { formatTime } from '../../types/workouts';
import type { WorkoutSession } from '../../types/workouts';
import { compressImages, formatFileSize } from '../../lib/imageCompression';

interface WorkoutSummaryProps {
  session: WorkoutSession;
  onComplete: (notes?: string, photos?: { blob: Blob; filename: string }[]) => Promise<void>;
  onSkip: () => void;
}

export function WorkoutSummary({ session, onComplete, onSkip }: WorkoutSummaryProps) {
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<{ blob: Blob; filename: string; originalSize: number; compressedSize: number }[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);

    try {
      // Calculate how many more photos we can add
      const remainingSlots = 5 - photos.length;
      const filesToCompress = files.slice(0, remainingSlots);

      // Get original sizes
      const originalSizes = filesToCompress.map(f => f.size);

      // Compress images (max 1200px, quality 0.75 for lighter files)
      const compressed = await compressImages(filesToCompress, 1200, 0.75);

      // Create photo objects with size info
      const newPhotos = compressed.map((item, index) => ({
        blob: item.blob,
        filename: item.filename,
        originalSize: originalSizes[index],
        compressedSize: item.blob.size,
      }));

      // Update photos state
      const allPhotos = [...photos, ...newPhotos];
      setPhotos(allPhotos);

      // Create previews
      const newPreviews = allPhotos.map((photo) => URL.createObjectURL(photo.blob));
      setPhotoPreviews(newPreviews);

      // Clear input
      e.target.value = '';
    } catch (error) {
      console.error('Error compressing images:', error);
      alert('Error al comprimir las imágenes. Por favor, intenta con otras fotos.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreviews[index]);

    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(notes || undefined, photos.length > 0 ? photos : undefined);
    } catch (error) {
      console.error('Error submitting summary:', error);
      setIsSubmitting(false);
    }
  };

  const completedSets = session.sets?.filter((s) => s.completed).length || 0;
  const totalSets = session.sets?.length || 0;
  const completedExercises = new Set(
    session.sets?.filter((s) => s.completed).map((s) => s.routineExerciseId)
  ).size;
  const totalExercises = session.routine?.exercises?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
            <FontAwesomeIcon icon={faTrophy} className="text-6xl text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            ¡Entrenamiento Completado!
          </h2>
          <p className="text-xl text-white/90">
            {session.routine?.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-200">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-blue-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatTime(session.totalDurationSeconds || 0)}
            </p>
            <p className="text-sm text-slate-600">Duración</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {completedExercises}/{totalExercises}
            </p>
            <p className="text-sm text-slate-600">Ejercicios</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faDumbbell} className="text-purple-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {completedSets}/{totalSets}
            </p>
            <p className="text-sm text-slate-600">Series</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ¿Cómo te sentiste? (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full resize-none"
              rows={4}
              placeholder="Comparte cómo te fue en este entrenamiento, logros alcanzados, sensaciones..."
              disabled={isSubmitting}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fotos del entrenamiento (Opcional - máx. 5)
            </label>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        disabled={isSubmitting || isCompressing}
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Compression Info */}
                <div className="text-xs text-green-600 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>
                    Imágenes comprimidas:{' '}
                    {formatFileSize(photos.reduce((sum, p) => sum + p.originalSize, 0))} →{' '}
                    {formatFileSize(photos.reduce((sum, p) => sum + p.compressedSize, 0))}
                    {' '}({Math.round((1 - photos.reduce((sum, p) => sum + p.compressedSize, 0) / photos.reduce((sum, p) => sum + p.originalSize, 0)) * 100)}% reducción)
                  </span>
                </div>
              </>
            )}

            {/* Upload Button */}
            {photos.length < 5 && (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                  disabled={isSubmitting || isCompressing}
                />
                <div className={`border-2 border-dashed border-slate-300 rounded-xl p-8 text-center transition ${
                  isCompressing
                    ? 'bg-slate-100 cursor-wait'
                    : 'cursor-pointer hover:border-primary-500 hover:bg-slate-50'
                }`}>
                  <FontAwesomeIcon
                    icon={isCompressing ? faSpinner : faImage}
                    className={`text-4xl text-slate-400 mb-2 ${isCompressing ? 'animate-spin' : ''}`}
                  />
                  <p className="text-sm font-medium text-slate-700">
                    {isCompressing ? 'Comprimiendo imágenes...' : 'Haz clic para agregar fotos'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {photos.length}/5 fotos {!isCompressing && '· Se comprimirán automáticamente'}
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="btn-secondary flex-1"
              disabled={isSubmitting || isCompressing}
            >
              Omitir
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary flex-1"
              disabled={isSubmitting || isCompressing}
            >
              {isSubmitting ? 'Enviando...' : isCompressing ? 'Comprimiendo...' : 'Enviar Resumen'}
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Tu entrenador verá este resumen y podrá darte feedback
          </p>
        </div>
      </div>
    </div>
  );
}
