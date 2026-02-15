import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AdminGroupsPage } from "./pages/AdminGroups";
import { AdminPostCreatePage } from "./pages/AdminPostCreate";
import { AdminPostEditPage } from "./pages/AdminPostEdit";
import { AdminPostsPage } from "./pages/AdminPosts";
import { AdminUsersPage } from "./pages/AdminUsers";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { PostDetailPage } from "./pages/PostDetail";
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
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const desktopUserMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement | null>(null);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isWideRoute =
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/posts") ||
    location.pathname.startsWith("/profile");
  const contentClassName = isAdminRoute
    ? "glass-surface rounded-2xl px-8 py-6 border border-slate-200/70 w-full"
    : isWideRoute
      ? "w-full max-w-6xl mx-auto"
      : "glass-surface rounded-2xl px-8 py-4 border border-slate-200/70 max-w-lg mx-auto w-full";

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (
        desktopUserMenuRef.current?.contains(target) ||
        mobileUserMenuRef.current?.contains(target)
      ) {
        return;
      }
      setUserMenuOpen(false);
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink
            to="/home"
            className="flex items-center gap-3"
            aria-label="Ir a inicio"
          >
            <div className="h-10 w-10 rounded-lg accent-gradient" />
            <div>
              <p className="text-sm text-slate-500">La TV Calle</p>
              <p className="text-lg font-semibold text-slate-900">
                Portal de Recursos
              </p>
            </div>
          </NavLink>
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <>
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
                    <NavLink to="/admin/posts" className={navLinkClasses}>
                      <FontAwesomeIcon icon="file-lines" />
                      Posts
                    </NavLink>
                  </>
                ) : null}
                <div className="relative" ref={desktopUserMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                    <span className="max-w-[140px] truncate">
                      {user.name || user.email}
                    </span>
                    <FontAwesomeIcon icon="chevron-down" className="text-xs" />
                  </button>
                  {userMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg z-[1]"
                    >
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {user.name || user.email}
                        </p>
                        {user.email ? (
                          <p className="text-xs text-slate-500">{user.email}</p>
                        ) : null}
                      </div>
                      <div className="my-1 border-t border-slate-100" />
                      <NavLink
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FontAwesomeIcon icon="user" className="mr-2" />
                        Perfil de usuario
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FontAwesomeIcon
                          icon="right-from-bracket"
                          className="mr-2"
                        />
                        Cerrar sesión
                      </button>
                    </div>
                  ) : null}
                </div>
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
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm"
            aria-label="Abrir menu"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? "xmark" : "bars"} />
          </button>
        </div>
        <div
          className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden ${
            mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={handleMobileNavClick}
        />
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full bg-white transition-transform duration-300 md:hidden ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <NavLink
              to="/home"
              className="flex items-center gap-3"
              onClick={handleMobileNavClick}
              aria-label="Ir a inicio"
            >
              <div className="h-9 w-9 rounded-lg accent-gradient" />
              <div>
                <p className="text-xs text-slate-500">La TV Calle</p>
                <p className="text-base font-semibold text-slate-900">
                  Portal de Recursos
                </p>
              </div>
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm"
              aria-label="Cerrar menu"
            >
              <FontAwesomeIcon icon="xmark" />
            </button>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  {user?.role === "admin" ? (
                    <>
                      <NavLink
                        to="/admin/usuarios"
                        className={navLinkClasses}
                        onClick={handleMobileNavClick}
                      >
                        <FontAwesomeIcon icon="users" />
                        Usuarios
                      </NavLink>
                      <NavLink
                        to="/admin/grupos"
                        className={navLinkClasses}
                        onClick={handleMobileNavClick}
                      >
                        <FontAwesomeIcon icon="layer-group" />
                        Grupos
                      </NavLink>
                      <NavLink
                        to="/admin/posts"
                        className={navLinkClasses}
                        onClick={handleMobileNavClick}
                      >
                        <FontAwesomeIcon icon="file-lines" />
                        Posts
                      </NavLink>
                    </>
                  ) : null}
                  <div className="relative" ref={mobileUserMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      className="inline-flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </span>
                      <span className="flex-1 truncate text-left">
                        {user.name || user.email}
                      </span>
                      <FontAwesomeIcon
                        icon="chevron-down"
                        className="text-xs"
                      />
                    </button>
                    {userMenuOpen ? (
                      <div
                        role="menu"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-lg z-[1]"
                      >
                        <div className="px-3 py-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name || user.email}
                          </p>
                          {user.email ? (
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          ) : null}
                        </div>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleMobileNavClick();
                            navigate("/profile");
                          }}
                          className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <FontAwesomeIcon icon="user" className="mr-2" />
                          Perfil de usuario
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleMobileNavClick();
                            logout();
                          }}
                          className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <FontAwesomeIcon
                            icon="right-from-bracket"
                            className="mr-2"
                          />
                          Cerrar sesión
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={navLinkClasses}
                    onClick={handleMobileNavClick}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/registro"
                    className={navLinkClasses}
                    onClick={handleMobileNavClick}
                  >
                    Registro
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-2 mt-2 mb-6">
        <div className="w-full max-w-5xl grid grid-cols-1 gap-6">
          <div className={contentClassName}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/grupos" element={<AdminGroupsPage />} />
              <Route path="/admin/posts" element={<AdminPostsPage />} />
              <Route
                path="/admin/posts/nuevo"
                element={<AdminPostCreatePage />}
              />
              <Route
                path="/admin/posts/:id/editar"
                element={<AdminPostEditPage />}
              />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
