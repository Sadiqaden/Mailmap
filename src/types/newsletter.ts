/**
 * Types for detected newsletters and unsubscribe handling.
 */

/** How sure we are that a sender is a newsletter / mailing list. */
export type Confidence = 'high' | 'medium' | 'low';

/** Why a sender was classified as a newsletter. */
export type DetectionSignal = 'list-unsubscribe' | 'list-id' | 'precedence' | 'sender-pattern';

/** A rough estimate, computed from the dates of the scanned messages only. */
export type FrequencyEstimate = 'daily' | 'weekly' | 'monthly' | 'occasional' | 'unknown';

/**
 * A *validated* way to unsubscribe. Values here have already passed URL checks
 * in `utils/url.ts`; anything that failed validation is simply not represented.
 */
export type UnsubscribeMethod =
  /** RFC 8058: an HTTPS POST that the sender promises will unsubscribe without further interaction. */
  | { kind: 'one-click'; url: string; host: string }
  /** A web page the user must open and complete themselves. */
  | { kind: 'web'; url: string; host: string; insecure: boolean }
  /** An email the user must send themselves (Mailmap has no permission to send email). */
  | { kind: 'mailto'; address: string; subject: string; body: string; href: string };

export type UnsubscribeKind = UnsubscribeMethod['kind'] | 'none';

export interface UnsubscribeOptions {
  /** The best available method, or null when nothing safe was found. */
  primary: UnsubscribeMethod | null;
  /** Other valid methods advertised by the sender. */
  alternatives: UnsubscribeMethod[];
  /** Number of advertised URIs that were rejected by validation (e.g. `javascript:`). */
  rejectedCount: number;
}

/** One newsletter sender (or mailing list) grouped from many messages. */
export interface Newsletter {
  /** Stable grouping key, e.g. `list:news.example.com` or `sender:news@example.com`. */
  key: string;
  /** Sanitized display name. */
  name: string;
  email: string;
  domain: string;
  listId: string | null;
  messageCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
  frequency: FrequencyEstimate;
  confidence: Confidence;
  signals: DetectionSignal[];
  unsubscribe: UnsubscribeOptions;
}

/**
 * What happened when the user tried to unsubscribe. These states are deliberately
 * honest: none of them means "confirmed unsubscribed", because Mailmap cannot know that.
 */
export type UnsubscribeOutcome =
  | { status: 'sending' }
  /** A one-click POST left the browser. The response is unreadable (no-cors), so success is unconfirmed. */
  | { status: 'request-sent'; at: number }
  /** The user opened the sender's unsubscribe page and has to finish there. */
  | { status: 'page-opened'; at: number }
  /** The user's email app was opened with a prefilled unsubscribe email; they must send it. */
  | { status: 'manual-required'; at: number }
  /** The request could not be sent. */
  | { status: 'failed'; reason: 'network' | 'timeout' | 'invalid-url' }
  /** Demo mode only: nothing was sent anywhere. */
  | { status: 'simulated'; kind: UnsubscribeKind; at: number };
