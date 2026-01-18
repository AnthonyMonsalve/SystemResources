const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const TOKEN_COOKIE = "token-system";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

type UploadOptions = {
  method?: "POST" | "PUT" | "PATCH";
  token?: string | null;
};

export function setTokenCookie(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; sameSite=Lax`;
}

export function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; sameSite=Lax`;
}

export function readTokenCookie(): string | null {
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${TOKEN_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = options.token ?? readTokenCookie();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const { message, details } = await safeErrorMessage(res);
    throw new ApiError(message, res.status, details);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function apiUpload<T>(
  path: string,
  body: FormData,
  options: UploadOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = options.token ?? readTokenCookie();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const { message, details } = await safeErrorMessage(res);
    throw new ApiError(message, res.status, details);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

async function safeErrorMessage(res: Response): Promise<{ message: string; details?: unknown }> {
  try {
    const data = await res.json();
    const rawMessage =
      Array.isArray(data?.message) && data.message.length > 0
        ? data.message.join(", ")
        : typeof data?.message === "string"
          ? data.message
          : typeof data?.error === "string"
            ? data.error
            : undefined;

    const friendly = mapFriendlyMessage(res.status, rawMessage);
    return { message: friendly, details: data };
  } catch {
    return { message: mapFriendlyMessage(res.status), details: undefined };
  }
}

function mapFriendlyMessage(status: number, fallback?: string): string {
  if (status === 409) return "Ya existe una cuenta registrada con estas credenciales.";
  if (status === 401) return "Credenciales inválidas.";
  if (status === 400) return "Revisa los datos ingresados.";
  if (status >= 500) return "Error interno, intenta más tarde.";
  return fallback || `Error ${status}`;
}
