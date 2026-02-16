import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface InfoCardProps {
  icon?: IconDefinition;
  label: string;
  value: string | number | React.ReactNode;
  color?: 'primary' | 'accent' | 'blue' | 'green' | 'purple' | 'slate';
}

export default function InfoCard({ icon, label, value, color = 'slate' }: InfoCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-accent-50 text-accent-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    slate: 'bg-slate-50 text-slate-700',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <FontAwesomeIcon icon={icon} className="text-xl" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
