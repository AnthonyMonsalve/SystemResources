import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'u',
  'ul',
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
};

export function sanitizePostHtml(value?: string): string | undefined {
  if (!value) return value;
  return sanitizeHtml(value, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  });
}
