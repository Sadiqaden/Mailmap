/**
 * Helpers for handling untrusted text from email headers.
 *
 * React already escapes text, so HTML injection is not the risk here. The risks are:
 *  - control characters and line breaks that break layout,
 *  - Unicode bidirectional overrides that make "evil.com" look like "moc.live",
 *  - invisible zero-width characters used to spoof names,
 *  - extremely long values.
 */

// C0/C1 control characters (includes CR/LF/TAB).
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;
// Bidirectional formatting characters (LRE, RLE, PDF, LRO, RLO, LRI, RLI, FSI, PDI, LRM, RLM, ALM).
const BIDI_CHARS = /[\u202A-\u202E\u2066-\u2069\u200E\u200F\u061C]/g;
// Zero-width and BOM characters.
const INVISIBLE_CHARS = /[\u200B-\u200D\u2060\uFEFF]/g;

/** Make an untrusted header value safe to display as plain text. */
export function sanitizeDisplayText(value: string, maxLength = 80): string {
  const cleaned = value
    .replace(CONTROL_CHARS, ' ')
    .replace(BIDI_CHARS, '')
    .replace(INVISIBLE_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Lower-case and strip accents so "Bokhylla" matches "bøkhylla"-style searches loosely. */
export function normalizeForSearch(value: string): string {
  return value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Up to two initials for an avatar. Falls back to "?" when nothing usable exists. */
export function initialsFor(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]?.[0] ?? '';
  const second = words.length > 1 ? (words[1]?.[0] ?? '') : (words[0]?.[1] ?? '');
  return (first + second).toUpperCase() || '?';
}

/** Small deterministic hash (FNV-1a) used to pick avatar colours. Not for security. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
