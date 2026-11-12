import type { Newsletter } from '../../types/newsletter';

export interface BulkPartition {
  /** Mailmap can send these after one confirmation. */
  oneClick: Newsletter[];
  /** The user must open a page or send an email for each. */
  manual: Newsletter[];
  /** No safe unsubscribe method was found. */
  unavailable: Newsletter[];
}

/** Split a selection by what Mailmap can actually do for each newsletter. */
export function partitionForBulk(newsletters: readonly Newsletter[]): BulkPartition {
  const result: BulkPartition = { oneClick: [], manual: [], unavailable: [] };
  for (const n of newsletters) {
    const kind = n.unsubscribe.primary?.kind;
    if (kind === 'one-click') result.oneClick.push(n);
    else if (kind === 'web' || kind === 'mailto') result.manual.push(n);
    else result.unavailable.push(n);
  }
  return result;
}
