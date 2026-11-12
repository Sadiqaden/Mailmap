import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nContext, type I18nContextValue } from './i18nContext';
import en from './messages/en';
import nb from './messages/nb';
import { DEFAULT_LOCALE, isLocale, translate, type Locale } from './translate';

const MESSAGES = { en, nb } as const;
const STORAGE_KEY = 'mailmap.locale';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Read the saved language. Storage may be unavailable (private mode), so never throw. */
function readStoredLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not critical: the choice simply won't survive a reload.
  }
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? readStoredLocale() ?? DEFAULT_LOCALE,
  );

  // Keep <html lang> in sync so screen readers pronounce text correctly.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storeLocale(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const intlLocale = locale === 'nb' ? 'nb-NO' : 'en-GB';
    const dateFormat = new Intl.DateTimeFormat(intlLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const relativeFormat = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
    const numberFormat = new Intl.NumberFormat(intlLocale);

    return {
      locale,
      setLocale,
      t: (key, values) => translate(MESSAGES[locale], locale, key, values),
      formatDate: (timestamp) => dateFormat.format(timestamp),
      formatRelative: (timestamp, now) => {
        const days = Math.round((timestamp - now) / DAY_MS);
        if (Math.abs(days) < 30) return relativeFormat.format(days, 'day');
        const months = Math.round(days / 30);
        if (Math.abs(months) < 12) return relativeFormat.format(months, 'month');
        return relativeFormat.format(Math.round(days / 365), 'year');
      },
      formatNumber: (n) => numberFormat.format(n),
    };
  }, [locale, setLocale]);

  return <I18nContext value={value}>{children}</I18nContext>;
}
