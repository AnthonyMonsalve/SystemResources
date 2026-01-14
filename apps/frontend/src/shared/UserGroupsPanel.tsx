import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { UserGroup } from "../types/groups";

export function UserGroupsPanel() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void fetchGroups(token);
  }, [token]);

  const fetchGroups = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<UserGroup[]>("/groups/me", { token: authToken });
      setGroups(data);
    } catch (err) {
      setError(resolveErrorMessage(err, "No se pudieron cargar los grupos."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 glass-surface space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-primary mb-1">Grupos</p>
          <h2 className="text-lg font-semibold text-slate-900">
            Tus grupos asignados
          </h2>
        </div>
        <button
          type="button"
          onClick={() => token && fetchGroups(token)}
          className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-3 py-2 transition shadow-sm disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {groups.length === 0 && !loading ? (
        <p className="text-sm text-slate-500">
          No tienes grupos asignados.
        </p>
      ) : (
        <div className="grid gap-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {group.name}
                </p>
                {group.description ? (
                  <p className="text-xs text-slate-600">{group.description}</p>
                ) : (
                  <p className="text-xs text-slate-400">Sin descripcion</p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Miembros:{" "}
                <span className="font-semibold text-slate-700">
                  {group.membersCount ?? 0}
                </span>
              </p>
            </div>
          ))}
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
