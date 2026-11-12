import type { MailProvider } from '../../integrations/types';
import { toProviderError } from '../../integrations/types';
import type { MessageMetadata } from '../../types/mail';
import type { Newsletter } from '../../types/newsletter';
import { isAbortError } from '../../utils/async';
import { dedupeMessages, detectNewsletters } from './detect';

export const SCAN_LIMITS = [250, 500, 1000, 2000] as const;
export type ScanLimit = (typeof SCAN_LIMITS)[number];
export const DEFAULT_SCAN_LIMIT: ScanLimit = 500;

export interface ScanResult {
  newsletters: Newsletter[];
  /** Unique messages whose metadata was read. */
  scannedMessages: number;
  /** True when the user cancelled: results cover only the messages read so far. */
  partial: boolean;
  completedAt: number;
}

/**
 * Run a full scan: fetch metadata from the provider, then detect newsletters locally.
 * Cancellation returns the partial result instead of throwing; other errors are
 * converted to `ProviderError`.
 */
export async function runScan(
  provider: MailProvider,
  options: {
    maxMessages: number;
    signal: AbortSignal;
    onProgress: (processed: number, target: number) => void;
    now?: () => number;
  },
): Promise<ScanResult> {
  const { now = Date.now } = options;
  const collected: MessageMetadata[] = [];
  let partial = false;

  try {
    await provider.fetchMessageMetadata({
      maxMessages: options.maxMessages,
      signal: options.signal,
      onBatch: (batch) => collected.push(...batch),
      onProgress: options.onProgress,
    });
  } catch (error) {
    if (!isAbortError(error)) throw toProviderError(error);
    partial = true;
  }

  const unique = dedupeMessages(collected);
  return {
    newsletters: detectNewsletters(unique),
    scannedMessages: unique.length,
    partial,
    completedAt: now(),
  };
}
