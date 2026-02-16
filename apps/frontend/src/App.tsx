import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/Dashboard';
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
import { ExercisesPage } from './pages/Exercises';
import { RoutinesPage } from './pages/Routines';
import { ProgramsPage } from './pages/Programs';
import { ExerciseDetailPage } from './pages/ExerciseDetail';
import { RoutineDetailPage } from './pages/RoutineDetail';
import { ProgramDetailPage } from './pages/ProgramDetail';
import { ExerciseFormPage } from './pages/ExerciseForm';
import { RoutineFormPage } from './pages/RoutineForm';
import { ProgramFormPage } from './pages/ProgramForm';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Protected routes with DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Fitness routes */}
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/exercises/new" element={<ExerciseFormPage />} />
        <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
        <Route path="/exercises/:id/edit" element={<ExerciseFormPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/routines/new" element={<RoutineFormPage />} />
        <Route path="/routines/:id" element={<RoutineDetailPage />} />
        <Route path="/routines/:id/edit" element={<RoutineFormPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/new" element={<ProgramFormPage />} />
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
        <Route path="/programs/:id/edit" element={<ProgramFormPage />} />

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
