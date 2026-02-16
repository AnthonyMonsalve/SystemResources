import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  exercises: 'Ejercicios',
  routines: 'Rutinas',
  programs: 'Programas',
  'my-clients': 'Mis Clientes',
  'my-programs': 'Mis Programas',
  'my-progress': 'Mi Progreso',
  profile: 'Perfil',
  admin: 'Administración',
  users: 'Usuarios',
  groups: 'Grupos',
  posts: 'Posts',
  new: 'Crear',
  edit: 'Editar',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        to="/dashboard"
        className="flex items-center text-slate-600 hover:text-slate-900 transition"
      >
        <FontAwesomeIcon icon={faHouse} />
      </Link>

      {pathnames.map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeNames[segment] || segment;

        // Skip UUIDs in breadcrumbs
        if (
          segment.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          return null;
        }

        return (
          <div key={to} className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-slate-400 text-xs"
            />
            {isLast ? (
              <span className="text-slate-900 font-medium">{label}</span>
            ) : (
              <Link
                to={to}
                className="text-slate-600 hover:text-slate-900 transition"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
