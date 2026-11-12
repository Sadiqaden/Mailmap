import { mapWithConcurrency, throwIfAborted } from '../../utils/async';
import { ProviderError, type FetchMetadataOptions, type MailProvider } from '../types';
import { revokeGmailToken, type GmailToken } from './gmailAuth';
import { getGmailMessageMetadata, getGmailProfile, listGmailMessageIds } from './gmailClient';

/** Parallel metadata requests. Gmail allows 250 quota units/user/second; a get costs 5. */
const CONCURRENCY = 6;
const PAGE_SIZE = 100;

export class GmailProvider implements MailProvider {
  readonly id = 'gmail' as const;
  readonly isSimulation = false;
  private token: GmailToken | null;

  private constructor(
    token: GmailToken,
    readonly accountLabel: string,
  ) {
    this.token = token;
  }

  /** Create a provider from a fresh token by looking up the account address. */
  static async create(token: GmailToken): Promise<GmailProvider> {
    const getToken = () => Promise.resolve(token.accessToken);
    const email = await getGmailProfile({ getToken });
    return new GmailProvider(token, email);
  }

  private getToken = async (): Promise<string> => {
    // No refresh tokens in the GIS token model: once expired, the user must reconnect.
    if (!this.token || Date.now() >= this.token.expiresAt) {
      throw new ProviderError('unauthorized', 'Gmail access token expired');
    }
    return this.token.accessToken;
  };

  async fetchMessageMetadata({
    maxMessages,
    signal,
    onBatch,
    onProgress,
  }: FetchMetadataOptions): Promise<void> {
    let pageToken: string | undefined;
    let processed = 0;
    onProgress(0, maxMessages);

    while (processed < maxMessages) {
      throwIfAborted(signal);
      const pageSize = Math.min(PAGE_SIZE, maxMessages - processed);
      const page = await listGmailMessageIds(pageToken, pageSize, {
        getToken: this.getToken,
        signal,
      });
      if (page.ids.length === 0) break;

      const batch = await mapWithConcurrency(
        page.ids,
        CONCURRENCY,
        async (id) => {
          const message = await getGmailMessageMetadata(id, { getToken: this.getToken, signal });
          processed++;
          if (processed % 10 === 0) onProgress(processed, maxMessages);
          return message;
        },
        signal,
      );
      onBatch(batch);
      onProgress(processed, maxMessages);

      pageToken = page.nextPageToken;
      if (!pageToken) break;
    }
  }

  async disconnect(): Promise<void> {
    const token = this.token;
    this.token = null;
    if (token) await revokeGmailToken(token.accessToken);
  }
}
