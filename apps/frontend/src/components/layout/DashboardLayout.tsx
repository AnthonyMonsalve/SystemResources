import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
  const { user, initializing } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userRole={user.role}
      />

      <div className="lg:pl-64">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
