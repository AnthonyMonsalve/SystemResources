import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiFetch } from "../lib/api";
import { ConfirmModal } from "../shared/ConfirmModal";
import { Modal } from "../shared/Modal";
import { RefreshButton } from "../shared/RefreshButton";
import type { AdminGroup, AdminGroupMember, AdminUser } from "../types/admin";

type ActionState = {
  busy?: boolean;
  error?: string | null;
};

type ModalState =
  | { type: "create" }
  | { type: "edit"; group: AdminGroup }
  | { type: "member"; group: AdminGroup };

type ConfirmState =
  | { type: "delete-group"; group: AdminGroup }
  | { type: "remove-member"; group: AdminGroup; member: AdminGroupMember };

export function AdminGroupsPage() {
  const { token, user, initializing } = useAuth();
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<Record<string, ActionState>>(
    {}
  );
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = user?.role === "admin";

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = [...groups].sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
    );
    if (!term) return list;
    return list.filter((group) => {
      const name = group.name.toLowerCase();
      const description = group.description?.toLowerCase() ?? "";
      return name.includes(term) || description.includes(term);
    });
  }, [groups, searchTerm]);

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
      setError(resolveErrorMessage(err, "No se pudieron cargar los grupos."));
    } finally {
      setLoading(false);
    }
  };

  const getAvailableUsers = (group: AdminGroup) => {
    const memberIds = new Set((group.members ?? []).map((m) => m.userId));
    return users.filter((item) => !memberIds.has(item.id));
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

  const openCreateModal = () => {
    setModal({ type: "create" });
    setModalName("");
    setModalDescription("");
    setMemberSearch("");
    setSelectedUserIds([]);
    setModalError(null);
  };

  const openEditModal = (group: AdminGroup) => {
    setModal({ type: "edit", group });
    setModalName(group.name);
    setModalDescription(group.description ?? "");
    setMemberSearch("");
    setSelectedUserIds([]);
    setModalError(null);
  };

  const openMemberModal = (group: AdminGroup) => {
    setModal({ type: "member", group });
    setModalName("");
    setModalDescription("");
    setMemberSearch("");
    setSelectedUserIds([]);
    setModalError(null);
  };

  const closeModal = () => {
    setModal(null);
    setModalName("");
    setModalDescription("");
    setMemberSearch("");
    setSelectedUserIds([]);
    setModalError(null);
  };

  const createGroup = async () => {
    const name = modalName.trim();
    if (!name) {
      setModalError("Ingresa un nombre de grupo.");
      return;
    }
    setModalError(null);
    setBusy("create", true);
    try {
      const created = await apiFetch<AdminGroup>("/groups", {
        method: "POST",
        body: { name, description: modalDescription.trim() || null },
        token,
      });
      setGroups((prev) => [created, ...prev]);
      closeModal();
    } catch (err) {
      const message = resolveErrorMessage(err, "No se pudo crear el grupo.");
      setModalError(message);
      setBusy("create", false, message);
      return;
    }
      setBusy("create", false, null);
  };

  const updateGroup = async (group: AdminGroup) => {
    const name = modalName.trim();
    if (!name) {
      setModalError("Ingresa un nombre de grupo.");
      return;
    }
    setModalError(null);
    setBusy(group.id, true);
    try {
      const updated = await apiFetch<AdminGroup>(`/groups/${group.id}`, {
        method: "PATCH",
        body: { name, description: modalDescription.trim() || null },
        token,
      });
      setGroups((prev) => prev.map((item) => (item.id === group.id ? updated : item)));
      closeModal();
    } catch (err) {
      const message = resolveErrorMessage(err, "No se pudo actualizar el grupo.");
      setModalError(message);
      setBusy(group.id, false, message);
      return;
    }
    setBusy(group.id, false, null);
  };

  const deleteGroup = async (group: AdminGroup) => {
    setBusy(group.id, true);
    try {
      await apiFetch<void>(`/groups/${group.id}`, { method: "DELETE", token });
      setGroups((prev) => prev.filter((item) => item.id !== group.id));
      setConfirmState(null);
    } catch (err) {
      const message = resolveErrorMessage(err, "No se pudo eliminar el grupo.");
      setBusy(group.id, false, message);
      return;
    }
    setBusy(group.id, false, null);
  };

  const addMembers = async (group: AdminGroup) => {
    if (selectedUserIds.length === 0) {
      setModalError("Selecciona al menos un usuario para agregar.");
      return;
    }
    setModalError(null);
    setBusy(group.id, true);
    try {
      await apiFetch<AdminGroupMember[]>(`/groups/${group.id}/members`, {
        method: "POST",
        body: { userIds: selectedUserIds },
        token,
      });
      await fetchData();
      closeModal();
    } catch (err) {
      const message = resolveErrorMessage(
        err,
        "No se pudo agregar el usuario al grupo."
      );
      setModalError(message);
      setBusy(group.id, false, message);
      return;
    }
    setBusy(group.id, false, null);
  };

  const toggleSelectedUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const removeMember = async (group: AdminGroup, member: AdminGroupMember) => {
    const key = `${group.id}:${member.userId}`;
    setBusy(key, true);
    try {
      await apiFetch<void>(`/groups/${group.id}/members/${member.userId}`, {
        method: "DELETE",
        token,
      });
      await fetchData();
      setConfirmState(null);
    } catch (err) {
      const message = resolveErrorMessage(
        err,
        "No se pudo remover el usuario del grupo."
      );
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
            Grupos de usuarios
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton
            onClick={() => void fetchData()}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm disabled:opacity-60"
            disabled={loading}
            ariaLabel="Actualizar listado"
            title="Actualizar listado"
          />
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2.5 transition shadow-sm"
          >
            Nuevo grupo
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="w-full md:max-w-md">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Buscar grupo
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="Nombre o descripcion"
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
      {!loading && filteredGroups.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay grupos registrados todavia.
        </p>
      ) : null}

      <div className="grid gap-4">
        {filteredGroups.map((group) => {
          const action = actionState[group.id];
          const members = group.members ?? [];
          const availableUsers = getAvailableUsers(group);

          return (
            <div
              key={group.id}
              className="p-4 rounded-2xl border border-slate-200 glass-surface space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">Grupo</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {group.name}
                  </p>
                  {group.description ? (
                    <p className="text-sm text-slate-600">
                      {group.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Sin descripcion
                    </p>
                  )}
                </div>
                <div className="text-sm text-slate-600 md:text-right">
                  <p>
                    Miembros:{" "}
                    <span className="font-semibold text-slate-900">
                      {members.length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(group)}
                  disabled={action?.busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  <FontAwesomeIcon icon="pen" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => openMemberModal(group)}
                  disabled={action?.busy || availableUsers.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white font-medium px-4 py-2 text-sm transition shadow-sm disabled:opacity-60"
                >
                  <FontAwesomeIcon icon="user-plus" />
                  Agregar usuario
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmState({ type: "delete-group", group })}
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

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  Usuarios asignados
                </p>
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Aun no hay usuarios en este grupo.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {members.map((member) => {
                      const memberKey = `${group.id}:${member.userId}`;
                      const memberAction = actionState[memberKey];
                      return (
                        <div
                          key={member.id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {member.user.name || member.user.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {member.user.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmState({
                                  type: "remove-member",
                                  group,
                                  member,
                                })
                              }
                              disabled={memberAction?.busy}
                              className="inline-flex justify-center rounded-xl border border-amber-200 text-amber-700 font-medium px-3 py-1.5 transition shadow-sm disabled:opacity-60"
                            >
                              Remover
                            </button>
                          </div>
                          {memberAction?.error ? (
                            <p className="text-xs text-red-600">
                              {memberAction.error}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modal !== null}
        title={
          modal?.type === "create"
            ? "Crear grupo"
            : modal?.type === "edit"
              ? "Editar grupo"
              : "Agregar usuario"
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
              {modal.type === "create" ? (
                <button
                  type="button"
                  onClick={() => void createGroup()}
                  disabled={actionState["create"]?.busy}
                  className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
                >
                  Crear
                </button>
              ) : modal.type === "edit" ? (
                <button
                  type="button"
                  onClick={() => void updateGroup(modal.group)}
                  disabled={actionState[modal.group.id]?.busy}
                  className="inline-flex justify-center rounded-xl bg-slate-900 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
                >
                  Guardar cambios
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void addMembers(modal.group)}
                  disabled={
                    actionState[modal.group.id]?.busy ||
                    getAvailableUsers(modal.group).length === 0
                  }
                  className="inline-flex justify-center rounded-xl bg-emerald-500 text-white font-medium px-4 py-2 transition shadow-sm disabled:opacity-60"
                >
                  Agregar seleccionados
                </button>
              )}
            </>
          ) : null
        }
      >
        {modal?.type === "create" || modal?.type === "edit" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Nombre del grupo
              </label>
              <input
                type="text"
                value={modalName}
                onChange={(event) => setModalName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                placeholder="Ej. Equipo de contenido"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Descripcion
              </label>
              <textarea
                value={modalDescription}
                onChange={(event) => setModalDescription(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                rows={3}
                placeholder="Descripcion corta del grupo"
              />
            </div>
          </div>
        ) : modal?.type === "member" ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">
                Grupo:{" "}
                <span className="font-semibold text-slate-900">
                  {modal.group.name}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Buscar usuario
              </label>
              <input
                type="text"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
                placeholder="Nombre o correo"
              />
              {getAvailableUsers(modal.group).length === 0 ? (
                <p className="text-xs text-slate-500 mt-2">
                  Todos los usuarios ya pertenecen a este grupo.
                </p>
              ) : null}
            </div>
            {getAvailableUsers(modal.group).length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  Seleccionados: {selectedUserIds.length}
                </p>
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white/70 p-2 space-y-2">
                  {getAvailableUsers(modal.group)
                    .filter((candidate) => {
                      const term = memberSearch.trim().toLowerCase();
                      if (!term) return true;
                      const name = candidate.name?.toLowerCase() ?? "";
                      const email = candidate.email.toLowerCase();
                      return name.includes(term) || email.includes(term);
                    })
                    .map((candidate) => {
                      const checked = selectedUserIds.includes(candidate.id);
                      return (
                        <label
                          key={candidate.id}
                          className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-2 py-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectedUser(candidate.id)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary-200"
                          />
                          <span>
                            {candidate.name
                              ? `${candidate.name} (${candidate.email})`
                              : candidate.email}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {modalError ? (
          <p className="text-sm text-red-600">{modalError}</p>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={confirmState !== null}
        title={
          confirmState?.type === "delete-group"
            ? "Eliminar grupo"
            : "Remover usuario"
        }
        description={
          confirmState?.type === "delete-group" ? (
            <>
              Esta accion eliminara el grupo{" "}
              <span className="font-semibold text-slate-900">
                {confirmState.group.name}
              </span>
              .
            </>
          ) : confirmState?.type === "remove-member" ? (
            <>
              Removeras a{" "}
              <span className="font-semibold text-slate-900">
                {confirmState.member.user.name ||
                  confirmState.member.user.email}
              </span>{" "}
              del grupo{" "}
              <span className="font-semibold text-slate-900">
                {confirmState.group.name}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel={
          confirmState?.type === "delete-group" ? "Eliminar" : "Remover"
        }
        confirmTone={confirmState?.type === "delete-group" ? "danger" : "primary"}
        busy={
          confirmState?.type === "delete-group"
            ? actionState[confirmState.group.id]?.busy
            : confirmState?.type === "remove-member"
              ? actionState[
                  `${confirmState.group.id}:${confirmState.member.userId}`
                ]?.busy
              : false
        }
        onConfirm={() => {
          if (!confirmState) return;
          if (confirmState.type === "delete-group") {
            void deleteGroup(confirmState.group);
          } else {
            void removeMember(confirmState.group, confirmState.member);
          }
        }}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
