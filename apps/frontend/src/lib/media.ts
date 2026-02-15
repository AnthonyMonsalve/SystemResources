const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export function resolveMediaUrl(raw: string): string {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  if (raw.startsWith("file://")) {
    raw = raw.slice("file://".length);
  }
  const normalized = raw.replace(/\\/g, "/");
  const normalizedLower = normalized.toLowerCase();
  if (/^[a-z]:\//i.test(normalized)) {
    const uploadsIndex = normalizedLower.lastIndexOf("/uploads/");
    if (uploadsIndex >= 0) {
      return `${API_BASE_URL}${normalized.slice(uploadsIndex)}`;
    }
  }
  const uploadsIndex = normalized.lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return `${API_BASE_URL}${normalized.slice(uploadsIndex)}`;
  }
  if (normalized.startsWith("/uploads/")) {
    return `${API_BASE_URL}${normalized}`;
  }
  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalized}`;
  }
  const fileName = normalized.split("/").pop() ?? normalized;
  return `${API_BASE_URL}/uploads/${fileName}`;
}
