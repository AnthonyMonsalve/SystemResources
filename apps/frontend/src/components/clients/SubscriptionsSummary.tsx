import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faCalendarDays,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import type { UserProfile } from '../../types/auth';

type SubscriptionsSummaryProps = {
  expiringSoon: UserProfile[];
  onClientClick: (client: UserProfile) => void;
  onRenewClick: (client: UserProfile) => void;
};

export function SubscriptionsSummary({
  expiringSoon,
  onClientClick,
  onRenewClick,
}: SubscriptionsSummaryProps) {
  if (expiringSoon.length === 0) {
    return null;
  }

  const getDaysLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-yellow-600 text-xl"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-yellow-900">
            Suscripciones Próximas a Vencer
          </h2>
          <p className="text-sm text-yellow-700">
            {expiringSoon.length} {expiringSoon.length === 1 ? 'cliente necesita' : 'clientes necesitan'} renovación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {expiringSoon.map((client) => {
          const daysLeft = client.subscriptionEndDate
            ? getDaysLeft(client.subscriptionEndDate)
            : 0;

          return (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-yellow-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {client.name || 'Sin nombre'}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">{client.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon
                  icon={faClock}
                  className={`text-xs ${
                    daysLeft <= 3 ? 'text-red-600' : 'text-yellow-600'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    daysLeft <= 3 ? 'text-red-700' : 'text-yellow-700'
                  }`}
                >
                  {daysLeft <= 0 ? 'Vencida' : `${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`}
                </span>
                <span className="text-xs text-slate-500">
                  {client.subscriptionEndDate &&
                    new Date(client.subscriptionEndDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRenewClick(client)}
                  className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-xs font-medium"
                >
                  Renovar
                </button>
                <button
                  onClick={() => onClientClick(client)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-xs font-medium"
                >
                  Ver
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
