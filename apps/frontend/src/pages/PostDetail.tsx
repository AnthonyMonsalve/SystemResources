import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch } from "../lib/api";
import { sanitizeHtml } from "../lib/richText";
import type { Post, PostMedia, PostVisibility } from "../types/posts";

export function PostDetailPage() {
  const { token, user, initializing } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    void fetchPost(id);
  }, [token, id]);

  const fetchPost = async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Post>(`/posts/${postId}`, { token });
      setPost(data);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudo cargar el post."));
    } finally {
      setLoading(false);
    }
  };

  if (!token && !initializing) {
    return <Navigate to="/login" replace />;
  }
  if (initializing || !user) {
    return <p className="text-sm text-slate-500">Cargando sesion...</p>;
  }

  if (!id) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary mb-1">Post</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {post?.title ?? "Detalle del post"}
        </h1>
        {post?.description ? (
          <div
            className="text-sm text-slate-600 mt-2 leading-relaxed [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.description) }}
          />
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando contenido...</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {post ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 px-2 py-1">
              Visibilidad: {resolveVisibilityLabel(post.visibility)}
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-1">
              Tipo: {post.type || "N/A"}
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-1">
              Categoria: {post.category || "N/A"}
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-1">
              Tags: {post.tags?.length ? post.tags.join(", ") : "N/A"}
            </span>
          </div>

          {post.visibility === "USER" ? (
            <p className="text-xs text-slate-600">
              Destino:{" "}
              {post.ownerUser?.name ||
                post.ownerUser?.email ||
                post.ownerUserId ||
                "N/A"}
            </p>
          ) : null}
          {post.visibility === "GROUP" ? (
            <p className="text-xs text-slate-600">
              Grupo: {post.group?.name || post.groupId || "N/A"}
            </p>
          ) : null}

          <p className="text-xs text-slate-500">
            Publicado: {formatDate(post.createdAt)}
          </p>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-800">Multimedia</h2>
            {post.mediaFiles?.length ? (
              <div className="grid gap-3">
                {post.mediaFiles.map((media) => (
                  <MediaItem key={media.id} media={media} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No hay archivos adjuntos.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MediaItem({ media }: { media: PostMedia }) {
  const url = resolveMediaUrl(media.url);
  const mime = media.mimeType ?? "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-900">{media.title}</p>
        {media.description ? (
          <p className="text-xs text-slate-600">{media.description}</p>
        ) : null}
      </div>

      {mime.startsWith("image/") ? (
        <img
          src={url}
          alt={media.title}
          className="w-full rounded-lg border border-slate-200 object-cover"
        />
      ) : mime.startsWith("video/") ? (
        <video
          controls
          src={url}
          className="w-full rounded-lg border border-slate-200"
        />
      ) : mime === "application/pdf" ? (
        <iframe
          src={url}
          title={media.title}
          className="w-full h-96 rounded-lg border border-slate-200"
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary font-semibold underline"
        >
          Abrir archivo
        </a>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        {media.category ? (
          <span className="rounded-full border border-slate-200 px-2 py-1">
            Categoria: {media.category}
          </span>
        ) : null}
        {media.tags?.length ? (
          <span className="rounded-full border border-slate-200 px-2 py-1">
            Tags: {media.tags.join(", ")}
          </span>
        ) : null}
        {media.size ? (
          <span className="rounded-full border border-slate-200 px-2 py-1">
            Tamano: {formatBytes(media.size)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function resolveVisibilityLabel(visibility: PostVisibility): string {
  switch (visibility) {
    case "PUBLIC":
      return "Publico";
    case "USER":
      return "Para ti";
    case "GROUP":
      return "Grupo";
    default:
      return "Post";
  }
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function resolveMediaUrl(raw: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const normalized = raw.replace(/\\/g, "/");
  const uploadsIndex = normalized.lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return `${base}${normalized.slice(uploadsIndex)}`;
  }
  if (normalized.startsWith("/uploads/")) {
    return `${base}${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `${base}/${normalized}`;
  }
  const fileName = normalized.split("/").pop() ?? normalized;
  return `${base}/uploads/${fileName}`;
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
