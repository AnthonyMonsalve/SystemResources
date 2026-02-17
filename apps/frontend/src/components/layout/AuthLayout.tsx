import { Link, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faChartLine,
  faUsers,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faDumbbell} className="text-primary-600 text-3xl" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              BeFitness
            </span>
          </Link>

          {/* Form Content (from Outlet) */}
          <Outlet />
        </div>
      </div>

      {/* Right Side - Branding/Image */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20">
            <FontAwesomeIcon icon={faDumbbell} className="text-white text-8xl" />
          </div>
          <div className="absolute bottom-20 right-20">
            <FontAwesomeIcon icon={faTrophy} className="text-white text-8xl" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <FontAwesomeIcon icon={faChartLine} className="text-white text-9xl" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg space-y-8 text-center">
          <h1 className="text-5xl font-bold leading-tight">
            Transforma tu entrenamiento
          </h1>
          <p className="text-2xl text-primary-100">
            La plataforma completa para entrenadores y clientes
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <FontAwesomeIcon icon={faDumbbell} className="text-3xl mb-2" />
              <div className="font-semibold">Ejercicios</div>
              <div className="text-sm text-primary-100">Biblioteca completa</div>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <FontAwesomeIcon icon={faChartLine} className="text-3xl mb-2" />
              <div className="font-semibold">Progreso</div>
              <div className="text-sm text-primary-100">Seguimiento detallado</div>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <FontAwesomeIcon icon={faUsers} className="text-3xl mb-2" />
              <div className="font-semibold">Clientes</div>
              <div className="text-sm text-primary-100">Gestión fácil</div>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <FontAwesomeIcon icon={faTrophy} className="text-3xl mb-2" />
              <div className="font-semibold">Objetivos</div>
              <div className="text-sm text-primary-100">Resultados reales</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-primary-100">Entrenadores</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5K+</div>
              <div className="text-sm text-primary-100">Clientes</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-primary-100">Entrenamientos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
