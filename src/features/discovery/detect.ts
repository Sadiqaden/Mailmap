import type { MessageMetadata } from '../../types/mail';
import type { Confidence, DetectionSignal, Newsletter } from '../../types/newsletter';
import { domainOf, localPartOf } from '../../utils/emailAddress';
import { sanitizeDisplayText } from '../../utils/text';
import { classifyUnsubscribe } from '../unsubscribe/classify';
import { estimateFrequency } from './frequency';
import { isBulkPrecedence, parseListId, parseListUnsubscribe } from './headers';

/**
 * Words in the local part of an address that *suggest* a newsletter.
 * Only used as a weak signal, and only together with repeated messages.
 * Words like "noreply" or "info" are deliberately excluded: receipts and
 * security alerts use them too.
 */
const NEWSLETTER_LOCAL_PART =
  /(^|[._+-])(newsletters?|news|digest|bulletin|weekly|daily|marketing|updates|nyhetsbrev)([._+-]|$)/i;

/** Minimum number of messages before a sender-pattern-only match is reported. */
export const MIN_MESSAGES_FOR_PATTERN = 3;

interface MessageSignals {
  message: MessageMetadata;
  listId: string | null;
  hasListUnsubscribe: boolean;
  hasBulkPrecedence: boolean;
}

function readSignals(message: MessageMetadata): MessageSignals {
  return {
    message,
    listId: parseListId(message.listId),
    hasListUnsubscribe: parseListUnsubscribe(message.listUnsubscribe).length > 0,
    hasBulkPrecedence: isBulkPrecedence(message.precedence),
  };
}

/**
 * Group key. Mailing lists are grouped by their List-Id (one list may use several
 * sender addresses); everything else by sender address.
 */
export function groupKeyFor(signals: Pick<MessageSignals, 'listId' | 'message'>): string | null {
  if (signals.listId) return `list:${signals.listId}`;
  if (signals.message.from) return `sender:${signals.message.from.email}`;
  return null;
}

/** Remove duplicate messages (same provider id), keeping the first occurrence. */
export function dedupeMessages(messages: readonly MessageMetadata[]): MessageMetadata[] {
  const seen = new Set<string>();
  const unique: MessageMetadata[] = [];
  for (const message of messages) {
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    unique.push(message);
  }
  return unique;
}

function confidenceFor(signals: Set<DetectionSignal>): Confidence | null {
  if (signals.has('list-unsubscribe') || signals.has('list-id')) return 'high';
  if (signals.has('precedence')) return 'medium';
  if (signals.has('sender-pattern')) return 'low';
  return null;
}

/**
 * Detect newsletter senders from message metadata.
 *
 * Pipeline: de-duplicate → read header signals → group → decide → summarise.
 * A group is reported when at least one message carries a mailing-list header,
 * or when the sender address looks like a newsletter and sent ≥3 messages.
 *
 * "Detected" means "we saw newsletter-like mail from this sender in the scanned
 * messages". It does not prove the user is still subscribed.
 */
export function detectNewsletters(messages: readonly MessageMetadata[]): Newsletter[] {
  const groups = new Map<string, MessageSignals[]>();

  for (const message of dedupeMessages(messages)) {
    const signals = readSignals(message);
    const key = groupKeyFor(signals);
    if (!key) continue;
    const group = groups.get(key);
    if (group) group.push(signals);
    else groups.set(key, [signals]);
  }

  const newsletters: Newsletter[] = [];

  for (const [key, group] of groups) {
    // Newest first, so index 0 is the most recent message.
    group.sort((a, b) => b.message.receivedAt - a.message.receivedAt);
    const newest = group[0];
    if (!newest) continue;

    const signals = new Set<DetectionSignal>();
    for (const item of group) {
      if (item.hasListUnsubscribe) signals.add('list-unsubscribe');
      if (item.listId) signals.add('list-id');
      if (item.hasBulkPrecedence) signals.add('precedence');
    }

    const sender = group.find((item) => item.message.from)?.message.from ?? null;
    if (
      signals.size === 0 &&
      sender &&
      group.length >= MIN_MESSAGES_FOR_PATTERN &&
      NEWSLETTER_LOCAL_PART.test(localPartOf(sender.email))
    ) {
      signals.add('sender-pattern');
    }

    const confidence = confidenceFor(signals);
    if (!confidence) continue;

    // Unsubscribe info comes from the newest message that advertises it:
    // senders sometimes change their unsubscribe endpoint over time.
    const withUnsubscribe = group.find((item) => item.hasListUnsubscribe)?.message;
    const unsubscribe = classifyUnsubscribe({
      listUnsubscribe: withUnsubscribe?.listUnsubscribe ?? null,
      listUnsubscribePost: withUnsubscribe?.listUnsubscribePost ?? null,
      authenticationResults: withUnsubscribe?.authenticationResults ?? null,
    });

    const email = sender?.email ?? '';
    const listId = group.find((item) => item.listId)?.listId ?? null;
    const name =
      sanitizeDisplayText(sender?.name ?? '') || email || sanitizeDisplayText(listId ?? '') || '?';
    const timestamps = group.map((item) => item.message.receivedAt);

    newsletters.push({
      key,
      name,
      email,
      domain: email ? domainOf(email) : (listId ?? ''),
      listId,
      messageCount: group.length,
      firstSeenAt: Math.min(...timestamps),
      lastSeenAt: newest.message.receivedAt,
      frequency: estimateFrequency(timestamps),
      confidence,
      signals: [...signals],
      unsubscribe,
    });
  }

  return newsletters;
}
