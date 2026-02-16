import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface StatCardProps {
  icon: IconDefinition;
  label: string;
  value: number | string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'green' | 'blue';
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  color = 'primary',
}: StatCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-primary-50 to-white',
      icon: 'bg-primary-500',
    },
    accent: {
      bg: 'bg-gradient-to-br from-accent-50 to-white',
      icon: 'bg-accent-500',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-white',
      icon: 'bg-green-500',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-white',
      icon: 'bg-blue-500',
    },
  };

  return (
    <div
      className={`p-6 rounded-2xl border border-slate-200 shadow-sm ${colorClasses[color].bg}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={`text-xs font-medium mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl shadow-sm ${colorClasses[color].icon}`}
        >
          <FontAwesomeIcon icon={icon} className="text-white text-xl" />
        </div>
      </div>
    </div>
  );
}
