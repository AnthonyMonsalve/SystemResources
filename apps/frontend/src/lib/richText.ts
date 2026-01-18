import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "u",
  "ul",
];

const ALLOWED_ATTR = {
  a: ["href", "target", "rel"],
};

export function sanitizeHtml(value: string): string {
  if (!value) return "";
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

export function htmlToText(value: string): string {
  if (!value) return "";
  const sanitized = sanitizeHtml(value);
  if (typeof document === "undefined") {
    return sanitized.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const container = document.createElement("div");
  container.innerHTML = sanitized;
  return (container.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}
