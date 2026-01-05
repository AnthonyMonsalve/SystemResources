import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) || undefined;
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    setError(null);
    void register({ name, email, password })
      .then(() => navigate("/profile"))
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudo completar el registro");
        }
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 text-center">
        Registro
      </h1>
      <p className="text-sm text-slate-600 mt-1 mb-6 text-center">
        Crea una cuenta para acceder al sistema.
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
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm disabled:opacity-60"
        >
          {loading ? "Estamos registrando tu cuenta..." : "Crear cuenta"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
      ) : null}

      <p className="text-sm text-slate-600 mt-4 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
