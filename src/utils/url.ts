/**
 * Validation for URLs that come from email headers.
 *
 * Every unsubscribe URL is attacker-controllable: anyone can send an email with any
 * `List-Unsubscribe` header. These checks decide whether Mailmap is willing to show or
 * use a URL at all. They do NOT make a URL trustworthy — they only rule out the
 * clearly dangerous cases.
 */

import { isPlausibleEmail } from './emailAddress';

export const MAX_URL_LENGTH = 2048;

export type UrlRejection =
  'too-long' | 'unparseable' | 'scheme' | 'credentials' | 'host' | 'port' | 'address';

export type HttpUrlResult =
  { ok: true; url: URL; insecure: boolean } | { ok: false; reason: UrlRejection };

/** Host names that point at the user's own machine or local network. */
const LOCAL_HOST_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.lan',
  '.home.arpa',
  '.intranet',
];

function isIpLiteral(hostname: string): boolean {
  // IPv6 literals are bracketed by the URL parser; IPv4 (and odd forms like 0x7f.1) end up dotted/numeric.
  if (hostname.startsWith('[')) return true;
  if (/^[0-9.]+$/.test(hostname)) return true;
  if (/^0x[0-9a-f]+/i.test(hostname)) return true;
  return false;
}

/**
 * Check an http(s) URL.
 *
 * Rejects:
 *  - anything that is not http:/https: (javascript:, data:, file:, ...)
 *  - embedded credentials (`https://user:pass@host`)
 *  - IP addresses, `localhost`, single-label and local-network host names
 *    (prevents using the user's browser to poke at their router or intranet)
 *  - non-default ports
 *  - URLs longer than 2048 characters
 */
export function checkHttpUrl(raw: string, options: { allowHttp: boolean }): HttpUrlResult {
  const value = raw.trim();
  if (value.length > MAX_URL_LENGTH) return { ok: false, reason: 'too-long' };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: 'unparseable' };
  }

  const isHttps = url.protocol === 'https:';
  const isHttp = url.protocol === 'http:';
  if (!isHttps && !(options.allowHttp && isHttp)) return { ok: false, reason: 'scheme' };
  if (url.username || url.password) return { ok: false, reason: 'credentials' };

  const host = url.hostname.toLowerCase();
  if (
    !host ||
    !host.includes('.') ||
    host === 'localhost' ||
    isIpLiteral(host) ||
    LOCAL_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
  ) {
    return { ok: false, reason: 'host' };
  }

  // URL normalizes default ports to "", so any value here is a non-default port.
  if (url.port !== '') return { ok: false, reason: 'port' };

  return { ok: true, url, insecure: isHttp };
}

export type MailtoResult =
  | { ok: true; address: string; subject: string; body: string; href: string }
  | { ok: false; reason: UrlRejection };

const MAX_MAILTO_FIELD = 300;

function cleanMailtoField(value: string | null): string {
  if (!value) return '';
  // Keep line breaks in the body readable but drop other control characters.
  // eslint-disable-next-line no-control-regex -- stripping control characters is the point
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').slice(0, MAX_MAILTO_FIELD);
}

/**
 * Check a `mailto:` URI and rebuild it from scratch.
 *
 * Only a single recipient plus `subject` and `body` are kept. Extra recipients such as
 * `cc`/`bcc` are dropped so a sender cannot make the user email unexpected people.
 */
export function checkMailtoUrl(raw: string): MailtoResult {
  const value = raw.trim();
  if (value.length > MAX_URL_LENGTH) return { ok: false, reason: 'too-long' };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: 'unparseable' };
  }
  if (url.protocol !== 'mailto:') return { ok: false, reason: 'scheme' };

  let address: string;
  try {
    address = decodeURIComponent(url.pathname).trim().toLowerCase();
  } catch {
    return { ok: false, reason: 'unparseable' };
  }
  if (!isPlausibleEmail(address)) return { ok: false, reason: 'address' };

  const subject = cleanMailtoField(url.searchParams.get('subject')) || 'unsubscribe';
  const body = cleanMailtoField(url.searchParams.get('body'));

  const params = [`subject=${encodeURIComponent(subject)}`];
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const [local = '', domain = ''] = address.split('@');
  const href = `mailto:${encodeURIComponent(local)}@${domain}?${params.join('&')}`;

  return { ok: true, address, subject, body, href };
}
