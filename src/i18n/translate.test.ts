import { describe, expect, it } from 'vitest';
import en from './messages/en';
import nb from './messages/nb';
import { translate } from './translate';

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else for (const [k, v] of leaves(value, path)) out.set(k, v);
  }
  return out;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('translations', () => {
  const enLeaves = leaves(en as unknown as Tree);
  const nbLeaves = leaves(nb as unknown as Tree);

  it('Norwegian and English have exactly the same keys', () => {
    expect([...nbLeaves.keys()].sort()).toEqual([...enLeaves.keys()].sort());
  });

  it('every Norwegian text uses the same {placeholders} as English', () => {
    for (const [key, text] of enLeaves) {
      expect(placeholders(nbLeaves.get(key) ?? ''), key).toEqual(placeholders(text));
    }
  });

  it('has no empty translations', () => {
    for (const [key, text] of [...enLeaves, ...nbLeaves]) expect(text.trim(), key).not.toBe('');
  });
});

describe('translate', () => {
  it('looks up nested keys and interpolates values', () => {
    expect(translate(en, 'en', 'dashboard.connectedAs', { account: 'ola@example.com' })).toBe(
      'Connected as ola@example.com',
    );
    expect(translate(nb, 'nb', 'dashboard.connectedAs', { account: 'ola@example.com' })).toBe(
      'Tilkoblet som ola@example.com',
    );
  });

  it('selects plural forms by count', () => {
    expect(translate(en, 'en', 'card.emails', { count: 1 })).toBe('1 email');
    expect(translate(en, 'en', 'card.emails', { count: 3 })).toBe('3 emails');
    expect(translate(nb, 'nb', 'card.emails', { count: 1 })).toBe('1 e-post');
    expect(translate(nb, 'nb', 'card.emails', { count: 0 })).toBe('0 e-poster');
  });

  it('formats numbers per locale', () => {
    expect(translate(en, 'en', 'card.emails', { count: 1500 })).toBe('1,500 emails');
    // Norwegian uses a (non-breaking) space as thousands separator.
    expect(translate(nb, 'nb', 'card.emails', { count: 1500 }).replace(/\s/g, ' ')).toBe(
      '1 500 e-poster',
    );
  });

  it('leaves unknown placeholders visible rather than silently dropping them', () => {
    expect(translate(en, 'en', 'dashboard.connectedAs')).toBe('Connected as {account}');
  });
});
