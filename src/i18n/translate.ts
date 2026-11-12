/**
 * A small, fully typed translation helper.
 *
 * Why not a library? The app needs only lookup, `{placeholder}` interpolation and
 * plurals. Writing it ourselves keeps the bundle small and lets TypeScript check that
 * every key used in a component exists, and that Norwegian has exactly the same keys
 * as English (see `messages/nb.ts`).
 */

import type { Messages } from './messages/en';

export const LOCALES = ['nb', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'nb';

/** A pluralized message: `{ one: '1 email', other: '{count} emails' }`. */
export interface PluralMessage {
  one: string;
  other: string;
}

/**
 * All dot-separated paths to leaf messages, e.g. `'dashboard.stats.senders'`.
 * A plural object counts as a leaf.
 */
export type MessageKey = LeafPaths<Messages>;

type LeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string | PluralMessage ? K : `${K}.${LeafPaths<T[K]>}`;
}[keyof T & string];

export type TranslationValues = Record<string, string | number>;

function isPlural(value: unknown): value is PluralMessage {
  return typeof value === 'object' && value !== null && 'one' in value && 'other' in value;
}

function lookup(messages: unknown, key: string): unknown {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

function interpolate(
  template: string,
  values: TranslationValues | undefined,
  locale: Locale,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    if (value === undefined) return match;
    return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : value;
  });
}

/** Translate `key`. Plural messages require a numeric `count` value. */
export function translate(
  messages: Messages,
  locale: Locale,
  key: MessageKey,
  values?: TranslationValues,
): string {
  const entry = lookup(messages, key);
  if (typeof entry === 'string') return interpolate(entry, values, locale);
  if (isPlural(entry)) {
    const count = Number(values?.count ?? 0);
    const form = new Intl.PluralRules(locale).select(count) === 'one' ? entry.one : entry.other;
    return interpolate(form, values, locale);
  }
  // Only reachable if types are bypassed; show the key so the gap is obvious.
  return key;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
