import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ProfilePage } from './pages/Profile';
import { useAuth } from './context/AuthContext';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition ${
    isActive ? 'text-white bg-primary shadow-sm' : 'text-primary hover:text-primary/80'
  } text-center`;

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg accent-gradient" />
          <div>
            <p className="text-sm text-slate-500">La TV Calle</p>
            <p className="text-lg font-semibold text-slate-900">Portal de Recursos</p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClasses}>
                Perfil
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900"
              >
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

      <main className="flex-1 flex items-center justify-center px-4 py-2">
        <div className="w-full max-w-5xl grid grid-cols-1 gap-6">
          <div className="glass-surface rounded-2xl p-8 border border-slate-200/70 max-w-lg mx-auto w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
