import type { FrequencyEstimate } from '../../types/newsletter';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Estimate how often a sender emails, from the receive times we scanned.
 *
 * Uses the *median* gap between consecutive messages, so one long holiday break
 * does not turn a weekly newsletter into "occasional". At least three messages
 * (two gaps) are required; with less data we honestly say "unknown".
 */
export function estimateFrequency(timestamps: readonly number[]): FrequencyEstimate {
  if (timestamps.length < 3) return 'unknown';

  const sorted = [...timestamps].sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push((sorted[i]! - sorted[i - 1]!) / DAY_MS);
  }
  gaps.sort((a, b) => a - b);

  const mid = Math.floor(gaps.length / 2);
  const median = gaps.length % 2 === 0 ? (gaps[mid - 1]! + gaps[mid]!) / 2 : gaps[mid]!;

  if (median <= 2) return 'daily';
  if (median <= 10) return 'weekly';
  if (median <= 45) return 'monthly';
  return 'occasional';
}

/** The window used for the "recently active" label and filter. */
export const RECENT_DAYS = 30;

export function isRecentlyActive(lastSeenAt: number, now: number, days = RECENT_DAYS): boolean {
  return now - lastSeenAt <= days * DAY_MS;
}
