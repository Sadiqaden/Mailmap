import { describe, expect, it, vi } from 'vitest';
import { newsletter } from '../../test/fixtures';
import { partitionForBulk } from './bulk';
import { classifyUnsubscribe } from './classify';
import { sendOneClickRequest } from './oneClick';

const DKIM_PASS = 'mx.google.com; dkim=pass header.i=@example.com';
const ONE_CLICK = 'List-Unsubscribe=One-Click';

describe('classifyUnsubscribe', () => {
  it('offers one-click only with https + RFC 8058 header + DKIM pass', () => {
    const result = classifyUnsubscribe({
      listUnsubscribe: '<https://example.com/u>',
      listUnsubscribePost: ONE_CLICK,
      authenticationResults: DKIM_PASS,
    });
    expect(result.primary).toEqual({
      kind: 'one-click',
      url: 'https://example.com/u',
      host: 'example.com',
    });
  });

  it('downgrades to a web page without DKIM pass', () => {
    const result = classifyUnsubscribe({
      listUnsubscribe: '<https://example.com/u>',
      listUnsubscribePost: ONE_CLICK,
      authenticationResults: 'mx; dkim=fail',
    });
    expect(result.primary?.kind).toBe('web');
  });

  it('downgrades to a web page without the List-Unsubscribe-Post header', () => {
    const result = classifyUnsubscribe({
      listUnsubscribe: '<https://example.com/u>',
      listUnsubscribePost: null,
      authenticationResults: DKIM_PASS,
    });
    expect(result.primary).toMatchObject({ kind: 'web', insecure: false });
  });

  it('never offers one-click over plain http', () => {
    const result = classifyUnsubscribe({
      listUnsubscribe: '<http://example.com/u>',
      listUnsubscribePost: ONE_CLICK,
      authenticationResults: DKIM_PASS,
    });
    expect(result.primary).toMatchObject({ kind: 'web', insecure: true });
  });

  it('ranks one-click > https page > mailto > http page', () => {
    const result = classifyUnsubscribe({
      listUnsubscribe:
        '<http://a.example.com/u>, <mailto:l@example.com>, <https://b.example.com/u>',
      listUnsubscribePost: null,
      authenticationResults: null,
    });
    expect([result.primary, ...result.alternatives].map((m) => m?.kind)).toEqual([
      'web',
      'mailto',
      'web',
    ]);
    expect(result.primary).toMatchObject({ host: 'b.example.com' });
  });

  it('rejects unsafe URIs and counts them', () => {
    const result = classifyUnsubscribe({
      listUnsubscribe: '<javascript:alert(1)>, <https://192.168.0.1/u>, <data:text/html,x>',
      listUnsubscribePost: ONE_CLICK,
      authenticationResults: DKIM_PASS,
    });
    expect(result).toEqual({ primary: null, alternatives: [], rejectedCount: 3 });
  });

  it('returns no method when there is no header', () => {
    expect(
      classifyUnsubscribe({
        listUnsubscribe: null,
        listUnsubscribePost: null,
        authenticationResults: null,
      }),
    ).toEqual({
      primary: null,
      alternatives: [],
      rejectedCount: 0,
    });
  });
});

describe('sendOneClickRequest', () => {
  const method = {
    kind: 'one-click' as const,
    url: 'https://example.com/u?id=1',
    host: 'example.com',
  };

  it('sends an RFC 8058 POST without credentials, referrer or tokens', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    const outcome = await sendOneClickRequest(method, { fetchImpl, now: () => 42 });

    expect(outcome).toEqual({ status: 'request-sent', at: 42 });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.com/u?id=1');
    expect(init).toMatchObject({
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: 'List-Unsubscribe=One-Click',
    });
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization/i);
  });

  it('reports network failures honestly', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await sendOneClickRequest(method, { fetchImpl })).toEqual({
      status: 'failed',
      reason: 'network',
    });
  });

  it('times out', async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    expect(
      await sendOneClickRequest(method, { fetchImpl: fetchImpl as typeof fetch, timeoutMs: 5 }),
    ).toEqual({
      status: 'failed',
      reason: 'timeout',
    });
  });

  it('re-validates the URL and refuses unsafe targets without sending anything', async () => {
    const fetchImpl = vi.fn();
    const outcome = await sendOneClickRequest(
      { ...method, url: 'https://127.0.0.1/u' },
      { fetchImpl },
    );
    expect(outcome).toEqual({ status: 'failed', reason: 'invalid-url' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('partitionForBulk', () => {
  it('splits by available method', () => {
    const oneClick = newsletter({ key: 'a' });
    const web = newsletter({
      key: 'b',
      unsubscribe: {
        primary: { kind: 'web', url: 'https://x.example/u', host: 'x.example', insecure: false },
        alternatives: [],
        rejectedCount: 0,
      },
    });
    const none = newsletter({
      key: 'c',
      unsubscribe: { primary: null, alternatives: [], rejectedCount: 0 },
    });
    const result = partitionForBulk([oneClick, web, none]);
    expect(result.oneClick.map((n) => n.key)).toEqual(['a']);
    expect(result.manual.map((n) => n.key)).toEqual(['b']);
    expect(result.unavailable.map((n) => n.key)).toEqual(['c']);
  });
});
