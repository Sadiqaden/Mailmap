import { describe, expect, it } from 'vitest';
import { DAY, newsletter, NOW } from '../../test/fixtures';
import { applyQuery, matchesSearch } from './query';
import { computeStats } from './stats';

const web = {
  kind: 'web' as const,
  url: 'https://b.example/u',
  host: 'b.example',
  insecure: false,
};

const list = [
  newsletter({
    key: 'a',
    name: 'Alpha Weekly',
    email: 'a@alpha.example',
    domain: 'alpha.example',
    messageCount: 3,
    lastSeenAt: NOW - 2 * DAY,
  }),
  newsletter({
    key: 'b',
    name: 'Øst Nytt',
    email: 'news@beta.example',
    domain: 'beta.example',
    messageCount: 10,
    lastSeenAt: NOW - 60 * DAY,
    unsubscribe: { primary: web, alternatives: [], rejectedCount: 0 },
  }),
  newsletter({
    key: 'c',
    name: 'Café Club',
    email: 'club@cafe.example',
    domain: 'cafe.example',
    messageCount: 7,
    lastSeenAt: NOW - 10 * DAY,
    unsubscribe: { primary: null, alternatives: [], rejectedCount: 0 },
  }),
];

const context = { selected: new Set<string>(), now: NOW, locale: 'en' };
const keys = (items: { key: string }[]) => items.map((n) => n.key);

describe('search', () => {
  it('matches name, address and domain, case- and accent-insensitively', () => {
    expect(matchesSearch(list[0]!, 'ALPHA')).toBe(true);
    expect(matchesSearch(list[1]!, 'beta.example')).toBe(true);
    expect(matchesSearch(list[2]!, 'cafe club')).toBe(true);
    expect(matchesSearch(list[2]!, 'zzz')).toBe(false);
  });

  it('treats an empty search as "match all"', () => {
    expect(applyQuery(list, { search: '  ', filter: 'all', sort: 'name' }, context)).toHaveLength(
      3,
    );
  });
});

describe('filters', () => {
  it('recent = seen within 30 days', () => {
    expect(keys(applyQuery(list, { search: '', filter: 'recent', sort: 'name' }, context))).toEqual(
      ['a', 'c'],
    );
  });

  it('unsubscribe-available = has any valid method', () => {
    expect(
      keys(
        applyQuery(list, { search: '', filter: 'unsubscribe-available', sort: 'name' }, context),
      ),
    ).toEqual(['a', 'b']);
  });

  it('manual = anything that is not one-click', () => {
    expect(keys(applyQuery(list, { search: '', filter: 'manual', sort: 'name' }, context))).toEqual(
      ['c', 'b'],
    );
  });

  it('selected = only selected keys', () => {
    const selected = new Set(['b']);
    expect(
      keys(
        applyQuery(
          list,
          { search: '', filter: 'selected', sort: 'name' },
          { ...context, selected },
        ),
      ),
    ).toEqual(['b']);
  });
});

describe('sorting', () => {
  it('sorts by count, recency and name', () => {
    expect(keys(applyQuery(list, { search: '', filter: 'all', sort: 'count' }, context))).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(keys(applyQuery(list, { search: '', filter: 'all', sort: 'recent' }, context))).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(keys(applyQuery(list, { search: '', filter: 'all', sort: 'name' }, context))).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('uses the locale for alphabetical order (Ø after Z in Norwegian)', () => {
    const extra = [...list, newsletter({ key: 'z', name: 'Zeta' })];
    const nb = keys(
      applyQuery(extra, { search: '', filter: 'all', sort: 'name' }, { ...context, locale: 'nb' }),
    );
    expect(nb.indexOf('b')).toBeGreaterThan(nb.indexOf('z'));
  });

  it('does not mutate the input array', () => {
    const copy = [...list];
    applyQuery(list, { search: '', filter: 'all', sort: 'count' }, context);
    expect(list).toEqual(copy);
  });
});

describe('computeStats', () => {
  it('derives every number from the detected list', () => {
    expect(computeStats(list, NOW)).toEqual({
      senders: 3,
      newsletterEmails: 20,
      withUnsubscribe: 2,
      recentlyActive: 2,
    });
  });

  it('returns zeros for an empty list', () => {
    expect(computeStats([], NOW)).toEqual({
      senders: 0,
      newsletterEmails: 0,
      withUnsubscribe: 0,
      recentlyActive: 0,
    });
  });
});
