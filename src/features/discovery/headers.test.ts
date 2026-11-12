import { describe, expect, it } from 'vitest';
import {
  hasDkimPass,
  isBulkPrecedence,
  isOneClickPost,
  parseListId,
  parseListUnsubscribe,
} from './headers';

describe('parseListUnsubscribe (RFC 2369)', () => {
  it('extracts URIs in angle brackets', () => {
    expect(
      parseListUnsubscribe('<mailto:leave@example.com>, <https://example.com/u?id=1>'),
    ).toEqual(['mailto:leave@example.com', 'https://example.com/u?id=1']);
  });

  it('removes whitespace left by header folding', () => {
    expect(parseListUnsubscribe('<https://example.com/\r\n  unsubscribe>')).toEqual([
      'https://example.com/unsubscribe',
    ]);
  });

  it('ignores text outside brackets and caps the number of URIs', () => {
    expect(parseListUnsubscribe('click here https://evil.example')).toEqual([]);
    const many = Array.from({ length: 10 }, (_, i) => `<https://example.com/${i}>`).join(',');
    expect(parseListUnsubscribe(many)).toHaveLength(5);
  });

  it('handles empty input', () => {
    expect(parseListUnsubscribe(null)).toEqual([]);
    expect(parseListUnsubscribe('<>')).toEqual([]);
  });
});

describe('isOneClickPost (RFC 8058)', () => {
  it('accepts only the exact one-click value', () => {
    expect(isOneClickPost('List-Unsubscribe=One-Click')).toBe(true);
    expect(isOneClickPost(' list-unsubscribe = one-click ')).toBe(true);
    expect(isOneClickPost('List-Unsubscribe=One-Click&extra=1')).toBe(false);
    expect(isOneClickPost(null)).toBe(false);
  });
});

describe('parseListId (RFC 2919)', () => {
  it('extracts the identifier', () => {
    expect(parseListId('Nordlys Weekly <Weekly.Nordlys.example>')).toBe('weekly.nordlys.example');
    expect(parseListId('weekly.nordlys.example')).toBe('weekly.nordlys.example');
  });

  it('rejects malformed identifiers', () => {
    expect(parseListId('<not a list id>')).toBeNull();
    expect(parseListId('<single-label>')).toBeNull();
    expect(parseListId(null)).toBeNull();
  });
});

describe('isBulkPrecedence', () => {
  it('recognises bulk and list', () => {
    expect(isBulkPrecedence('bulk')).toBe(true);
    expect(isBulkPrecedence(' List ')).toBe(true);
    expect(isBulkPrecedence('junk')).toBe(false);
  });
});

describe('hasDkimPass', () => {
  it('detects dkim=pass in Authentication-Results', () => {
    expect(hasDkimPass('mx.google.com; dkim=pass header.i=@example.com; spf=pass')).toBe(true);
    expect(hasDkimPass('mx.google.com; dkim=fail; spf=pass')).toBe(false);
    expect(hasDkimPass('mx.google.com; xdkim=pass')).toBe(false);
    expect(hasDkimPass(null)).toBe(false);
  });
});
