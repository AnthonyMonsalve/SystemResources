import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserGroupsPanel } from "../shared/UserGroupsPanel";

export function ProfilePage() {
  const { user, logout, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary mb-1">
          Perfil de usuario
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hola, {user.name || user.email}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 glass-surface">
          <p className="text-sm text-slate-600">
            Email:{" "}
            <span className="font-medium text-slate-900">{user.email}</span>
          </p>
          {user.name && (
            <p className="text-sm text-slate-600 mt-1">
              Nombre:{" "}
              <span className="font-medium text-slate-900">{user.name}</span>
            </p>
          )}
          <p className="text-sm text-slate-600 mt-1">
            Rol:{" "}
            <span className="font-medium text-slate-900">
              {user.role.toUpperCase()}
            </span>
          </p>
        </div>
        <UserGroupsPanel />
      </div>

      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm w-full"
      >
        <FontAwesomeIcon icon="right-from-bracket" />
        Cerrar sesión
      </button>
    </div>
  );
}
