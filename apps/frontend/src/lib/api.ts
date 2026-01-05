const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

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

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
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

  return (await res.json()) as T;
}

async function safeErrorMessage(
  res: Response
): Promise<{ message: string; details?: unknown }> {
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
  if (status === 409)
    return "Ya existe una cuenta registrada con estas credenciales.";
  if (status === 401) return "Credenciales inválidas.";
  if (status === 400) return "Revisa los datos ingresados.";
  if (status >= 500) return "Error interno, intenta más tarde.";
  return fallback || `Error ${status}`;
}
