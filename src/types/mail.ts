/**
 * Types that describe raw mailbox data as Mailmap receives it from a provider.
 *
 * Every provider (Gmail, Outlook, demo) converts its own API format into
 * `MessageMetadata`, so the rest of the app never needs to know which provider
 * the data came from.
 */

export type ProviderId = 'gmail' | 'outlook' | 'demo';

/** A parsed "From" address. */
export interface Sender {
  /** Display name as written by the sender. Untrusted; always sanitize before showing. */
  name: string;
  /** Lower-cased email address. */
  email: string;
}

/**
 * The only information Mailmap keeps about a single message.
 * Notice what is *not* here: no subject, no body, no snippet, no recipients.
 */
export interface MessageMetadata {
  /** Provider message id, used for de-duplication. */
  id: string;
  /** When the provider received the message (epoch milliseconds). */
  receivedAt: number;
  from: Sender | null;
  /** Raw `List-Unsubscribe` header (RFC 2369), if present. */
  listUnsubscribe: string | null;
  /** Raw `List-Unsubscribe-Post` header (RFC 8058), if present. */
  listUnsubscribePost: string | null;
  /** Raw `List-Id` header (RFC 2919), if present. */
  listId: string | null;
  /** Raw `Precedence` header (non-standard but widely used: "bulk" / "list"). */
  precedence: string | null;
  /** The first (top-most) `Authentication-Results` header, added by the receiving provider. */
  authenticationResults: string | null;
}
