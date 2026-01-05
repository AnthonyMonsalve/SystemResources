import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition ${
    isActive
      ? "text-white bg-primary shadow-sm"
      : "text-slate-600 hover:text-slate-900"
  }`;

export default function App() {
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
          <NavLink to="/login" className={navLinkClasses}>
            Login
          </NavLink>
          <NavLink to="/registro" className={navLinkClasses}>
            Registro
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-2">
        <div className="w-full max-w-5xl grid grid-cols-1 gap-6">
          <div className="glass-surface rounded-2xl p-8 border border-slate-200/70 max-w-lg mx-auto w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
