import { describe, expect, it } from 'vitest';
import { decodeEncodedWords, parseFromHeader } from './emailAddress';
import { initialsFor, normalizeForSearch, sanitizeDisplayText } from './text';

describe('sanitizeDisplayText', () => {
  it('removes control characters and collapses whitespace', () => {
    expect(sanitizeDisplayText('Hello\r\n\tWorld\u0000 ')).toBe('Hello World');
  });

  it('removes bidirectional override characters used for spoofing', () => {
    expect(sanitizeDisplayText('Bank\u202Emoc.live')).toBe('Bankmoc.live');
  });

  it('removes zero-width characters', () => {
    expect(sanitizeDisplayText('Pay\u200BPal')).toBe('PayPal');
  });

  it('strips surrounding quotes and truncates long values', () => {
    expect(sanitizeDisplayText('"Quoted"')).toBe('Quoted');
    const result = sanitizeDisplayText('x'.repeat(200), 20);
    expect(result).toHaveLength(20);
    expect(result.endsWith('…')).toBe(true);
  });

  it('keeps HTML-looking text as plain text (React escapes it on render)', () => {
    expect(sanitizeDisplayText('<img src=x onerror=alert(1)>')).toBe(
      '<img src=x onerror=alert(1)>',
    );
  });
});

describe('parseFromHeader', () => {
  it.each([
    ['"Nordlys Weekly" <Weekly@Nordlys.example>', 'Nordlys Weekly', 'weekly@nordlys.example'],
    ['Nordlys <weekly@nordlys.example>', 'Nordlys', 'weekly@nordlys.example'],
    ['<weekly@nordlys.example>', '', 'weekly@nordlys.example'],
    ['weekly@nordlys.example', '', 'weekly@nordlys.example'],
    ['weekly@nordlys.example (Nordlys)', 'Nordlys', 'weekly@nordlys.example'],
  ])('parses %s', (raw, name, email) => {
    expect(parseFromHeader(raw)).toEqual({ name, email });
  });

  it('returns null for missing or invalid addresses', () => {
    expect(parseFromHeader(null)).toBeNull();
    expect(parseFromHeader('Just a name')).toBeNull();
    expect(parseFromHeader('Bad <not-an-email>')).toBeNull();
  });

  it('decodes RFC 2047 encoded names', () => {
    expect(parseFromHeader('=?UTF-8?B?QsO4a2h5bGxh?= <club@bokhylla.example>')?.name).toBe(
      'Bøkhylla',
    );
    expect(parseFromHeader('=?UTF-8?Q?Kaffe_Bl=C3=A5?= <k@kaffe.example>')?.name).toBe('Kaffe Blå');
  });
});

describe('decodeEncodedWords', () => {
  it('joins adjacent encoded words and leaves malformed input alone', () => {
    expect(decodeEncodedWords('=?UTF-8?Q?a?= =?UTF-8?Q?b?=')).toBe('ab');
    expect(decodeEncodedWords('=?unknown-charset?Q?x?=')).toBe('=?unknown-charset?Q?x?=');
  });
});

describe('initialsFor / normalizeForSearch', () => {
  it('builds initials', () => {
    expect(initialsFor('The Morning Byte')).toBe('TM');
    expect(initialsFor('Kaffeklubben')).toBe('KA');
    expect(initialsFor('!!!')).toBe('?');
  });

  it('normalises accents and case for search', () => {
    expect(normalizeForSearch('  Café ÅSE ')).toBe('cafe ase');
  });
});
