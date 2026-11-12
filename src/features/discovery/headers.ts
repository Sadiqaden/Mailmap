/**
 * Parsers for the mailing-list headers Mailmap relies on.
 *
 * Standards:
 *  - RFC 2369: List-Unsubscribe  → `<https://…>, <mailto:…>`
 *  - RFC 8058: List-Unsubscribe-Post → `List-Unsubscribe=One-Click`
 *  - RFC 2919: List-Id → `Optional phrase <list-label.example.com>`
 */

/** At most this many URIs are read from one List-Unsubscribe header. */
const MAX_UNSUBSCRIBE_URIS = 5;

/** Extract the URIs inside angle brackets from a List-Unsubscribe header. */
export function parseListUnsubscribe(header: string | null | undefined): string[] {
  if (!header) return [];
  const uris: string[] = [];
  for (const match of header.matchAll(/<([^<>]*)>/g)) {
    // Header folding can leave whitespace inside a URI; URIs never contain raw whitespace.
    const uri = (match[1] ?? '').replace(/\s+/g, '');
    if (uri) uris.push(uri);
    if (uris.length >= MAX_UNSUBSCRIBE_URIS) break;
  }
  return uris;
}

/** True when the List-Unsubscribe-Post header is exactly the RFC 8058 value. */
export function isOneClickPost(header: string | null | undefined): boolean {
  if (!header) return false;
  return /^\s*List-Unsubscribe\s*=\s*One-Click\s*$/i.test(header);
}

/**
 * Return the list identifier from a List-Id header, lower-cased, or null.
 * `"Nordlys Weekly <weekly.nordlys.example>"` → `"weekly.nordlys.example"`.
 */
export function parseListId(header: string | null | undefined): string | null {
  if (!header) return null;
  const bracketed = /<([^<>]+)>/.exec(header);
  const candidate = (bracketed ? bracketed[1] : header)?.trim().toLowerCase() ?? '';
  // RFC 2919 list-ids are dot-atoms. Reject anything else rather than guess.
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)+$/.test(candidate)) {
    return null;
  }
  return candidate.length > 255 ? null : candidate;
}

/** `Precedence: bulk` / `Precedence: list` are classic bulk-mail markers. */
export function isBulkPrecedence(header: string | null | undefined): boolean {
  if (!header) return false;
  return /^\s*(bulk|list)\s*$/i.test(header);
}

/**
 * Did the *receiving* provider record a passing DKIM signature?
 *
 * RFC 8058 requires one-click requests to be honoured only for DKIM-signed messages.
 * The browser cannot verify DKIM itself, so we read the Authentication-Results header that
 * Gmail/Outlook add on arrival. Providers add their result at the top of the message, so
 * only the first header is passed in. This is a heuristic, not a cryptographic guarantee.
 */
export function hasDkimPass(authenticationResults: string | null | undefined): boolean {
  if (!authenticationResults) return false;
  return /(^|[\s;])dkim\s*=\s*pass\b/i.test(authenticationResults);
}
