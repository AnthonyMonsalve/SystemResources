import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch } from "../lib/api";
import { ConfirmModal } from "../shared/ConfirmModal";
import { Modal } from "../shared/Modal";
import { RefreshButton } from "../shared/RefreshButton";
import { UserGroupsModal } from "../shared/UserGroupsModal";
import type { AdminUser } from "../types/admin";

type ActionState = {
  busy?: boolean;
  error?: string | null;
};

type ModalState =
  | { type: "password"; user: AdminUser }
  | { type: "block"; user: AdminUser };


export function AdminUsersPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<Record<string, ActionState>>(
    {}
  );
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalValue, setModalValue] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupModalUser, setGroupModalUser] = useState<AdminUser | null>(null);

  const isAdmin = user?.role === "admin";

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = [...users].sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
    );
    if (!term) return list;
    return list.filter((item) => {
      const name = item.name?.toLowerCase() ?? "";
      const email = item.email.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, searchTerm]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    void fetchUsers();
  }, [token, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AdminUser[]>("/admin/users", { token });
      setUsers(data);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los usuarios."));
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (userId: string) => {
    const password = modalValue.trim();
    if (!password || password.length < 6) {
      setModalError("La contraseAA?a debe tener al menos 6 caracteres.");
      return;
    }
    setModalError(null);
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: true, error: null },
    }));
    try {
      const updated = await apiFetch<AdminUser>(
        `/admin/users/${userId}/password`,
        {
          method: "PATCH",
          body: { password },
          token,
        }
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setModal(null);
    } catch (err) {
      const message = resolveErrorMessage(
        err,
        "No se pudo actualizar la contraseAA?a."
      );
      setModalError(message);
      setActionState((prev) => ({
        ...prev,
        [userId]: { busy: false, error: message },
      }));
      return;
    }
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: false, error: null },
    }));
  };

  const blockUser = async (userId: string) => {
    if (userId === user?.id) {
      return;
    }
    const minutesRaw = modalValue.trim() || "60";
    const minutes = Number(minutesRaw);
    if (!Number.isFinite(minutes) || minutes < 1) {
      setModalError("Ingresa minutos vAA?lidos para el bloqueo.");
      return;
    }
    setModalError(null);
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: true, error: null },
    }));
    try {
      const updated = await apiFetch<AdminUser>(
        `/admin/users/${userId}/block`,
        {
          method: "PATCH",
          body: { durationMinutes: minutes },
          token,
        }
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setModal(null);
    } catch (err) {
      const message = resolveErrorMessage(
        err,
        "No se pudo bloquear al usuario."
      );
      setModalError(message);
      setActionState((prev) => ({
        ...prev,
        [userId]: { busy: false, error: message },
      }));
      return;
    }
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: false, error: null },
    }));
  };

  const unblockUser = async (userId: string) => {
    if (userId === user?.id) {
      return;
    }
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: true, error: null },
    }));
    try {
      const updated = await apiFetch<AdminUser>(
        `/admin/users/${userId}/block`,
        {
          method: "PATCH",
          body: { blockedUntil: new Date().toISOString() },
          token,
        }
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setActionState((prev) => ({
        ...prev,
        [userId]: {
          busy: false,
          error: resolveErrorMessage(err, "No se pudo desbloquear al usuario."),
        },
      }));
      return;
    }
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: false, error: null },
    }));
  };

  const openPasswordModal = (selected: AdminUser) => {
    setModal({ type: "password", user: selected });
    setModalValue("");
    setModalError(null);
  };

  const openBlockModal = (selected: AdminUser) => {
    setModal({ type: "block", user: selected });
    setModalValue("60");
    setModalError(null);
  };

  const closeModal = () => {
    setModal(null);
    setModalValue("");
    setModalError(null);
  };

  const deleteUser = async (userId: string) => {
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: true, error: null },
    }));
    try {
      await apiFetch<void>(`/admin/users/${userId}`, {
        method: "DELETE",
        token,
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmUser(null);
    } catch (err) {
      setActionState((prev) => ({
        ...prev,
        [userId]: {
          busy: false,
          error: resolveErrorMessage(err, "No se pudo eliminar el usuario."),
        },
      }));
      return;
    }
    setActionState((prev) => ({
      ...prev,
      [userId]: { busy: false, error: null },
    }));
  };

  const openDeleteModal = (selected: AdminUser) => {
    if (selected.id === user?.id) {
      return;
    }
    setConfirmUser(selected);
  };

  const closeDeleteModal = () => {
    setConfirmUser(null);
  };

  const openGroupModal = (selected: AdminUser) => {
    setGroupModalUser(selected);
  };

  const closeGroupModal = () => {
    setGroupModalUser(null);
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary mb-1">
            Administración
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Usuarios registrados
          </h1>
        </div>
        <RefreshButton
          onClick={() => void fetchUsers()}
          className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm disabled:opacity-60"
          disabled={loading}
          ariaLabel="Actualizar listado"
          title="Actualizar listado"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="w-full md:max-w-md">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Buscar usuario
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="Nombre o correo"
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

      <div className="grid gap-4">
        {filteredUsers.map((item) => {
          const action = actionState[item.id];
          const isSelf = item.id === user?.id;
          const blockedLabel = item.isBlocked
            ? `Bloqueado hasta ${formatDate(item.blockedUntil)}`
            : "Activo";
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 glass-surface space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Usuario</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {item.name || item.email}
                  </p>
                  <p className="text-sm text-slate-600">{item.email}</p>
                </div>
                <div className="text-sm text-slate-600 md:text-right">
                  <p>
                    Rol:{" "}
                    <span className="font-semibold text-slate-900">
                      {item.role.toUpperCase()}
                    </span>
                  </p>
                  <p
                    className={item.isBlocked ? "text-red-600 font-medium" : ""}
                  >
                    {blockedLabel}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openPasswordModal(item)}
                  disabled={action?.busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  <FontAwesomeIcon icon="key" />
                  Restablecer contraseña
                </button>
                <button
                  type="button"
                  onClick={() => openGroupModal(item)}
                  disabled={action?.busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  <FontAwesomeIcon icon="layer-group" />
                  Ver grupos
                </button>
                {!isSelf ? (
                  <>
                    {item.isBlocked ? (
                      <button
                        type="button"
                        onClick={() => void unblockUser(item.id)}
                        disabled={action?.busy}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                      >
                        <FontAwesomeIcon icon="ban" />
                        Desbloquear
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openBlockModal(item)}
                        disabled={action?.busy}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                      >
                        <FontAwesomeIcon icon="ban" />
                        Bloquear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openDeleteModal(item)}
                      disabled={action?.busy}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                    >
                      <FontAwesomeIcon icon="trash" />
                      Eliminar
                    </button>
                  </>
                ) : null}
              </div>

              {action?.error ? (
                <p className="text-sm text-red-600">{action.error}</p>
              ) : null}
              {isSelf ? (
                <p className="text-xs text-slate-500">
                  No puedes bloquear ni eliminar tu propia cuenta.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modal !== null}
        title={
          modal?.type === "password"
            ? "Restablecer contraseña"
            : "Bloquear usuario"
        }
        onClose={closeModal}
        footer={
          modal ? (
            <>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
              >
                Cancelar
              </button>
              {modal.type === "password" ? (
                <button
                  type="button"
                  onClick={() => void updatePassword(modal.user.id)}
                  disabled={
                    actionState[modal.user.id]?.busy || !modalValue.trim()
                  }
                  className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
                >
                  Guardar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void blockUser(modal.user.id)}
                  disabled={actionState[modal.user.id]?.busy}
                  className="inline-flex justify-center rounded-xl bg-amber-500 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
                >
                  Bloquear
                </button>
              )}
            </>
          ) : null
        }
      >
        {modal?.type === "password" ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Usuario:{" "}
              <span className="font-semibold text-slate-900">
                {modal.user.name || modal.user.email}
              </span>
            </p>
            <label className="block text-xs font-semibold text-slate-600">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={modalValue}
              onChange={(event) => setModalValue(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="Min. 6 caracteres"
            />
          </div>
        ) : modal?.type === "block" ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Usuario:{" "}
              <span className="font-semibold text-slate-900">
                {modal.user.name || modal.user.email}
              </span>
            </p>
            <label className="block text-xs font-semibold text-slate-600">
              Bloqueo (minutos)
            </label>
            <input
              type="number"
              min={1}
              value={modalValue}
              onChange={(event) => setModalValue(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            />
            <div className="flex flex-wrap gap-2">
              {[
                { label: "1 dia", minutes: 60 * 24 },
                { label: "1 semana", minutes: 60 * 24 * 7 },
                { label: "15 dias", minutes: 60 * 24 * 15 },
                { label: "1 mes", minutes: 60 * 24 * 30 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setModalValue(String(preset.minutes))}
                  className="px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {modalError ? (
          <p className="text-sm text-red-600">{modalError}</p>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={confirmUser !== null}
        title="Eliminar usuario"
        description={
          confirmUser ? (
            <>
              Esta accion es permanente para{" "}
              <span className="font-semibold text-slate-900">
                {confirmUser.name || confirmUser.email}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        confirmTone="danger"
        busy={confirmUser ? actionState[confirmUser.id]?.busy : false}
        onConfirm={() => {
          if (confirmUser) {
            void deleteUser(confirmUser.id);
          }
        }}
        onClose={closeDeleteModal}
      />

      <UserGroupsModal
        isOpen={groupModalUser !== null}
        user={groupModalUser}
        token={token}
        onClose={closeGroupModal}
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
