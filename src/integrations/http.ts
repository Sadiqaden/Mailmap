import { isAbortError, sleep } from '../utils/async';
import { ProviderError } from './types';

export interface AuthorizedFetchOptions {
  /** Returns a fresh access token (may refresh silently). */
  getToken: () => Promise<string>;
  signal?: AbortSignal;
  /** Retries for 429 / 5xx / rate-limit 403 responses. */
  maxRetries?: number;
  /** Base delay for exponential backoff. Tests set this to 0. */
  baseDelayMs?: number;
  fetchImpl?: typeof fetch;
  /** Only these origins may ever receive the token. */
  allowedOrigins: readonly string[];
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

/** Gmail reports per-user rate limits as 403 with these reasons. */
function isRateLimit403(body: unknown): boolean {
  const text = JSON.stringify(body ?? '');
  return /rateLimitExceeded|userRateLimitExceeded|quotaExceeded/i.test(text);
}

function retryDelayMs(response: Response, attempt: number, baseDelayMs: number): number {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1000, 60_000);
  }
  // Exponential backoff with jitter: 1s, 2s, 4s, 8s (+ up to 25%).
  const exp = baseDelayMs * 2 ** attempt;
  return exp + Math.random() * exp * 0.25;
}

/**
 * GET a JSON resource from a provider API with an OAuth bearer token.
 *
 * - Refuses to send the token to any origin outside `allowedOrigins`.
 * - Retries on rate limits and transient server errors (honouring Retry-After).
 * - Maps failures to `ProviderError` codes. Never logs URLs, tokens or bodies.
 */
export async function authorizedGetJson<T>(
  url: string,
  options: AuthorizedFetchOptions,
): Promise<T> {
  const {
    getToken,
    signal,
    maxRetries = 4,
    baseDelayMs = 1000,
    fetchImpl = fetch,
    allowedOrigins,
  } = options;

  const target = new URL(url);
  if (!allowedOrigins.includes(target.origin)) {
    throw new ProviderError('unknown', 'Refusing to send token to an unexpected origin');
  }

  for (let attempt = 0; ; attempt++) {
    const token = await getToken();
    let response: Response;
    try {
      response = await fetchImpl(target.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal,
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * 2 ** attempt, signal);
        continue;
      }
      throw new ProviderError('network', 'Network request failed');
    }

    if (response.ok) return (await response.json()) as T;

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Error bodies are optional; ignore parse failures.
    }

    const retryable =
      RETRYABLE_STATUS.has(response.status) || (response.status === 403 && isRateLimit403(body));
    if (retryable && attempt < maxRetries) {
      await sleep(retryDelayMs(response, attempt, baseDelayMs), signal);
      continue;
    }

    if (response.status === 401) throw new ProviderError('unauthorized', 'Token rejected', 401);
    if (response.status === 403) {
      throw new ProviderError(
        isRateLimit403(body) ? 'rate-limited' : 'forbidden',
        'Forbidden',
        403,
      );
    }
    if (response.status === 429) throw new ProviderError('rate-limited', 'Rate limited', 429);
    throw new ProviderError('server', `HTTP ${response.status}`, response.status);
  }
}
