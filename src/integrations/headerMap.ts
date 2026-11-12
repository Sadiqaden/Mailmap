import type { MessageMetadata, Sender } from '../types/mail';

export interface RawHeader {
  name: string;
  value: string;
}

/** The headers Mailmap asks providers for. Nothing else is requested. */
export const REQUESTED_HEADERS = [
  'From',
  'List-Unsubscribe',
  'List-Unsubscribe-Post',
  'List-Id',
  'Precedence',
  'Authentication-Results',
] as const;

/** First value of a header, case-insensitively. */
export function firstHeader(headers: readonly RawHeader[], name: string): string | null {
  const lower = name.toLowerCase();
  const found = headers.find((h) => h.name.toLowerCase() === lower);
  return found ? found.value : null;
}

/** Build the provider-neutral metadata record from a header list. */
export function metadataFromHeaders(
  id: string,
  receivedAt: number,
  from: Sender | null,
  headers: readonly RawHeader[],
): MessageMetadata {
  return {
    id,
    receivedAt,
    from,
    listUnsubscribe: firstHeader(headers, 'List-Unsubscribe'),
    listUnsubscribePost: firstHeader(headers, 'List-Unsubscribe-Post'),
    listId: firstHeader(headers, 'List-Id'),
    precedence: firstHeader(headers, 'Precedence'),
    authenticationResults: firstHeader(headers, 'Authentication-Results'),
  };
}
