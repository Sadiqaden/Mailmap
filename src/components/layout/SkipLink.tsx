import { useI18n } from '../../hooks/useI18n';

export const MAIN_CONTENT_ID = 'main-content';

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
    >
      {t('common.skipToContent')}
    </a>
  );
}
