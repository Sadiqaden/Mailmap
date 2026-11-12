import type { Newsletter } from '../../types/newsletter';
import { isRecentlyActive } from '../discovery/frequency';

export interface DashboardStats {
  /** Distinct newsletter senders / lists detected. */
  senders: number;
  /** Messages from those senders among the scanned messages. */
  newsletterEmails: number;
  /** Senders with at least one valid unsubscribe method. */
  withUnsubscribe: number;
  /** Senders seen in the last 30 days. */
  recentlyActive: number;
}

/** All numbers are derived from the detected list — nothing is estimated or invented. */
export function computeStats(newsletters: readonly Newsletter[], now: number): DashboardStats {
  let newsletterEmails = 0;
  let withUnsubscribe = 0;
  let recentlyActive = 0;
  for (const n of newsletters) {
    newsletterEmails += n.messageCount;
    if (n.unsubscribe.primary) withUnsubscribe++;
    if (isRecentlyActive(n.lastSeenAt, now)) recentlyActive++;
  }
  return { senders: newsletters.length, newsletterEmails, withUnsubscribe, recentlyActive };
}
