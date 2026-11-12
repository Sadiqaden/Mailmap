import { Link } from 'react-router';
import { PublicLayout } from '../components/layout/PublicLayout';
import { buttonClasses } from '../components/ui/buttonStyles';
import { useI18n } from '../hooks/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('notFound.title')}</h1>
        <p className="mt-3 text-slate-600">{t('notFound.body')}</p>
        <Link to="/" className={buttonClasses('primary', 'md', 'mt-8')}>
          {t('notFound.home')}
        </Link>
      </div>
    </PublicLayout>
  );
}
