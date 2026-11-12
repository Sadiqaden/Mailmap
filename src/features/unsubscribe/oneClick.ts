import type { UnsubscribeMethod, UnsubscribeOutcome } from '../../types/newsletter';
import { checkHttpUrl } from '../../utils/url';

export interface OneClickOptions {
  /** Injected in tests. Defaults to the browser's fetch. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  now?: () => number;
}

/**
 * Send an RFC 8058 one-click unsubscribe request.
 *
 * Only call this after the user has explicitly confirmed.
 *
 * How the request is made, and why:
 *  - `method: POST` with body `List-Unsubscribe=One-Click`, exactly as RFC 8058 specifies.
 *  - `mode: 'no-cors'`: the sender's server almost never allows cross-origin reads, so we
 *    send a "simple" request whose response we deliberately cannot read. That is why the
 *    result is "request sent", never "unsubscribed".
 *  - `credentials: 'omit'`: no cookies (RFC 8058 says the POST must not need them).
 *  - `referrerPolicy: 'no-referrer'`: the sender does not learn which page sent it.
 *  - No Authorization header — OAuth tokens never leave for third-party hosts.
 */
export async function sendOneClickRequest(
  method: Extract<UnsubscribeMethod, { kind: 'one-click' }>,
  options: OneClickOptions = {},
): Promise<UnsubscribeOutcome> {
  const { fetchImpl = fetch, timeoutMs = 15_000, now = Date.now } = options;

  // Defense in depth: re-validate even though classification already did.
  const check = checkHttpUrl(method.url, { allowHttp: false });
  if (!check.ok) return { status: 'failed', reason: 'invalid-url' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetchImpl(check.url.toString(), {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
      signal: controller.signal,
    });
    return { status: 'request-sent', at: now() };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    return { status: 'failed', reason: timedOut ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}
