import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChevronDown,
  faUser,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from './Breadcrumbs';

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (userMenuRef.current?.contains(target)) {
        return;
      }
      setUserMenuOpen(false);
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            aria-label="Abrir menú"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <Breadcrumbs />
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <span className="hidden md:block max-w-[140px] truncate">
              {user.name || user.email}
            </span>
            <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
          </button>

          {userMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg z-50"
            >
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name || user.email}
                </p>
                {user.email && (
                  <p className="text-xs text-slate-500">{user.email}</p>
                )}
                {user.role && (
                  <p className="text-xs text-primary-600 font-medium mt-1 capitalize">
                    {user.role === 'trainer' ? 'Entrenador' : user.role === 'client' ? 'Cliente' : user.role}
                  </p>
                )}
              </div>

              <div className="p-2">
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <FontAwesomeIcon icon={faUser} className="w-4" />
                  Perfil de usuario
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
