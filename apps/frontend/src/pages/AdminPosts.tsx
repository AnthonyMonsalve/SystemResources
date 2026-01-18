import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch, apiUpload } from "../lib/api";
import { htmlToText, truncateText } from "../lib/richText";
import { ConfirmModal } from "../shared/ConfirmModal";
import { Modal } from "../shared/Modal";
import { RefreshButton } from "../shared/RefreshButton";
import { WysiwygEditor } from "../shared/WysiwygEditor";
import type {
  AdminGroup,
  AdminPost,
  AdminPostVisibility,
  AdminUser,
} from "../types/admin";

type ActionState = {
  busy?: boolean;
  error?: string | null;
};

type ConfirmState = { type: "delete"; post: AdminPost };

type PostListResponse = {
  items: AdminPost[];
  total: number;
  page: number;
  limit: number;
};

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

type MediaFormState = {
  title: string;
  description: string;
  category: string;
  tags: string;
  file: File | null;
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

const emptyMediaForm: MediaFormState = {
  title: "",
  description: "",
  category: "",
  tags: "",
  file: null,
};

export function AdminPostsPage() {
  const { token, user, initializing } = useAuth();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<Record<string, ActionState>>(
    {}
  );
  const [modalPost, setModalPost] = useState<AdminPost | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [formState, setFormState] = useState<PostFormState>(emptyForm);
  const [modalError, setModalError] = useState<string | null>(null);
  const [mediaPost, setMediaPost] = useState<AdminPost | null>(null);
  const [mediaForm, setMediaForm] = useState<MediaFormState>(emptyMediaForm);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const isAdmin = user?.role === "admin";

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = [...posts].sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
    );
    if (!term) return list;
    return list.filter((post) => {
      const haystack = [
        post.title,
        post.description ?? "",
        post.type ?? "",
        post.category ?? "",
        post.ownerUser?.name ?? "",
        post.ownerUser?.email ?? "",
        post.group?.name ?? "",
        post.tags?.join(" ") ?? "",
        post.visibility,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, searchTerm]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    void fetchData();
  }, [token, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsData, groupsData, usersData] = await Promise.all([
        apiFetch<PostListResponse>("/posts?limit=100", { token }),
        apiFetch<AdminGroup[]>("/groups", { token }),
        apiFetch<AdminUser[]>("/admin/users", { token }),
      ]);
      setPosts(postsData.items);
      setTotalCount(postsData.total);
      setGroups(groupsData);
      setUsers(usersData);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los posts."));
    } finally {
      setLoading(false);
    }
  };

  const setBusy = (key: string, busy: boolean, errorMessage?: string | null) => {
    setActionState((prev) => ({
      ...prev,
      [key]: {
        busy,
        error: errorMessage !== undefined ? errorMessage : prev[key]?.error ?? null,
      },
    }));
  };

  const openEditModal = (post: AdminPost) => {
    setModalPost(post);
    setFormState({
      title: post.title ?? "",
      description: post.description ?? "",
      type: post.type ?? "",
      category: post.category ?? "",
      tags: post.tags?.join(", ") ?? "",
      visibility: post.visibility ?? "PUBLIC",
      ownerUserId: post.ownerUserId ?? "",
      groupId: post.groupId ?? "",
    });
    setModalError(null);
  };

  const closeModal = () => {
    setModalPost(null);
    setFormState(emptyForm);
    setModalError(null);
  };

  const openMediaModal = (post: AdminPost) => {
    setMediaPost(post);
    setMediaForm(emptyMediaForm);
    setMediaError(null);
  };

  const closeMediaModal = () => {
    setMediaPost(null);
    setMediaForm(emptyMediaForm);
    setMediaError(null);
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

  const updatePost = async (post: AdminPost) => {
    const validation = validateForm();
    if (validation) {
      setModalError(validation);
      return;
    }
    setModalError(null);
    setBusy(post.id, true);
    try {
      const updated = await apiFetch<AdminPost>(`/posts/${post.id}`, {
        method: "PATCH",
        body: buildPayload(),
        token,
      });
      setPosts((prev) => prev.map((item) => (item.id === post.id ? updated : item)));
      closeModal();
    } catch (err) {
      const message = resolveErrorMessage(err, "No se pudo actualizar el post.");
      setModalError(message);
      setBusy(post.id, false, message);
      return;
    }
    setBusy(post.id, false, null);
  };

  const deletePost = async (post: AdminPost) => {
    setBusy(post.id, true);
    try {
      await apiFetch<void>(`/posts/${post.id}`, { method: "DELETE", token });
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setConfirmState(null);
    } catch (err) {
      const message = resolveErrorMessage(err, "No se pudo eliminar el post.");
      setBusy(post.id, false, message);
      return;
    }
    setBusy(post.id, false, null);
  };

  const uploadMedia = async () => {
    if (!mediaPost) return;
    if (!mediaForm.file) {
      setMediaError("Selecciona un archivo para subir.");
      return;
    }
    if (mediaForm.title.trim().length < 3) {
      setMediaError("El titulo debe tener al menos 3 caracteres.");
      return;
    }
    setMediaError(null);
    const key = `media:${mediaPost.id}`;
    setBusy(key, true);
    try {
      const data = new FormData();
      data.append("file", mediaForm.file);
      data.append("title", mediaForm.title.trim());
      data.append("postId", mediaPost.id);
      if (mediaForm.description.trim()) {
        data.append("description", mediaForm.description.trim());
      }
      if (mediaForm.category.trim()) {
        data.append("category", mediaForm.category.trim());
      }
      const tags = mediaForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      tags.forEach((tag) => data.append("tags", tag));

      await apiUpload("/media/upload", data, { token });
      closeMediaModal();
    } catch (err) {
      const message = resolveErrorMessage(err, "No se pudo subir la media.");
      setMediaError(message);
      setBusy(key, false, message);
      return;
    }
    setBusy(key, false, null);
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
          <h1 className="text-2xl font-semibold text-slate-900">
            Posts publicados
          </h1>
          <p className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-900">{totalCount}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton
            onClick={() => void fetchData()}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm disabled:opacity-60"
            disabled={loading}
            ariaLabel="Actualizar listado"
            title="Actualizar listado"
          />
          <Link
            to="/admin/posts/nuevo"
            className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2.5 transition shadow-sm"
          >
            Nuevo post
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="w-full md:max-w-md">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Buscar post
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="Titulo, categoria, tags"
          />
        </div>
        {searchTerm.trim() ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
          >
            Limpiar busqueda
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && filteredPosts.length === 0 ? (
        <p className="text-sm text-slate-500">No hay posts registrados todavia.</p>
      ) : null}

      <div className="grid gap-4">
        {filteredPosts.map((post) => {
          const action = actionState[post.id];
          const ownerLabel = post.ownerUser
            ? post.ownerUser.name || post.ownerUser.email
            : post.ownerUserId || "N/A";
          const groupLabel = post.group ? post.group.name : post.groupId || "N/A";
          const descriptionPreview = post.description
            ? truncateText(htmlToText(post.description), 160)
            : null;
          return (
            <div
              key={post.id}
              className="p-4 rounded-2xl border border-slate-200 glass-surface space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Post</p>
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-lg font-semibold text-slate-900 hover:text-primary transition"
                  >
                    {post.title}
                  </Link>
                  {descriptionPreview ? (
                    <p className="text-sm text-slate-600">{descriptionPreview}</p>
                  ) : (
                    <p className="text-sm text-slate-400">Sin descripcion</p>
                  )}
                </div>
                <div className="text-sm text-slate-600 md:text-right">
                  <p>
                    Visibilidad:{" "}
                    <span className="font-semibold text-slate-900">
                      {post.visibility}
                    </span>
                  </p>
                  <p>
                    Categoria:{" "}
                    <span className="font-semibold text-slate-900">
                      {post.category || "N/A"}
                    </span>
                  </p>
                  <p>
                    Tipo:{" "}
                    <span className="font-semibold text-slate-900">
                      {post.type || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full border border-slate-200 px-2 py-1">
                  Owner: {ownerLabel}
                </span>
                <span className="rounded-full border border-slate-200 px-2 py-1">
                  Grupo: {groupLabel}
                </span>
                <span className="rounded-full border border-slate-200 px-2 py-1">
                  Tags: {post.tags?.length ? post.tags.join(", ") : "N/A"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(post)}
                  disabled={action?.busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  <FontAwesomeIcon icon="pen" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => openMediaModal(post)}
                  disabled={action?.busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  Subir media
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmState({ type: "delete", post })}
                  disabled={action?.busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  <FontAwesomeIcon icon="trash" />
                  Eliminar
                </button>
              </div>

              {action?.error ? (
                <p className="text-sm text-red-600">{action.error}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalPost !== null}
        title="Editar post"
        onClose={closeModal}
        footer={
          modalPost ? (
            <>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => modalPost && void updatePost(modalPost)}
                disabled={modalPost ? actionState[modalPost.id]?.busy : false}
                className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
              >
                Guardar cambios
              </button>
            </>
          ) : null
        }
      >
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
        {modalError ? <p className="text-sm text-red-600">{modalError}</p> : null}
      </Modal>

      <ConfirmModal
        isOpen={confirmState !== null}
        title="Eliminar post"
        description={
          confirmState ? (
            <>
              Esta accion eliminara el post{" "}
              <span className="font-semibold text-slate-900">
                {confirmState.post.title}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        confirmTone="danger"
        busy={confirmState ? actionState[confirmState.post.id]?.busy : false}
        onConfirm={() => {
          if (confirmState) {
            void deletePost(confirmState.post);
          }
        }}
        onClose={() => setConfirmState(null)}
      />

      <Modal
        isOpen={mediaPost !== null}
        title="Subir media"
        onClose={closeMediaModal}
        footer={
          mediaPost ? (
            <>
              <button
                type="button"
                onClick={closeMediaModal}
                className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void uploadMedia()}
                disabled={actionState[`media:${mediaPost.id}`]?.busy}
                className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
              >
                Subir
              </button>
            </>
          ) : null
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Archivo
            </label>
            <input
              type="file"
              onChange={(event) =>
                setMediaForm((prev) => ({
                  ...prev,
                  file: event.target.files?.[0] ?? null,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Titulo
            </label>
            <input
              type="text"
              value={mediaForm.title}
              onChange={(event) =>
                setMediaForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="Ej. Portada"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Descripcion
            </label>
            <textarea
              value={mediaForm.description}
              onChange={(event) =>
                setMediaForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
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
                value={mediaForm.category}
                onChange={(event) =>
                  setMediaForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
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
                value={mediaForm.tags}
                onChange={(event) =>
                  setMediaForm((prev) => ({ ...prev, tags: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                placeholder="tag1, tag2"
              />
            </div>
          </div>
        </div>
        {mediaError ? <p className="text-sm text-red-600">{mediaError}</p> : null}
      </Modal>
    </div>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
