import {
  faDumbbell,
  faEnvelope,
  faPencil,
  faRightFromBracket,
  faRuler,
  faShieldHalved,
  faUser,
  faWeight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../types/auth';
import { apiFetch } from '../lib/api';
import { MeasurementHistory } from '../components/measurements/MeasurementHistory';

type EditClientModalProps = {
  client: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: UserProfile) => void;
};

function EditClientModal({
  client,
  isOpen,
  onClose,
  onSuccess,
}: EditClientModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    weight: client.weight || '',
    height: client.height || '',
    goal: client.goal || '',
    fitnessLevel: client.fitnessLevel || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const payload: Record<string, string | number> = {};
      if (formData.weight) payload.weight = Number(formData.weight);
      if (formData.height) payload.height = Number(formData.height);
      if (formData.goal) payload.goal = formData.goal;
      if (formData.fitnessLevel) payload.fitnessLevel = formData.fitnessLevel;

      const updated = await apiFetch<UserProfile>('/profile/client', {
        method: 'PATCH',
        token,
        body: payload,
      });

      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Editar Información Corporal
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              min="20"
              max="300"
              step="0.1"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              min="100"
              max="250"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="170"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Objetivo
            </label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleccionar objetivo</option>
              <option value="lose_weight">Perder peso</option>
              <option value="gain_muscle">Ganar músculo</option>
              <option value="improve_endurance">Mejorar resistencia</option>
              <option value="general_fitness">Fitness general</option>
              <option value="rehabilitation">Rehabilitación</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nivel de fitness
            </label>
            <select
              value={formData.fitnessLevel}
              onChange={(e) =>
                setFormData({ ...formData, fitnessLevel: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seleccionar nivel</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type EditTrainerModalProps = {
  trainer: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: UserProfile) => void;
};

function EditTrainerModal({
  trainer,
  isOpen,
  onClose,
  onSuccess,
}: EditTrainerModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    bio: trainer.bio || '',
    specialization: trainer.specialization || '',
    certifications: trainer.certifications || '',
    yearsExperience: trainer.yearsExperience || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const payload: Record<string, string | number> = {};
      if (formData.bio) payload.bio = formData.bio;
      if (formData.specialization)
        payload.specialization = formData.specialization;
      if (formData.certifications)
        payload.certifications = formData.certifications;
      if (formData.yearsExperience)
        payload.yearsExperience = Number(formData.yearsExperience);

      const updated = await apiFetch<UserProfile>('/profile/trainer', {
        method: 'PATCH',
        token,
        body: payload,
      });

      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Editar Perfil Profesional
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Biografía
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              maxLength={500}
              placeholder="Cuéntanos sobre ti..."
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.bio.length}/500 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Especialización
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              maxLength={200}
              placeholder="Ej: Entrenamiento de fuerza, HIIT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Certificaciones
            </label>
            <textarea
              value={formData.certifications}
              onChange={(e) =>
                setFormData({ ...formData, certifications: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              maxLength={500}
              placeholder="Ej: NSCA-CPT, ACE Personal Trainer"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.certifications.length}/500 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Años de experiencia
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.yearsExperience}
              onChange={(e) =>
                setFormData({ ...formData, yearsExperience: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="5"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user: initialUser, logout, token } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isEditTrainerOpen, setIsEditTrainerOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const getGoalLabel = (goal?: string) => {
    const goals: Record<string, string> = {
      lose_weight: 'Perder peso',
      gain_muscle: 'Ganar músculo',
      improve_endurance: 'Mejorar resistencia',
      general_fitness: 'Fitness general',
      rehabilitation: 'Rehabilitación',
    };
    return goal ? goals[goal] || goal : 'No definido';
  };

  const getLevelLabel = (level?: string) => {
    const levels: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    };
    return level ? levels[level] || level : 'No definido';
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      trainer: 'Entrenador',
      client: 'Cliente',
      user: 'Usuario',
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      trainer: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      user: 'bg-slate-100 text-slate-800',
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-600 mt-1">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-32" />

        <div className="px-6 pb-6">
          {/* Avatar and basic info */}
          <div className="flex items-start gap-4 -mt-16 mb-6">
            <div className="w-32 h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
              <FontAwesomeIcon
                icon={faUser}
                className="text-4xl text-slate-400"
              />
            </div>
            <div className="flex-1 mt-16">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.name || 'Usuario'}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Client-specific info */}
          {user.role === 'client' && (
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Información Corporal
                </h3>
                <button
                  onClick={() => setIsEditClientOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPencil} />
                  Editar
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FontAwesomeIcon icon={faWeight} />
                    <span className="text-sm">Peso</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {user.weight ? `${user.weight} kg` : 'No definido'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FontAwesomeIcon icon={faRuler} />
                    <span className="text-sm">Altura</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {user.height ? `${user.height} cm` : 'No definido'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FontAwesomeIcon icon={faDumbbell} />
                    <span className="text-sm">Objetivo</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {getGoalLabel(user.goal)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span className="text-sm">Nivel</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {getLevelLabel(user.fitnessLevel)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trainer-specific info */}
          {user.role === 'trainer' && (
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Información Profesional
                </h3>
                <button
                  onClick={() => setIsEditTrainerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPencil} />
                  Editar
                </button>
              </div>

              <div className="space-y-4">
                {user.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Biografía
                    </h4>
                    <p className="text-slate-600">{user.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.specialization && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">
                        Especialización
                      </h4>
                      <p className="text-slate-900 font-medium">
                        {user.specialization}
                      </p>
                    </div>
                  )}

                  {user.yearsExperience !== undefined && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-1">
                        Años de experiencia
                      </h4>
                      <p className="text-slate-900 font-medium">
                        {user.yearsExperience} años
                      </p>
                    </div>
                  )}
                </div>

                {user.certifications && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Certificaciones
                    </h4>
                    <p className="text-slate-600">{user.certifications}</p>
                  </div>
                )}

                {!user.bio &&
                  !user.specialization &&
                  !user.certifications &&
                  user.yearsExperience === undefined && (
                    <div className="text-center py-8 text-slate-500">
                      <p>No has completado tu perfil profesional aún.</p>
                      <button
                        onClick={() => setIsEditTrainerOpen(true)}
                        className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Completar perfil
                      </button>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Measurement History - Only for clients */}
      {user.role === 'client' && token && (
        <MeasurementHistory token={token} isClient={true} />
      )}

      {/* Logout button */}
      <button
        type="button"
        onClick={logout}
        className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        Cerrar sesión
      </button>

      {/* Modals */}
      {user.role === 'client' && (
        <EditClientModal
          client={user}
          isOpen={isEditClientOpen}
          onClose={() => setIsEditClientOpen(false)}
          onSuccess={(updated) => setUser(updated)}
        />
      )}

      {user.role === 'trainer' && (
        <EditTrainerModal
          trainer={user}
          isOpen={isEditTrainerOpen}
          onClose={() => setIsEditTrainerOpen(false)}
          onSuccess={(updated) => setUser(updated)}
        />
      )}
    </div>
  );
}
