import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch, apiUpload } from "../lib/api";
import { WysiwygEditor } from "../shared/WysiwygEditor";
import type {
  AdminGroup,
  AdminPost,
  AdminPostVisibility,
  AdminUser,
} from "../types/admin";

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
  status: "idle",
  error: null,
});

export function AdminPostCreatePage() {
  const { token, user, initializing } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<PostFormState>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdPost, setCreatedPost] = useState<AdminPost | null>(null);
  const [mediaForms, setMediaForms] = useState<MediaFormState[]>([
    createMediaForm(0),
  ]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaCounter, setMediaCounter] = useState(1);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!token || !isAdmin) return;
    void fetchData();
  }, [token, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsData, usersData] = await Promise.all([
        apiFetch<AdminGroup[]>("/groups", { token }),
        apiFetch<AdminUser[]>("/admin/users", { token }),
      ]);
      setGroups(groupsData);
      setUsers(usersData);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los datos."));
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

  const removeMediaForm = (id: string) => {
    setMediaForms((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const updateMediaForm = (id: string, patch: Partial<MediaFormState>) => {
    setMediaForms((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...patch, status: "idle", error: null }
          : item
      )
    );
  };

  const uploadMedia = async (post: AdminPost) => {
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
        data.append("postId", post.id);
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

        await apiUpload("/media/upload", data, { token });

        setMediaForms((prev) =>
          prev.map((current) =>
            current.id === item.id
              ? { ...current, status: "success", error: null }
              : current
          )
        );
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
    if (createdPost) {
      setLoading(true);
      setSubmitError(null);
      setMediaError(null);
      try {
        await uploadMedia(createdPost);
        navigate("/admin/posts");
      } catch (err) {
        if (err instanceof ApiError) {
          setMediaError(resolveErrorMessage(err, "No se pudo subir la media."));
        } else if (err instanceof Error && err.message === "media-upload-failed") {
          setMediaError("Algunos archivos no se pudieron subir.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const validation = validateForm();
    if (validation) {
      setSubmitError(validation);
      return;
    }
    setSubmitError(null);
    setMediaError(null);
    setLoading(true);
    try {
      const created = await apiFetch<AdminPost>("/posts", {
        method: "POST",
        body: buildPayload(),
        token,
      });
      setCreatedPost(created);
      await uploadMedia(created);
      navigate("/admin/posts");
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(resolveErrorMessage(err, "No se pudo crear el post."));
      } else if (err instanceof Error && err.message === "media-upload-failed") {
        setMediaError("Algunos archivos no se pudieron subir.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormState(emptyForm);
    setCreatedPost(null);
    setSubmitError(null);
    setMediaForms([createMediaForm(0)]);
    setMediaError(null);
    setMediaCounter(1);
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Administracion</p>
          <h1 className="text-2xl font-semibold text-slate-900">Nuevo post</h1>
          <p className="text-sm text-slate-500">
            Crea una publicacion con formato enriquecido.
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
            {createdPost ? "Reintentar envio" : "Crear post"}
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
            disabled={!!createdPost}
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
            readOnly={!!createdPost}
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
              disabled={!!createdPost}
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
              disabled={!!createdPost}
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
            disabled={!!createdPost}
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
            disabled={!!createdPost}
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
              disabled={!!createdPost}
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
              disabled={!!createdPost}
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
            {createdPost ? (
              <>
                <p className="text-lg font-semibold text-slate-900">
                  {createdPost.title}
                </p>
                <p className="text-xs text-slate-500">{createdPost.id}</p>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Puedes agregar archivos aqui; se subiran despues de crear el post.
              </p>
            )}
          </div>
          {createdPost ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
            >
              Crear otro post
            </button>
          ) : null}
        </div>
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
