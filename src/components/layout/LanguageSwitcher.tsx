import { useI18n } from '../../hooks/useI18n';
import { LOCALES } from '../../i18n/translate';
import { cx } from '../../utils/cx';

/** Two-button toggle. `lang` on each label lets screen readers pronounce it correctly. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('common.languageLabel')}
      className={cx(
        'inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm',
        className,
      )}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={cx(
            'rounded-md px-2.5 py-1 font-medium transition-colors',
            locale === code ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          {code === 'nb' ? 'NO' : 'EN'}
          <span className="sr-only"> – {t(`common.languages.${code}`)}</span>
        </button>
      ))}
    </div>
  );
}
