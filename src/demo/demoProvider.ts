import type { FetchMetadataOptions, MailProvider } from '../integrations/types';
import { sleep, throwIfAborted } from '../utils/async';
import { generateDemoMessages } from './demoData';

/**
 * A provider that serves the synthetic mailbox. It never touches the network.
 * Batches are delivered with a small delay so the progress UI can be seen and tested.
 */
export class DemoProvider implements MailProvider {
  readonly id = 'demo' as const;
  readonly isSimulation = true;
  readonly accountLabel = 'demo@mailmap.example';

  constructor(private readonly options: { batchDelayMs?: number; now?: () => number } = {}) {}

  async fetchMessageMetadata({
    maxMessages,
    signal,
    onBatch,
    onProgress,
  }: FetchMetadataOptions): Promise<void> {
    const { batchDelayMs = 120, now = Date.now } = this.options;
    const all = generateDemoMessages(now()).slice(0, maxMessages);
    const target = Math.min(maxMessages, all.length);
    const batchSize = Math.ceil(target / 8) || 1;

    onProgress(0, target);
    for (let start = 0; start < all.length; start += batchSize) {
      throwIfAborted(signal);
      await sleep(batchDelayMs, signal);
      const batch = all.slice(start, start + batchSize);
      onBatch(batch);
      onProgress(Math.min(start + batch.length, target), target);
    }
  }

  async disconnect(): Promise<void> {
    // Nothing to revoke: no account was ever connected.
  }
}
