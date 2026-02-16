import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface QuickActionCardProps {
  icon: IconDefinition;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'primary' | 'accent';
}

export default function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  color = 'primary',
}: QuickActionCardProps) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
    accent: 'from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700',
  };

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all text-left w-full`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
        </div>
      </div>
    </button>
  );
}
