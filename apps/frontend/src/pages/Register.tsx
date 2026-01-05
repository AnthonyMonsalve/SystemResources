import type { FormEvent } from "react";
import { Link } from "react-router-dom";

export function RegisterPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: wire with backend register endpoint
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 text-center">
        Registro
      </h1>
      <p className="text-sm text-slate-600 mt-1 mb-6 text-center">
        Crea una cuenta y accede al sistema
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="nombre@correo.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm"
        >
          Crear cuenta
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-4 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="text-primary font-semibold hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
