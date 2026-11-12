import { createContext } from 'react';
import type { Locale, MessageKey, TranslationValues } from './translate';

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: TranslationValues) => string;
  formatDate: (timestamp: number) => string;
  /** "3 days ago" / "for 3 dager siden" relative to `now`. */
  formatRelative: (timestamp: number, now: number) => string;
  formatNumber: (value: number) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
