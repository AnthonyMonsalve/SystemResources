import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faChartLine,
  faUsers,
  faCalendarDays,
  faTrophy,
  faFire,
  faArrowRight,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faDumbbell} className="text-primary-600 text-2xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                BeFitness
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-slate-700 font-medium hover:text-primary-600 transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition shadow-md hover:shadow-lg"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium">
                <FontAwesomeIcon icon={faTrophy} />
                Plataforma de Entrenamiento #1
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Transforma tu
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  {' '}entrenamiento{' '}
                </span>
                con BeFitness
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                La plataforma completa para entrenadores y clientes. Crea programas personalizados,
                rastrea el progreso y alcanza tus objetivos fitness.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/registro"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-xl transition text-lg"
                >
                  Comenzar Ahora
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition border-2 border-slate-200 text-lg"
                >
                  Ver Características
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-600">Entrenadores</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">5K+</div>
                  <div className="text-sm text-slate-600">Clientes Activos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-600">Entrenamientos</div>
                </div>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/50">
                <div className="aspect-square bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faDumbbell} className="text-white text-9xl opacity-50" />
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <FontAwesomeIcon icon={faFire} className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Calorías Hoy</div>
                      <div className="text-lg font-bold text-slate-900">450 kcal</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FontAwesomeIcon icon={faChartLine} className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Progreso Semanal</div>
                      <div className="text-lg font-bold text-slate-900">+12%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Todo lo que necesitas para entrenar
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Herramientas profesionales para entrenadores y una experiencia increíble para clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:shadow-lg transition">
              <div className="p-4 bg-primary-100 rounded-xl w-fit mb-4">
                <FontAwesomeIcon icon={faDumbbell} className="text-primary-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Biblioteca de Ejercicios
              </h3>
              <p className="text-slate-600">
                Accede a cientos de ejercicios con videos, instrucciones detalladas y
                parámetros personalizables.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition">
              <div className="p-4 bg-blue-100 rounded-xl w-fit mb-4">
                <FontAwesomeIcon icon={faCalendarDays} className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Rutinas Personalizadas
              </h3>
              <p className="text-slate-600">
                Crea rutinas semanales adaptadas a los objetivos específicos de cada cliente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-lg transition">
              <div className="p-4 bg-green-100 rounded-xl w-fit mb-4">
                <FontAwesomeIcon icon={faTrophy} className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Programas de Entrenamiento
              </h3>
              <p className="text-slate-600">
                Diseña programas completos de varias semanas con progresión automática.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition">
              <div className="p-4 bg-purple-100 rounded-xl w-fit mb-4">
                <FontAwesomeIcon icon={faChartLine} className="text-purple-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Seguimiento de Progreso
              </h3>
              <p className="text-slate-600">
                Monitorea peso, medidas corporales y rendimiento con gráficos detallados.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 hover:shadow-lg transition">
              <div className="p-4 bg-orange-100 rounded-xl w-fit mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-orange-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Gestión de Clientes
              </h3>
              <p className="text-slate-600">
                Administra todos tus clientes en un solo lugar con perfiles individuales.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-white border border-red-100 hover:shadow-lg transition">
              <div className="p-4 bg-red-100 rounded-xl w-fit mb-4">
                <FontAwesomeIcon icon={faFire} className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Análisis y Estadísticas
              </h3>
              <p className="text-slate-600">
                Visualiza métricas clave y toma decisiones basadas en datos reales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Trainers Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Para Entrenadores Profesionales</h2>
              <p className="text-primary-100 text-lg mb-8">
                Optimiza tu trabajo, escala tu negocio y ofrece un servicio de clase mundial
                a tus clientes con nuestras herramientas profesionales.
              </p>

              <div className="space-y-4">
                {[
                  'Crea y asigna programas ilimitados',
                  'Rastrea el progreso de múltiples clientes',
                  'Biblioteca de ejercicios personalizable',
                  'Comunicación directa con clientes',
                  'Reportes y análisis detallados',
                  'Plantillas reutilizables',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-primary-200 text-xl" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/registro"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition text-lg"
              >
                Comenzar como Entrenador
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="aspect-square bg-white/20 rounded-2xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-white text-9xl opacity-30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Listo para comenzar tu transformación?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Únete a miles de entrenadores y clientes que ya están alcanzando sus objetivos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-xl transition text-lg"
            >
              Crear Cuenta Gratis
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faDumbbell} className="text-primary-500 text-xl" />
                <span className="text-xl font-bold text-white">BeFitness</span>
              </div>
              <p className="text-sm">
                La plataforma completa para transformar tu entrenamiento y alcanzar tus objetivos.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Características</a></li>
                <li><a href="#" className="hover:text-white transition">Precios</a></li>
                <li><a href="#" className="hover:text-white transition">Testimonios</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Compañía</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2026 BeFitness. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
