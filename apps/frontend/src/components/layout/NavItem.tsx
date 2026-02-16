import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface NavItemProps {
  icon: IconDefinition;
  label: string;
  to: string;
  badge?: number;
}

export default function NavItem({ icon, label, to, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-slate-700 hover:bg-slate-50'
        }`
      }
    >
      <FontAwesomeIcon icon={icon} className="w-5 text-center" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
