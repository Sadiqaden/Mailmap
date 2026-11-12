import { Link } from 'react-router';
import { useI18n } from '../../hooks/useI18n';
import { LogoMark } from '../ui/Logo';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <LogoMark className="size-6 shrink-0" />
          <div>
            <p>{t('landing.footerBuiltBy')}</p>
            <p className="text-slate-500">
              {t('landing.footerLicense')} {t('landing.footerNoTracking')}
            </p>
          </div>
        </div>
        <nav aria-label="Footer" className="flex gap-4">
          <Link to="/privacy" className="hover:text-slate-900">
            {t('nav.privacy')}
          </Link>
          <Link to="/demo" className="hover:text-slate-900">
            {t('nav.demo')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
