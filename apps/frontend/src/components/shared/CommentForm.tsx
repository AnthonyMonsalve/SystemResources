import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, apiFetch } from "../../lib/api";
import type { Comment } from "../../types/comments";

type CommentFormProps = {
  postId: string;
  onCommentCreated?: (comment: Comment) => void;
};

export function CommentForm({ postId, onCommentCreated }: CommentFormProps) {
  const { token } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("El comentario no puede estar vacío");
      return;
    }

    if (content.length > 2000) {
      setError("El comentario no puede exceder 2000 caracteres");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newComment = await apiFetch<Comment>("/comments", {
        method: "POST",
        body: { content, postId },
        token,
      });

      setContent("");
      onCommentCreated?.(newComment);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudo crear el comentario"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        disabled={loading}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {content.length}/2000 caracteres
        </p>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {loading ? "Enviando..." : "Comentar"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
