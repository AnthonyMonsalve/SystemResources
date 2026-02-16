import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { PostDetailPage } from './pages/PostDetail';
import { ProfilePage } from './pages/Profile';
import { RegisterPage } from './pages/Register';
import { AdminGroupsPage } from './pages/AdminGroups';
import { AdminPostCreatePage } from './pages/AdminPostCreate';
import { AdminPostEditPage } from './pages/AdminPostEdit';
import { AdminPostsPage } from './pages/AdminPosts';
import { AdminUsersPage } from './pages/AdminUsers';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Protected routes with DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

        {/* Legacy routes - mantener por ahora */}
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/usuarios" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/groups" element={<AdminGroupsPage />} />
        <Route path="/admin/grupos" element={<Navigate to="/admin/groups" replace />} />
        <Route path="/admin/posts" element={<AdminPostsPage />} />
        <Route path="/admin/posts/nuevo" element={<AdminPostCreatePage />} />
        <Route path="/admin/posts/:id/editar" element={<AdminPostEditPage />} />
      </Route>
    </Routes>
  );
}
