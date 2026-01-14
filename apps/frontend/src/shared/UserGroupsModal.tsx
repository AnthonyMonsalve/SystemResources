import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { ConfirmModal } from "./ConfirmModal";
import { Modal } from "./Modal";
import type { UserGroup } from "../types/groups";
import type { AdminUser } from "../types/admin";

type UserGroupsModalProps = {
  isOpen: boolean;
  user: AdminUser | null;
  token: string | null;
  onClose: () => void;
};

type ActionState = {
  busy?: boolean;
  error?: string | null;
};

export function UserGroupsModal({
  isOpen,
  user,
  token,
  onClose,
}: UserGroupsModalProps) {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<Record<string, ActionState>>(
    {}
  );
  const [removeGroup, setRemoveGroup] = useState<UserGroup | null>(null);

  useEffect(() => {
    if (!isOpen || !user || !token) return;
    void fetchUserGroups(user.id);
  }, [isOpen, user, token]);

  const fetchUserGroups = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UserGroup[]>(`/groups/user/${userId}`, {
        token,
      });
      setGroups(data);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los grupos."));
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromGroup = async (userId: string, groupId: string) => {
    const key = `${userId}:${groupId}`;
    setActionState((prev) => ({
      ...prev,
      [key]: { busy: true, error: null },
    }));
    try {
      await apiFetch<void>(`/groups/${groupId}/members/${userId}`, {
        method: "DELETE",
        token,
      });
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setRemoveGroup(null);
    } catch (err) {
      setActionState((prev) => ({
        ...prev,
        [key]: {
          busy: false,
          error: resolveErrorMessage(
            err,
            "No se pudo remover el usuario del grupo."
          ),
        },
      }));
      return;
    }
    setActionState((prev) => ({
      ...prev,
      [key]: { busy: false, error: null },
    }));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        title={user ? `Grupos de ${user.name || user.email}` : "Grupos"}
        onClose={onClose}
        footer={
          user ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
            >
              Cerrar
            </button>
          ) : null
        }
      >
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-slate-600">
                Usuario:{" "}
                <span className="font-semibold text-slate-900">
                  {user.name || user.email}
                </span>
              </p>
              <button
                type="button"
                onClick={() => void fetchUserGroups(user.id)}
                className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-3 py-1.5 transition shadow-sm disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {loading ? (
              <p className="text-sm text-slate-500">Cargando grupos...</p>
            ) : groups.length ? (
              <div className="grid gap-2">
                {groups.map((group) => {
                  const actionKey = `${user.id}:${group.id}`;
                  const action = actionState[actionKey];
                  return (
                    <div
                      key={group.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {group.name}
                        </p>
                        {group.description ? (
                          <p className="text-xs text-slate-600">
                            {group.description}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400">
                            Sin descripcion
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">
                          Miembros:{" "}
                          <span className="font-semibold text-slate-700">
                            {group.membersCount ?? 0}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setRemoveGroup(group)}
                          disabled={action?.busy}
                          className="inline-flex justify-center rounded-xl border border-amber-200 text-amber-700 font-medium px-3 py-1.5 transition shadow-sm disabled:opacity-60"
                        >
                          Remover
                        </button>
                      </div>
                      {action?.error ? (
                        <p className="text-xs text-red-600">{action.error}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Este usuario no pertenece a ningun grupo.
              </p>
            )}
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={removeGroup !== null}
        title="Remover de grupo"
        description={
          removeGroup && user ? (
            <>
              Removeras a{" "}
              <span className="font-semibold text-slate-900">
                {user.name || user.email}
              </span>{" "}
              del grupo{" "}
              <span className="font-semibold text-slate-900">
                {removeGroup.name}
              </span>
              .
            </>
          ) : null
        }
        confirmLabel="Remover"
        confirmTone="primary"
        busy={
          removeGroup && user
            ? actionState[`${user.id}:${removeGroup.id}`]?.busy
            : false
        }
        onConfirm={() => {
          if (removeGroup && user) {
            void removeUserFromGroup(user.id, removeGroup.id);
          }
        }}
        onClose={() => setRemoveGroup(null)}
      />
    </>
  );
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
