import { describe, expect, it } from 'vitest';
import { EXPECTED_DEMO_NEWSLETTERS, generateDemoMessages } from '../../demo/demoData';
import { DAY, message, NOW } from '../../test/fixtures';
import { dedupeMessages, detectNewsletters } from './detect';
import { estimateFrequency, isRecentlyActive } from './frequency';

const unsub = '<https://news.example.com/u>';

describe('dedupeMessages', () => {
  it('keeps the first message per id', () => {
    const a = message({ id: '1', receivedAt: 1 });
    const b = message({ id: '1', receivedAt: 2 });
    const c = message({ id: '2' });
    expect(dedupeMessages([a, b, c])).toEqual([a, c]);
  });
});

describe('detectNewsletters', () => {
  it('detects a sender with List-Unsubscribe as high confidence', () => {
    const [result] = detectNewsletters([message({ listUnsubscribe: unsub })]);
    expect(result).toMatchObject({
      confidence: 'high',
      signals: ['list-unsubscribe'],
      messageCount: 1,
    });
  });

  it('ignores ordinary mail without newsletter signals', () => {
    const personal = Array.from({ length: 5 }, (_, i) =>
      message({ id: `p${i}`, from: { name: 'Kari', email: 'kari@mail.example.com' } }),
    );
    expect(detectNewsletters(personal)).toEqual([]);
  });

  it('groups messages by sender and counts them', () => {
    const result = detectNewsletters([
      message({ id: '1', listUnsubscribe: unsub, receivedAt: NOW - 2 * DAY }),
      message({ id: '2', listUnsubscribe: unsub, receivedAt: NOW }),
      message({ id: '2', listUnsubscribe: unsub, receivedAt: NOW }), // duplicate
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      messageCount: 2,
      lastSeenAt: NOW,
      firstSeenAt: NOW - 2 * DAY,
    });
  });

  it('groups by List-Id even when the sender address differs', () => {
    const result = detectNewsletters([
      message({
        id: '1',
        listId: 'Weekly <weekly.example.com>',
        from: { name: 'Weekly', email: 'a@example.com' },
      }),
      message({
        id: '2',
        listId: '<weekly.example.com>',
        from: { name: 'Weekly', email: 'b@example.com' },
      }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: 'list:weekly.example.com',
      messageCount: 2,
      listId: 'weekly.example.com',
    });
  });

  it('uses Precedence: bulk as a medium signal', () => {
    const [result] = detectNewsletters([message({ precedence: 'bulk' })]);
    expect(result?.confidence).toBe('medium');
  });

  it('only reports sender-pattern matches with at least three messages', () => {
    const from = { name: 'Plant Tips', email: 'newsletter@plants.example.com' };
    expect(detectNewsletters([message({ id: '1', from }), message({ id: '2', from })])).toEqual([]);
    const three = detectNewsletters([1, 2, 3].map((i) => message({ id: String(i), from })));
    expect(three[0]?.confidence).toBe('low');
  });

  it('does not treat noreply addresses as newsletters by pattern alone', () => {
    const from = { name: 'Bank', email: 'noreply@bank.example.com' };
    expect(detectNewsletters([1, 2, 3, 4].map((i) => message({ id: String(i), from })))).toEqual(
      [],
    );
  });

  it('takes the display name from the newest message and sanitizes it', () => {
    const [result] = detectNewsletters([
      message({
        id: '1',
        receivedAt: NOW - DAY,
        listUnsubscribe: unsub,
        from: { name: 'Old Name', email: 'n@example.com' },
      }),
      message({
        id: '2',
        receivedAt: NOW,
        listUnsubscribe: unsub,
        from: { name: 'New\u202E Name', email: 'n@example.com' },
      }),
    ]);
    expect(result?.name).toBe('New Name');
  });

  it('uses unsubscribe headers from the newest message that has them', () => {
    const [result] = detectNewsletters([
      message({ id: '1', receivedAt: NOW - DAY, listUnsubscribe: '<https://old.example.com/u>' }),
      message({ id: '2', receivedAt: NOW, listUnsubscribe: '<https://new.example.com/u>' }),
      message({ id: '3', receivedAt: NOW + 1, precedence: 'bulk' }),
    ]);
    expect(result?.unsubscribe.primary).toMatchObject({ kind: 'web', host: 'new.example.com' });
  });

  it('finds every synthetic newsletter in the demo mailbox, and no personal mail', () => {
    const result = detectNewsletters(generateDemoMessages(NOW));
    expect(result).toHaveLength(EXPECTED_DEMO_NEWSLETTERS);
    expect(result.map((n) => n.email)).not.toContain('kari.nordmann@mail.example');
    expect(result.map((n) => n.email)).not.toContain('noreply@bank.example');
  });
});

describe('estimateFrequency', () => {
  const series = (gapDays: number, count = 5) =>
    Array.from({ length: count }, (_, i) => NOW - i * gapDays * DAY);

  it('needs at least three messages', () => {
    expect(estimateFrequency([NOW])).toBe('unknown');
    expect(estimateFrequency([NOW, NOW - DAY])).toBe('unknown');
  });

  it.each([
    [1, 'daily'],
    [7, 'weekly'],
    [30, 'monthly'],
    [90, 'occasional'],
  ] as const)('a %i-day gap is %s', (gap, expected) => {
    expect(estimateFrequency(series(gap))).toBe(expected);
  });

  it('uses the median, so one long break does not change a weekly sender', () => {
    const timestamps = [...series(7, 6), NOW - 200 * DAY];
    expect(estimateFrequency(timestamps)).toBe('weekly');
  });

  it('does not depend on input order', () => {
    expect(estimateFrequency(series(7).reverse())).toBe('weekly');
  });
});

describe('isRecentlyActive', () => {
  it('uses a 30-day window', () => {
    expect(isRecentlyActive(NOW - 29 * DAY, NOW)).toBe(true);
    expect(isRecentlyActive(NOW - 31 * DAY, NOW)).toBe(false);
  });
});
