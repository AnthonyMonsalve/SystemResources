import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AdminGroupsPage } from "./pages/AdminGroups";
import { AdminUsersPage } from "./pages/AdminUsers";
import { LoginPage } from "./pages/Login";
import { ProfilePage } from "./pages/Profile";
import { RegisterPage } from "./pages/Register";

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition ${
    isActive
      ? "text-white bg-primary shadow-sm"
      : "text-primary hover:text-primary/80"
  } text-center`;

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const contentClassName = isAdminRoute
    ? "glass-surface rounded-2xl px-8 py-6 border border-slate-200/70 w-full"
    : "glass-surface rounded-2xl px-8 py-4 border border-slate-200/70 max-w-lg mx-auto w-full";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg accent-gradient" />
          <div>
            <p className="text-sm text-slate-500">La TV Calle</p>
            <p className="text-lg font-semibold text-slate-900">
              Portal de Recursos
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClasses}>
                <FontAwesomeIcon icon="user" />
                Perfil
              </NavLink>
              {user?.role === "admin" ? (
                <>
                  <NavLink to="/admin/usuarios" className={navLinkClasses}>
                    <FontAwesomeIcon icon="users" />
                    Usuarios
                  </NavLink>
                  <NavLink to="/admin/grupos" className={navLinkClasses}>
                    <FontAwesomeIcon icon="layer-group" />
                    Grupos
                  </NavLink>
                </>
              ) : null}
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900"
              >
                <FontAwesomeIcon icon="right-from-bracket" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClasses}>
                Login
              </NavLink>
              <NavLink to="/registro" className={navLinkClasses}>
                Registro
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-2 mt-2 mb-6">
        <div className="w-full max-w-5xl grid grid-cols-1 gap-6">
          <div className={contentClassName}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/grupos" element={<AdminGroupsPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
