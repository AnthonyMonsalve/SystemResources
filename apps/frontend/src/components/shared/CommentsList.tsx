import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, apiFetch } from "../../lib/api";
import type { Comment, CommentsResponse } from "../../types/comments";
import { CommentItem } from "./CommentItem";

type CommentsListProps = {
  postId: string;
  currentUserId?: string;
  postAuthorId?: string;
  isAdmin?: boolean;
  onCommentDeleted?: () => void;
};

export function CommentsList({
  postId,
  currentUserId,
  postAuthorId,
  isAdmin,
  onCommentDeleted,
}: CommentsListProps) {
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !postId) return;
    void fetchComments();
  }, [token, postId, page]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<CommentsResponse>(
        `/comments?postId=${postId}&page=${page}&limit=${limit}`,
        { token }
      );

      setComments(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los comentarios"));
    } finally {
      setLoading(false);
    }
  };

  const handleCommentDeleted = () => {
    void fetchComments();
    onCommentDeleted?.();
  };

  const handleCommentUpdated = (updated: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-800">
        Comentarios ({total})
      </h3>

      {loading && <p className="text-sm text-slate-500">Cargando comentarios...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-slate-500">
          No hay comentarios aún. ¡Sé el primero en comentar!
        </p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            postAuthorId={postAuthorId}
            isAdmin={isAdmin}
            onDeleted={handleCommentDeleted}
            onUpdated={handleCommentUpdated}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>

          <span className="text-sm text-slate-600">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
