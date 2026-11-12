import type { MessageMetadata } from '../../types/mail';
import { isPlausibleEmail } from '../../utils/emailAddress';
import { sanitizeDisplayText } from '../../utils/text';
import { metadataFromHeaders, type RawHeader } from '../headerMap';
import { authorizedGetJson, type AuthorizedFetchOptions } from '../http';

export const GRAPH_ORIGIN = 'https://graph.microsoft.com';
const BASE = `${GRAPH_ORIGIN}/v1.0/me`;

type RequestOptions = Omit<AuthorizedFetchOptions, 'allowedOrigins'>;

export interface GraphMessage {
  id: string;
  receivedDateTime?: string;
  parentFolderId?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  internetMessageHeaders?: RawHeader[];
}

interface GraphPage {
  value: GraphMessage[];
  '@odata.nextLink'?: string;
}

function get<T>(url: string, options: RequestOptions): Promise<T> {
  return authorizedGetJson<T>(url, { ...options, allowedOrigins: [GRAPH_ORIGIN] });
}

/**
 * Only follow pagination links that point back to Graph. A tampered response must
 * never make us send the bearer token somewhere else.
 */
export function isSafeNextLink(link: string): boolean {
  try {
    const url = new URL(link);
    return url.origin === GRAPH_ORIGIN && url.pathname.startsWith('/v1.0/me/messages');
  } catch {
    return false;
  }
}

/** Ids of Junk Email and Deleted Items, which we skip (`/me/messages` includes all folders). */
export async function getExcludedFolderIds(options: RequestOptions): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const name of ['junkemail', 'deleteditems']) {
    try {
      const folder = await get<{ id: string }>(`${BASE}/mailFolders/${name}?$select=id`, options);
      ids.add(folder.id);
    } catch {
      // Non-fatal: if a folder lookup fails we simply don't exclude it.
    }
  }
  return ids;
}

/**
 * The first page URL. `$select` limits the response to sender, date, folder and the
 * internet headers. Body, bodyPreview, subject and recipients are never requested.
 */
export function firstMessagesUrl(pageSize: number): string {
  const params = new URLSearchParams({
    $select: 'id,from,receivedDateTime,parentFolderId,internetMessageHeaders',
    $orderby: 'receivedDateTime desc',
    $top: String(pageSize),
  });
  return `${BASE}/messages?${params}`;
}

export async function getMessagesPage(url: string, options: RequestOptions): Promise<GraphPage> {
  return get<GraphPage>(url, options);
}

/** Convert a Graph message to Mailmap's provider-neutral metadata. */
export function toMessageMetadata(message: GraphMessage): MessageMetadata {
  const address = message.from?.emailAddress?.address?.trim().toLowerCase() ?? '';
  const from = isPlausibleEmail(address)
    ? { email: address, name: sanitizeDisplayText(message.from?.emailAddress?.name ?? '') }
    : null;
  const receivedAt = message.receivedDateTime ? Date.parse(message.receivedDateTime) : 0;
  return metadataFromHeaders(
    message.id,
    Number.isFinite(receivedAt) ? receivedAt : 0,
    from,
    message.internetMessageHeaders ?? [],
  );
}
