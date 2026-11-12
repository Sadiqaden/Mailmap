import { describe, expect, it, vi } from 'vitest';
import { authorizedGetJson } from './http';
import { ProviderError } from './types';

const ORIGIN = 'https://api.example.com';
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function setup(...responses: Response[]) {
  const fetchImpl = vi.fn();
  for (const response of responses) fetchImpl.mockResolvedValueOnce(response);
  return {
    fetchImpl,
    options: {
      getToken: () => Promise.resolve('secret-token'),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      allowedOrigins: [ORIGIN],
      baseDelayMs: 0,
    },
  };
}

describe('authorizedGetJson', () => {
  it('sends the bearer token and returns JSON', async () => {
    const { fetchImpl, options } = setup(json({ ok: 1 }));
    await expect(authorizedGetJson(`${ORIGIN}/x`, options)).resolves.toEqual({ ok: 1 });
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer secret-token' });
    expect(init.credentials).toBe('omit');
  });

  it('refuses to send the token to an origin that is not allowed', async () => {
    const { fetchImpl, options } = setup(json({}));
    await expect(authorizedGetJson('https://evil.example/x', options)).rejects.toBeInstanceOf(
      ProviderError,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('retries 429 and 503, then succeeds', async () => {
    const { fetchImpl, options } = setup(
      json({}, 429, { 'Retry-After': '0' }),
      json({}, 503),
      json({ ok: 2 }),
    );
    await expect(authorizedGetJson(`${ORIGIN}/x`, options)).resolves.toEqual({ ok: 2 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('retries Gmail-style 403 rate limits', async () => {
    const { options } = setup(
      json({ error: { errors: [{ reason: 'userRateLimitExceeded' }] } }, 403),
      json({ ok: 3 }),
    );
    await expect(authorizedGetJson(`${ORIGIN}/x`, options)).resolves.toEqual({ ok: 3 });
  });

  it('gives up after max retries with rate-limited', async () => {
    const { options } = setup(...Array.from({ length: 5 }, () => json({}, 429)));
    await expect(
      authorizedGetJson(`${ORIGIN}/x`, { ...options, maxRetries: 2 }),
    ).rejects.toMatchObject({ code: 'rate-limited' });
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'server'],
  ])('maps HTTP %i to %s without retrying', async (status, code) => {
    const { fetchImpl, options } = setup(json({}, status));
    await expect(authorizedGetJson(`${ORIGIN}/x`, options)).rejects.toMatchObject({ code });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('never includes the token in error messages', async () => {
    const { options } = setup(json({}, 401));
    const error = await authorizedGetJson(`${ORIGIN}/x`, options).catch((e: unknown) => e);
    expect(String((error as Error).message)).not.toContain('secret-token');
  });

  it('propagates aborts', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchImpl = vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError'));
    await expect(
      authorizedGetJson(`${ORIGIN}/x`, {
        getToken: () => Promise.resolve('t'),
        fetchImpl,
        allowedOrigins: [ORIGIN],
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
