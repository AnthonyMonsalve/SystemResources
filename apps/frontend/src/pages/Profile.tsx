import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary-700 mb-1">Perfil</p>
        <h1 className="text-2xl font-semibold text-slate-900">Hola, {user.name || user.email}</h1>
        <p className="text-sm text-slate-600">Rol: {user.role}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 glass-surface">
          <p className="text-sm text-slate-600">
            Email: <span className="font-medium text-slate-900">{user.email}</span>
          </p>
          {user.name && (
            <p className="text-sm text-slate-600 mt-1">
              Nombre: <span className="font-medium text-slate-900">{user.name}</span>
            </p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Este perfil proviene del endpoint protegido `/auth/profile`.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="inline-flex justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
