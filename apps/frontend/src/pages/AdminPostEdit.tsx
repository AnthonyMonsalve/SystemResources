import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch, apiUpload } from "../lib/api";
import { WysiwygEditor } from "../shared/WysiwygEditor";
import type {
  AdminGroup,
  AdminPost,
  AdminPostVisibility,
  AdminUser,
} from "../types/admin";
import type { PostMedia } from "../types/posts";

type PostFormState = {
  title: string;
  description: string;
  type: string;
  category: string;
  tags: string;
  visibility: AdminPostVisibility;
  ownerUserId: string;
  groupId: string;
};

const emptyForm: PostFormState = {
  title: "",
  description: "",
  type: "",
  category: "",
  tags: "",
  visibility: "PUBLIC",
  ownerUserId: "",
  groupId: "",
};

type MediaStatus = "idle" | "uploading" | "success" | "error";

type MediaFormState = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  file: File | null;
  replaceId?: string | null;
  status?: MediaStatus;
  error?: string | null;
};

const createMediaForm = (index: number): MediaFormState => ({
  id: `media-${index}-${Date.now()}`,
  title: "",
  description: "",
  category: "",
  tags: "",
  file: null,
  replaceId: null,
  status: "idle",
  error: null,
});

export function AdminPostEditPage() {
  const { token, user, initializing } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [post, setPost] = useState<AdminPost | null>(null);
  const [existingMedia, setExistingMedia] = useState<PostMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<PostFormState>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mediaForms, setMediaForms] = useState<MediaFormState[]>([
    createMediaForm(0),
  ]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaCounter, setMediaCounter] = useState(1);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!token || !isAdmin || !id) return;
    void fetchData(id);
  }, [token, isAdmin, id]);

  const fetchData = async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [postData, groupsData, usersData, mediaData] = await Promise.all([
        apiFetch<AdminPost>(`/posts/${postId}`, { token }),
        apiFetch<AdminGroup[]>("/groups", { token }),
        apiFetch<AdminUser[]>("/admin/users", { token }),
        apiFetch<PostMedia[]>(`/posts/${postId}/media`, { token }),
      ]);
      setPost(postData);
      setGroups(groupsData);
      setUsers(usersData);
      setExistingMedia(mediaData);
      setFormState({
        title: postData.title ?? "",
        description: postData.description ?? "",
        type: postData.type ?? "",
        category: postData.category ?? "",
        tags: postData.tags?.join(", ") ?? "",
        visibility: postData.visibility ?? "PUBLIC",
        ownerUserId: postData.ownerUserId ?? "",
        groupId: postData.groupId ?? "",
      });
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudo cargar el post."));
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = (value: AdminPostVisibility) => {
    setFormState((prev) => ({
      ...prev,
      visibility: value,
      ownerUserId: value === "USER" ? prev.ownerUserId : "",
      groupId: value === "GROUP" ? prev.groupId : "",
    }));
  };

  const buildPayload = () => {
    const tags = formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      title: formState.title.trim(),
      description: formState.description.trim() || undefined,
      type: formState.type.trim() || undefined,
      category: formState.category.trim() || undefined,
      tags,
      visibility: formState.visibility,
    };

    if (formState.visibility === "USER") {
      payload.ownerUserId = formState.ownerUserId || undefined;
    }
    if (formState.visibility === "GROUP") {
      payload.groupId = formState.groupId || undefined;
    }
    return payload;
  };

  const validateForm = () => {
    if (formState.title.trim().length < 3) {
      return "El titulo debe tener al menos 3 caracteres.";
    }
    if (formState.visibility === "USER" && !formState.ownerUserId) {
      return "Selecciona un usuario para la visibilidad USER.";
    }
    if (formState.visibility === "GROUP" && !formState.groupId) {
      return "Selecciona un grupo para la visibilidad GROUP.";
    }
    return null;
  };

  const addMediaForm = () => {
    setMediaForms((prev) => [...prev, createMediaForm(mediaCounter)]);
    setMediaCounter((prev) => prev + 1);
  };

  const removeMediaForm = (entryId: string) => {
    setMediaForms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== entryId);
    });
  };

  const updateMediaForm = (entryId: string, patch: Partial<MediaFormState>) => {
    setMediaForms((prev) =>
      prev.map((item) =>
        item.id === entryId
          ? { ...item, ...patch, status: "idle", error: null }
          : item
      )
    );
  };

  const startReplace = (media: PostMedia) => {
    setMediaForms((prev) => [
      ...prev,
      {
        ...createMediaForm(mediaCounter),
        title: media.title ?? "",
        description: media.description ?? "",
        category: media.category ?? "",
        tags: media.tags?.join(", ") ?? "",
        replaceId: media.id,
      },
    ]);
    setMediaCounter((prev) => prev + 1);
  };

  const deleteExistingMedia = async (media: PostMedia) => {
    const confirmed = window.confirm("Eliminar este archivo?");
    if (!confirmed) return;
    try {
      await apiFetch<void>(`/media/${media.id}`, { method: "DELETE", token });
      setExistingMedia((prev) => prev.filter((item) => item.id !== media.id));
    } catch (err) {
      setMediaError(resolveErrorMessage(err, "No se pudo eliminar la media."));
    }
  };

  const uploadMedia = async (targetPost: AdminPost) => {
    let hasError = false;

    for (const item of mediaForms) {
      const hasContent =
        item.file ||
        item.title.trim() ||
        item.description.trim() ||
        item.category.trim() ||
        item.tags.trim();

      if (!hasContent) continue;

      if (!item.file) {
        hasError = true;
        setMediaForms((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? { ...current, status: "error", error: "Selecciona un archivo." }
              : current
          )
        );
        continue;
      }

      if (item.title.trim().length < 3) {
        hasError = true;
        setMediaForms((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? {
                  ...current,
                  status: "error",
                  error: "El titulo debe tener al menos 3 caracteres.",
                }
              : current
          )
        );
        continue;
      }

      setMediaForms((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? { ...current, status: "uploading", error: null }
            : current
        )
      );

      try {
        const data = new FormData();
        data.append("file", item.file);
        data.append("title", item.title.trim());
        data.append("postId", targetPost.id);
        if (item.description.trim()) {
          data.append("description", item.description.trim());
        }
        if (item.category.trim()) {
          data.append("category", item.category.trim());
        }
        const tags = item.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        tags.forEach((tag) => data.append("tags", tag));

        const uploaded = await apiUpload<PostMedia>("/media/upload", data, { token });

        setMediaForms((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? { ...current, status: "success", error: null }
              : current
          )
        );

        setExistingMedia((prev) => [...prev, uploaded]);

        if (item.replaceId) {
          try {
            await apiFetch<void>(`/media/${item.replaceId}`, {
              method: "DELETE",
              token,
            });
            setExistingMedia((prev) =>
              prev.filter((entry) => entry.id !== item.replaceId)
            );
          } catch (removeErr) {
            hasError = true;
            setMediaForms((prev) =>
              prev.map((current) =>
                current.id === item.id
                  ? {
                      ...current,
                      status: "error",
                      error:
                        "Subida OK, pero no se pudo eliminar el archivo anterior.",
                    }
                  : current
              )
            );
          }
        }
      } catch (err) {
        hasError = true;
        const message = resolveErrorMessage(err, "No se pudo subir la media.");
        setMediaForms((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? { ...current, status: "error", error: message }
              : current
          )
        );
      }
    }

    if (hasError) {
      throw new Error("media-upload-failed");
    }
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (validation) {
      setSubmitError(validation);
      return;
    }
    if (!id) return;

    setSubmitError(null);
    setMediaError(null);
    setLoading(true);
    try {
      const updated = await apiFetch<AdminPost>(`/posts/${id}`, {
        method: "PATCH",
        body: buildPayload(),
        token,
      });
      setPost(updated);
      await uploadMedia(updated);
      navigate("/admin/posts");
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(resolveErrorMessage(err, "No se pudo actualizar el post."));
      } else if (err instanceof Error && err.message === "media-upload-failed") {
        setMediaError("Algunos archivos no se pudieron subir.");
      }
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
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }
  if (!id) {
    return <Navigate to="/admin/posts" replace />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Administracion</p>
          <h1 className="text-2xl font-semibold text-slate-900">Editar post</h1>
          <p className="text-sm text-slate-500">
            Actualiza la publicacion y agrega media adicional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/posts"
            className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
          >
            Volver al listado
          </Link>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            Titulo
          </label>
          <input
            type="text"
            value={formState.title}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, title: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="Ej. Nueva campana"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            Descripcion
          </label>
          <WysiwygEditor
            value={formState.description}
            onChange={(value) =>
              setFormState((prev) => ({ ...prev, description: value }))
            }
            placeholder="Resumen del post"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Tipo
            </label>
            <input
              type="text"
              value={formState.type}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, type: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="Ej. anuncio"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Categoria
            </label>
            <input
              type="text"
              value={formState.category}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="Ej. producto"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            Tags (separados por coma)
          </label>
          <input
            type="text"
            value={formState.tags}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, tags: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="tag1, tag2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600">
            Visibilidad
          </label>
          <select
            value={formState.visibility}
            onChange={(event) =>
              handleVisibilityChange(event.target.value as AdminPostVisibility)
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
          >
            <option value="PUBLIC">Publico</option>
            <option value="USER">Usuario</option>
            <option value="GROUP">Grupo</option>
          </select>
        </div>
        {formState.visibility === "USER" ? (
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Usuario destino
            </label>
            <select
              value={formState.ownerUserId}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  ownerUserId: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            >
              <option value="">Selecciona un usuario</option>
              {users.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name ? `${candidate.name} (${candidate.email})` : candidate.email}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {formState.visibility === "GROUP" ? (
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Grupo destino
            </label>
            <select
              value={formState.groupId}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  groupId: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Media del post
            </p>
            {post ? (
              <>
                <p className="text-lg font-semibold text-slate-900">
                  {post.title}
                </p>
                <p className="text-xs text-slate-500">{post.id}</p>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Agrega archivos para subirlos con el post.
              </p>
            )}
          </div>
        </div>
        {existingMedia.length ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Archivos actuales
            </p>
            <div className="grid gap-3">
              {existingMedia.map((media) => (
                <div
                  key={media.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {media.title}
                      </p>
                      {media.description ? (
                        <p className="text-xs text-slate-600">
                          {media.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startReplace(media)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        Reemplazar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteExistingMedia(media)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {media.category ? `Categoria: ${media.category}` : null}
                    {media.tags?.length ? ` · Tags: ${media.tags.join(", ")}` : null}
                  </div>
                  <MediaPreview media={media} />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Para editar un archivo, sube uno nuevo con &ldquo;Reemplazar&rdquo;.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            No hay archivos asociados. Puedes agregar nuevos a continuacion.
          </p>
        )}
        <div className="space-y-4">
          {mediaForms.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  Archivo {index + 1}
                </p>
                {mediaForms.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeMediaForm(item.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Quitar
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    Archivo
                  </label>
                  <input
                    type="file"
                    onChange={(event) =>
                      updateMediaForm(item.id, {
                        file: event.target.files?.[0] ?? null,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    Titulo del archivo
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateMediaForm(item.id, { title: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                    placeholder="Ej. Portada"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Descripcion
                </label>
                <textarea
                  value={item.description}
                  onChange={(event) =>
                    updateMediaForm(item.id, {
                      description: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                  rows={3}
                  placeholder="Descripcion corta"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={item.category}
                    onChange={(event) =>
                      updateMediaForm(item.id, { category: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                    placeholder="Ej. imagen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">
                    Tags (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={item.tags}
                    onChange={(event) =>
                      updateMediaForm(item.id, { tags: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                    placeholder="tag1, tag2"
                  />
                </div>
              </div>
              {item.status === "uploading" ? (
                <p className="text-xs text-slate-500">Subiendo...</p>
              ) : null}
              {item.status === "success" ? (
                <p className="text-xs text-emerald-600">Subida correcta.</p>
              ) : null}
              {item.status === "error" ? (
                <p className="text-xs text-red-600">{item.error}</p>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={addMediaForm}
            className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
          >
            Agregar otro archivo
          </button>
        </div>
        {mediaError ? <p className="text-sm text-red-600">{mediaError}</p> : null}
      </div>
    </div>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function MediaPreview({ media }: { media: PostMedia }) {
  const url = resolveMediaUrl(media.url);
  const mime = media.mimeType ?? "";

  if (mime.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={media.title}
        className="w-full rounded-lg border border-slate-200 object-cover"
      />
    );
  }

  if (mime.startsWith("video/")) {
    return (
      <video
        controls
        src={url}
        className="w-full rounded-lg border border-slate-200"
      />
    );
  }

  if (mime === "application/pdf") {
    return (
      <iframe
        src={url}
        title={media.title}
        className="w-full h-64 rounded-lg border border-slate-200"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-primary font-semibold underline"
    >
      Abrir archivo
    </a>
  );
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
