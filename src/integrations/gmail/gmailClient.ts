import type { MessageMetadata } from '../../types/mail';
import { parseFromHeader } from '../../utils/emailAddress';
import { metadataFromHeaders, REQUESTED_HEADERS, type RawHeader } from '../headerMap';
import { authorizedGetJson, type AuthorizedFetchOptions } from '../http';

export const GMAIL_API_ORIGIN = 'https://gmail.googleapis.com';
const BASE = `${GMAIL_API_ORIGIN}/gmail/v1/users/me`;

type RequestOptions = Omit<AuthorizedFetchOptions, 'allowedOrigins'>;

interface ProfileResponse {
  emailAddress: string;
}

interface ListResponse {
  messages?: { id: string }[];
  nextPageToken?: string;
}

interface MessageResponse {
  id: string;
  internalDate?: string;
  payload?: { headers?: RawHeader[] };
}

function get<T>(url: string, options: RequestOptions): Promise<T> {
  return authorizedGetJson<T>(url, { ...options, allowedOrigins: [GMAIL_API_ORIGIN] });
}

/** users.getProfile — only the address is requested. */
export async function getGmailProfile(options: RequestOptions): Promise<string> {
  const profile = await get<ProfileResponse>(`${BASE}/profile?fields=emailAddress`, options);
  return profile.emailAddress;
}

/**
 * users.messages.list — returns ids only, newest first.
 * Note: the `q` search parameter is NOT available with the gmail.metadata scope, so we
 * cannot ask Gmail for "only newsletters"; we scan recent messages and filter locally.
 * Spam and Trash are excluded (includeSpamTrash defaults to false).
 */
export async function listGmailMessageIds(
  pageToken: string | undefined,
  pageSize: number,
  options: RequestOptions,
): Promise<{ ids: string[]; nextPageToken: string | undefined }> {
  const params = new URLSearchParams({
    maxResults: String(pageSize),
    fields: 'messages/id,nextPageToken',
  });
  if (pageToken) params.set('pageToken', pageToken);
  const response = await get<ListResponse>(`${BASE}/messages?${params}`, options);
  return {
    ids: (response.messages ?? []).map((m) => m.id),
    nextPageToken: response.nextPageToken,
  };
}

/**
 * users.messages.get with format=metadata. `metadataHeaders` restricts the headers
 * returned, and `fields` drops everything else (including the snippet).
 */
export async function getGmailMessageMetadata(
  id: string,
  options: RequestOptions,
): Promise<MessageMetadata> {
  const params = new URLSearchParams({
    format: 'metadata',
    fields: 'id,internalDate,payload/headers',
  });
  for (const header of REQUESTED_HEADERS) params.append('metadataHeaders', header);

  const message = await get<MessageResponse>(
    `${BASE}/messages/${encodeURIComponent(id)}?${params}`,
    options,
  );
  const headers = message.payload?.headers ?? [];
  const from = parseFromHeader(headers.find((h) => h.name.toLowerCase() === 'from')?.value);
  const receivedAt = Number(message.internalDate ?? 0);
  return metadataFromHeaders(
    message.id,
    Number.isFinite(receivedAt) ? receivedAt : 0,
    from,
    headers,
  );
}
