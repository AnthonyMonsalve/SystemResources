import sanitizeHtml from 'sanitize-html';

// Subconjunto más restrictivo que posts - sin blockquote ni pre
const ALLOWED_TAGS = [
  'a',
  'b',
  'br',
  'code',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'strong',
  'u',
  'ul',
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
};

export function sanitizeCommentHtml(value?: string): string {
  if (!value) return '';
  return sanitizeHtml(value, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  });
}
