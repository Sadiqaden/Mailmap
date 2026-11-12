import { throwIfAborted } from '../../utils/async';
import { ProviderError, type FetchMetadataOptions, type MailProvider } from '../types';
import type { OutlookAuth } from './outlookAuth';
import {
  firstMessagesUrl,
  getExcludedFolderIds,
  getMessagesPage,
  isSafeNextLink,
  toMessageMetadata,
} from './outlookClient';

const PAGE_SIZE = 50;

export class OutlookProvider implements MailProvider {
  readonly id = 'outlook' as const;
  readonly isSimulation = false;

  constructor(
    private readonly auth: OutlookAuth,
    readonly accountLabel: string,
  ) {}

  async fetchMessageMetadata({
    maxMessages,
    signal,
    onBatch,
    onProgress,
  }: FetchMetadataOptions): Promise<void> {
    const options = { getToken: this.auth.getAccessToken, signal };
    onProgress(0, maxMessages);

    const excluded = await getExcludedFolderIds(options);
    let url: string | undefined = firstMessagesUrl(Math.min(PAGE_SIZE, maxMessages));
    let processed = 0;
    let sawAnyHeaders = false;

    while (url && processed < maxMessages) {
      throwIfAborted(signal);
      const page = await getMessagesPage(url, options);
      const remaining = maxMessages - processed;
      const messages = page.value.slice(0, remaining);
      processed += messages.length;

      if (messages.some((m) => (m.internetMessageHeaders?.length ?? 0) > 0)) sawAnyHeaders = true;

      onBatch(
        messages
          .filter((m) => !m.parentFolderId || !excluded.has(m.parentFolderId))
          .map(toMessageMetadata),
      );
      onProgress(processed, maxMessages);

      const next = page['@odata.nextLink'];
      url = next && isSafeNextLink(next) ? next : undefined;
    }

    // If Graph returned messages but never any headers, detection cannot work — say so
    // instead of silently reporting "no newsletters". (Can happen with Mail.ReadBasic.)
    if (processed > 0 && !sawAnyHeaders) {
      throw new ProviderError('headers-unavailable', 'No internet message headers returned');
    }
  }

  async disconnect(): Promise<void> {
    await this.auth.signOutLocally();
  }
}
