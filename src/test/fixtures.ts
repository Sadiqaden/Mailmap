import type { MessageMetadata } from '../types/mail';
import type { Newsletter } from '../types/newsletter';

export const DAY = 24 * 60 * 60 * 1000;
/** Fixed "now" so date-based tests never depend on the real clock. */
export const NOW = Date.UTC(2026, 10, 11, 12, 0, 0);

export function message(overrides: Partial<MessageMetadata> = {}): MessageMetadata {
  return {
    id: overrides.id ?? `m-${Math.random().toString(36).slice(2)}`,
    receivedAt: NOW,
    from: { name: 'Example News', email: 'news@example.com' },
    listUnsubscribe: null,
    listUnsubscribePost: null,
    listId: null,
    precedence: null,
    authenticationResults: null,
    ...overrides,
  };
}

export function newsletter(overrides: Partial<Newsletter> = {}): Newsletter {
  return {
    key: 'sender:news@example.com',
    name: 'Example News',
    email: 'news@example.com',
    domain: 'example.com',
    listId: null,
    messageCount: 5,
    firstSeenAt: NOW - 30 * DAY,
    lastSeenAt: NOW - DAY,
    frequency: 'weekly',
    confidence: 'high',
    signals: ['list-unsubscribe'],
    unsubscribe: {
      primary: { kind: 'one-click', url: 'https://example.com/u', host: 'example.com' },
      alternatives: [],
      rejectedCount: 0,
    },
    ...overrides,
  };
}
