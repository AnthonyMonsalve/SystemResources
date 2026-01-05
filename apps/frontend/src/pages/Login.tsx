import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, readTokenCookie } from "../lib/api";
import { EyeIcon, EyeOffIcon } from "../shared/EyeIcons";

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (readTokenCookie()) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    setError(null);
    void login({ email, password })
      .then(() => navigate("/profile"))
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudo iniciar sesión");
        }
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 text-center">
        Inicio de sesión
      </h1>
      <p className="text-sm text-slate-600 mt-1 mb-6 text-center">
        Ingresa con tu correo y contraseña.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-24 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 px-3 text-sm text-primary font-semibold inline-flex items-center"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center rounded-xl bg-primary text-white font-medium px-4 py-2.5 transition shadow-sm disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
      ) : null}

      <p className="text-sm text-slate-600 mt-4 text-center">
        ¿No tienes cuenta?{" "}
        <Link
          to="/registro"
          className="text-primary font-semibold hover:underline"
        >
          Crea una aquí
        </Link>
      </p>
    </div>
  );
}
