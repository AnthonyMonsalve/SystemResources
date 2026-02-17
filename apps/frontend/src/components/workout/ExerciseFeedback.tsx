import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faChevronDown, faChevronUp, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import type { CommentType } from '../../types/workouts';

interface ExerciseFeedbackProps {
  routineExerciseId: string;
  sessionId: string;
  exerciseName: string;
  onSubmit: (content: string, type: CommentType) => Promise<void>;
}

export function ExerciseFeedback({
  routineExerciseId,
  sessionId,
  exerciseName,
  onSubmit,
}: ExerciseFeedbackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<CommentType>('note');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, type);
      setContent('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faComment} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-slate-900">
              Dejar Comentario
            </h3>
            <p className="text-xs text-slate-600">
              ¿Tienes dudas sobre este ejercicio?
            </p>
          </div>
        </div>
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="text-slate-400"
        />
      </button>

      {/* Expandable Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-4 pt-0 border-t border-slate-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sobre: {exerciseName}
            </label>
          </div>

          {/* Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de comentario
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('question')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  type === 'question'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pregunta
              </button>
              <button
                type="button"
                onClick={() => setType('issue')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  type === 'issue'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Problema
              </button>
              <button
                type="button"
                onClick={() => setType('note')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  type === 'note'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Nota
              </button>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tu comentario
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input w-full resize-none"
              rows={4}
              placeholder={
                type === 'question'
                  ? '¿Cómo debo hacer este ejercicio correctamente?'
                  : type === 'issue'
                  ? 'Describo el problema que tuve...'
                  : 'Mis notas sobre este ejercicio...'
              }
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            {isSubmitting ? 'Enviando...' : 'Enviar Comentario'}
          </button>

          <p className="text-xs text-slate-500 text-center mt-2">
            Tu entrenador recibirá este comentario y te responderá pronto
          </p>
        </form>
      )}
    </div>
  );
}
