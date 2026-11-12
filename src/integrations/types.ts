import type { MessageMetadata, ProviderId } from '../types/mail';

export interface FetchMetadataOptions {
  /** Stop after this many messages (newest first). */
  maxMessages: number;
  signal: AbortSignal;
  /** Called with each batch as soon as it arrives, so partial results survive cancellation. */
  onBatch: (messages: MessageMetadata[]) => void;
  /** Progress in messages processed so far. */
  onProgress: (processed: number, target: number) => void;
}

/**
 * The application-facing interface every mail provider implements.
 * UI code only ever talks to this interface, never to Gmail/Graph directly.
 */
export interface MailProvider {
  readonly id: ProviderId;
  /** True for demo mode: no real mailbox, no real network requests. */
  readonly isSimulation: boolean;
  /** The signed-in account, e.g. "ola@example.com". */
  readonly accountLabel: string;
  fetchMessageMetadata(options: FetchMetadataOptions): Promise<void>;
  /** Forget tokens (and revoke them where the provider allows it from the browser). */
  disconnect(): Promise<void>;
}

export type ProviderErrorCode =
  | 'not-configured'
  | 'script-load-failed'
  | 'popup-blocked'
  | 'cancelled'
  | 'consent-denied'
  | 'scope-missing'
  | 'unauthorized'
  | 'forbidden'
  | 'rate-limited'
  | 'network'
  | 'server'
  | 'headers-unavailable'
  | 'unknown';

/**
 * Errors thrown by provider code. The message is for developers only and must
 * never contain tokens or mailbox content; the UI shows a translated text per `code`.
 */
export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly status: number | undefined;

  constructor(code: ProviderErrorCode, message?: string, status?: number) {
    super(message ?? code);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
  }
}

export function toProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  if (error instanceof TypeError) return new ProviderError('network', 'Network request failed');
  return new ProviderError('unknown', 'Unexpected error');
}
