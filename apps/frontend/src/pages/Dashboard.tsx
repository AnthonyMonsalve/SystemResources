import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TrainerDashboard from '../components/dashboard/TrainerDashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';

export function DashboardPage() {
  const { user, token, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isTrainer = user.role === 'trainer' || user.role === 'admin';
  const isClient = user.role === 'client';

  return (
    <div className="max-w-7xl mx-auto">
      {isTrainer ? (
        <TrainerDashboard user={user} token={token} />
      ) : isClient ? (
        <ClientDashboard user={user} token={token} />
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Bienvenido a BeFitness.App
          </h2>
          <p className="text-slate-600">
            Tu dashboard se mostrará aquí una vez que tu cuenta esté configurada.
          </p>
        </div>
      )}
    </div>
  );
}
