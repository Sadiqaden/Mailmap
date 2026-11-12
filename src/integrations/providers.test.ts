/**
 * Provider integration tests with mocked Gmail and Microsoft Graph responses.
 * They check request shapes (least data requested) and response mapping, without
 * any real credentials or network access.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MessageMetadata } from '../types/mail';
import { GmailProvider } from './gmail/gmailProvider';
import type { OutlookAuth } from './outlook/outlookAuth';
import { isSafeNextLink, toMessageMetadata } from './outlook/outlookClient';
import { OutlookProvider } from './outlook/outlookProvider';

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

function requestedUrls(): URL[] {
  return fetchMock.mock.calls.map(([url]) => new URL(String(url)));
}

async function collect(
  provider: { fetchMessageMetadata: GmailProvider['fetchMessageMetadata'] },
  maxMessages: number,
) {
  const messages: MessageMetadata[] = [];
  await provider.fetchMessageMetadata({
    maxMessages,
    signal: new AbortController().signal,
    onBatch: (batch) => messages.push(...batch),
    onProgress: () => {},
  });
  return messages;
}

describe('GmailProvider', () => {
  const token = { accessToken: 'gmail-token', expiresAt: Date.now() + 3_600_000 };

  function routeGmail(url: URL): Response {
    if (url.pathname.endsWith('/profile')) return json({ emailAddress: 'ola@example.com' });
    if (url.pathname.endsWith('/messages')) {
      return url.searchParams.get('pageToken')
        ? json({ messages: [{ id: 'm3' }] })
        : json({ messages: [{ id: 'm1' }, { id: 'm2' }], nextPageToken: 'p2' });
    }
    const id = url.pathname.split('/').pop();
    return json({
      id,
      internalDate: '1762000000000',
      payload: {
        headers: [
          { name: 'From', value: '"Nordlys" <weekly@nordlys.example>' },
          { name: 'List-Unsubscribe', value: '<https://nordlys.example/u>' },
          { name: 'Authentication-Results', value: 'mx.google.com; dkim=pass' },
          { name: 'Authentication-Results', value: 'forged; dkim=pass' },
        ],
      },
    });
  }

  beforeEach(() => {
    // Block body on purpose: a function returned from beforeEach is treated as a cleanup hook.
    fetchMock.mockImplementation((url: string) => Promise.resolve(routeGmail(new URL(url))));
  });

  it('looks up the account address on creation', async () => {
    const provider = await GmailProvider.create(token);
    expect(provider.accountLabel).toBe('ola@example.com');
  });

  it('paginates, requests metadata only, and maps headers', async () => {
    const provider = await GmailProvider.create(token);
    const messages = await collect(provider, 10);

    expect(messages.map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
    expect(messages[0]).toMatchObject({
      receivedAt: 1762000000000,
      from: { name: 'Nordlys', email: 'weekly@nordlys.example' },
      listUnsubscribe: '<https://nordlys.example/u>',
      authenticationResults: 'mx.google.com; dkim=pass', // first (provider-added) header only
    });

    const getRequests = requestedUrls().filter((u) => /\/messages\/m\d$/.test(u.pathname));
    for (const url of getRequests) {
      expect(url.origin).toBe('https://gmail.googleapis.com');
      expect(url.searchParams.get('format')).toBe('metadata');
      expect(url.searchParams.get('fields')).toBe('id,internalDate,payload/headers');
      expect(url.searchParams.getAll('metadataHeaders')).not.toContain('Subject');
    }
    // No request uses the `q` parameter, which the metadata scope does not allow.
    expect(requestedUrls().some((u) => u.searchParams.has('q'))).toBe(false);
  });

  it('respects maxMessages', async () => {
    const provider = await GmailProvider.create(token);
    const messages = await collect(provider, 2);
    expect(messages).toHaveLength(2);
    const list = requestedUrls().find((u) => u.pathname.endsWith('/messages'));
    expect(list?.searchParams.get('maxResults')).toBe('2');
  });

  it('fails with "unauthorized" once the token has expired', async () => {
    const provider = await GmailProvider.create({ accessToken: 't', expiresAt: Date.now() - 1 });
    await expect(collect(provider, 5)).rejects.toMatchObject({ code: 'unauthorized' });
  });
});

describe('OutlookProvider', () => {
  const auth = {
    getAccessToken: () => Promise.resolve('graph-token'),
    signOutLocally: vi.fn(() => Promise.resolve()),
  } as unknown as OutlookAuth;

  const graphMessage = (id: string, folder: string, headers = true) => ({
    id,
    receivedDateTime: '2026-11-01T10:00:00Z',
    parentFolderId: folder,
    from: { emailAddress: { name: 'Data Dispatch', address: 'Dispatch@DataDispatch.example' } },
    internetMessageHeaders: headers
      ? [{ name: 'List-Id', value: '<dispatch.datadispatch.example>' }]
      : undefined,
  });

  function routeGraph(url: URL, pages: Record<string, unknown>[]): Response {
    if (url.pathname.endsWith('/mailFolders/junkemail')) return json({ id: 'JUNK' });
    if (url.pathname.endsWith('/mailFolders/deleteditems')) return json({ id: 'TRASH' });
    const page = url.searchParams.get('page') ?? '0';
    return json(pages[Number(page)]);
  }

  it('selects only the needed fields, follows safe next links and skips junk/trash', async () => {
    const pages = [
      {
        value: [graphMessage('a', 'INBOX'), graphMessage('b', 'JUNK')],
        '@odata.nextLink': 'https://graph.microsoft.com/v1.0/me/messages?page=1',
      },
      { value: [graphMessage('c', 'TRASH'), graphMessage('d', 'ARCHIVE')] },
    ];
    fetchMock.mockImplementation((url: string) => Promise.resolve(routeGraph(new URL(url), pages)));

    const messages = await collect(new OutlookProvider(auth, 'ola@example.com'), 100);
    expect(messages.map((m) => m.id)).toEqual(['a', 'd']);
    expect(messages[0]).toMatchObject({
      from: { email: 'dispatch@datadispatch.example' },
      listId: '<dispatch.datadispatch.example>',
    });

    const first = requestedUrls().find((u) => u.pathname.endsWith('/me/messages'));
    expect(first?.searchParams.get('$select')).toBe(
      'id,from,receivedDateTime,parentFolderId,internetMessageHeaders',
    );
    expect(first?.searchParams.get('$select')).not.toMatch(/body|subject/i);
  });

  it('does not follow a nextLink that points outside Microsoft Graph', async () => {
    const pages = [
      { value: [graphMessage('a', 'INBOX')], '@odata.nextLink': 'https://evil.example/steal' },
    ];
    fetchMock.mockImplementation((url: string) => Promise.resolve(routeGraph(new URL(url), pages)));
    await collect(new OutlookProvider(auth, 'x'), 100);
    expect(requestedUrls().some((u) => u.hostname === 'evil.example')).toBe(false);
  });

  it('reports headers-unavailable when Graph returns no headers at all', async () => {
    const pages = [{ value: [graphMessage('a', 'INBOX', false)] }];
    fetchMock.mockImplementation((url: string) => Promise.resolve(routeGraph(new URL(url), pages)));
    await expect(collect(new OutlookProvider(auth, 'x'), 100)).rejects.toMatchObject({
      code: 'headers-unavailable',
    });
  });

  it('isSafeNextLink only allows Graph message URLs', () => {
    expect(isSafeNextLink('https://graph.microsoft.com/v1.0/me/messages?$skip=50')).toBe(true);
    expect(isSafeNextLink('https://graph.microsoft.com.evil.example/v1.0/me/messages')).toBe(false);
    expect(isSafeNextLink('https://graph.microsoft.com/v1.0/users/other/messages')).toBe(false);
    expect(isSafeNextLink('not a url')).toBe(false);
  });

  it('toMessageMetadata drops invalid sender addresses', () => {
    const result = toMessageMetadata({ id: 'x', from: { emailAddress: { address: 'nope' } } });
    expect(result.from).toBeNull();
  });
});
