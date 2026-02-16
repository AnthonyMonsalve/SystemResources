import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faDumbbell,
  faListCheck,
  faCalendarDays,
  faUsers,
  faChartSimple,
  faGear,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import type { UserRole } from '../../types/auth';
import NavItem from './NavItem';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: UserRole;
}

export default function Sidebar({ isOpen, onToggle, userRole }: SidebarProps) {
  const isTrainer = userRole === 'trainer' || userRole === 'admin';
  const isClient = userRole === 'client';
  const isAdmin = userRole === 'admin';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onToggle}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-md" />
            <div>
              <p className="text-sm text-primary-600 font-medium">Fitness</p>
              <p className="text-base font-bold text-slate-900">
                BeFitness.App
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            aria-label="Cerrar menú"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {/* Common - Dashboard */}
          <NavItem
            icon={faChartLine}
            label="Dashboard"
            to="/dashboard"
          />

          {/* Trainer/Admin routes */}
          {isTrainer && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Entrenamiento
                </p>
              </div>

              <NavItem
                icon={faDumbbell}
                label="Ejercicios"
                to="/exercises"
              />

              <NavItem
                icon={faListCheck}
                label="Rutinas"
                to="/routines"
              />

              <NavItem
                icon={faCalendarDays}
                label="Programas"
                to="/programs"
              />

              <NavItem
                icon={faUsers}
                label="Mis Clientes"
                to="/my-clients"
              />
            </>
          )}

          {/* Client routes */}
          {isClient && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mi Entrenamiento
                </p>
              </div>

              <NavItem
                icon={faCalendarDays}
                label="Mis Programas"
                to="/my-programs"
              />

              <NavItem
                icon={faListCheck}
                label="Mis Rutinas"
                to="/my-routines"
              />

              <NavItem
                icon={faChartSimple}
                label="Mi Progreso"
                to="/my-progress"
              />
            </>
          )}

          {/* Admin routes */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administración
                </p>
              </div>

              <NavItem
                icon={faGear}
                label="Usuarios"
                to="/admin/users"
              />

              <NavItem
                icon={faUsers}
                label="Grupos"
                to="/admin/groups"
              />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
