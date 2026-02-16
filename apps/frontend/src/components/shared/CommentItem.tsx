import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ApiError, apiFetch } from "../../lib/api";
import { sanitizeHtml } from "../../lib/richText";
import { ConfirmModal } from "../../shared/ConfirmModal";
import type { Comment } from "../../types/comments";
import { CommentEditForm } from "./CommentEditForm";

type CommentItemProps = {
  comment: Comment;
  currentUserId?: string;
  postAuthorId?: string;
  isAdmin?: boolean;
  onDeleted?: () => void;
  onUpdated?: (updated: Comment) => void;
};

export function CommentItem({
  comment,
  currentUserId,
  postAuthorId,
  isAdmin,
  onDeleted,
  onUpdated,
}: CommentItemProps) {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthor = comment.authorId === currentUserId;
  const isPostAuthor = postAuthorId === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isPostAuthor || isAdmin;

  const isEdited = (comment: Comment): boolean => {
    return new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await apiFetch(`/comments/${comment.id}`, {
        method: "DELETE",
        token,
      });

      setShowDeleteConfirm(false);
      onDeleted?.();
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudo eliminar el comentario"));
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdated = (updated: Comment) => {
    setIsEditing(false);
    onUpdated?.(updated);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">
            {comment.author.name || comment.author.email}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(comment.createdAt)}
            {isEdited(comment) && " (editado)"}
          </p>
        </div>

        {!isEditing && (canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <CommentEditForm
          comment={comment}
          onCancel={() => setIsEditing(false)}
          onSaved={handleUpdated}
        />
      ) : (
        <div
          className="text-sm text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar comentario"
        message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
