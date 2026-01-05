import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, readTokenCookie } from "../lib/api";
import { EyeIcon, EyeOffIcon } from "../shared/EyeIcons";

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (readTokenCookie()) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) || undefined;
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const confirm = (formData.get("confirmPassword") as string) ?? "";
    setError(null);
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
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
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-28 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 px-3 text-sm text-primary font-semibold inline-flex items-center"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-28 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white"
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute inset-y-0 right-2 px-3 text-sm text-primary font-semibold inline-flex items-center"
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
