import type { Sender } from '../types/mail';
import { sanitizeDisplayText } from './text';

const EMAIL_PATTERN = /^[^\s@<>()[\]",;:\\]+@[^\s@<>()[\]",;:\\]+\.[^\s@<>()[\]",;:\\]+$/;

/** A deliberately simple check: "looks like a single address", not full RFC 5322. */
export function isPlausibleEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

/** The part after "@", lower-cased. */
export function domainOf(email: string): string {
  const at = email.lastIndexOf('@');
  return at === -1 ? '' : email.slice(at + 1).toLowerCase();
}

/** The part before "@", lower-cased. */
export function localPartOf(email: string): string {
  const at = email.lastIndexOf('@');
  return at === -1 ? email.toLowerCase() : email.slice(0, at).toLowerCase();
}

/**
 * Decode RFC 2047 "encoded words", e.g. `=?UTF-8?B?Tm9yZGx5cw==?=`.
 * Gmail usually returns headers already decoded, but not always, so we handle both.
 */
export function decodeEncodedWords(value: string): string {
  return value
    .replace(/\?=\s+=\?/g, '?==?') // whitespace between adjacent encoded words is ignored
    .replace(
      /=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g,
      (match, charset: string, encoding: string, text: string) => {
        try {
          const bytes =
            encoding.toUpperCase() === 'B' ? base64ToBytes(text) : quotedPrintableToBytes(text);
          return new TextDecoder(charset.toLowerCase(), { fatal: false }).decode(bytes);
        } catch {
          return match; // unknown charset or malformed input: leave it as-is
        }
      },
    );
}

function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function quotedPrintableToBytes(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '_') {
      bytes.push(0x20);
    } else if (char === '=' && /^[0-9A-Fa-f]{2}$/.test(text.slice(i + 1, i + 3))) {
      bytes.push(parseInt(text.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(text.charCodeAt(i) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Parse a "From" header into a display name and address.
 * Supports `"Name" <a@b.c>`, `Name <a@b.c>`, `<a@b.c>`, `a@b.c` and `a@b.c (Name)`.
 * Returns null when no plausible address is found.
 */
export function parseFromHeader(raw: string | null | undefined): Sender | null {
  if (!raw) return null;
  const value = decodeEncodedWords(raw).trim();

  let name = '';
  let email = '';

  const angle = /^(.*)<([^<>]+)>\s*$/.exec(value);
  if (angle) {
    name = angle[1] ?? '';
    email = angle[2] ?? '';
  } else {
    const comment = /^(\S+@\S+)\s*\((.*)\)\s*$/.exec(value);
    if (comment) {
      email = comment[1] ?? '';
      name = comment[2] ?? '';
    } else {
      email = value;
    }
  }

  email = email.trim().toLowerCase();
  if (!isPlausibleEmail(email)) return null;

  const cleanName = sanitizeDisplayText(name.replace(/\\(.)/g, '$1'));
  return { name: cleanName, email };
}
