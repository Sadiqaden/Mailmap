import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { ProviderErrorCode } from '../../integrations/types';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';
import { buttonClasses } from '../ui/buttonStyles';
import { Card } from '../ui/Card';
import { Icon, type IconName } from '../ui/Icon';

/** Generic empty state with an icon, text and optional action. */
export function EmptyState({
  icon = 'search',
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon name={icon} className="size-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-600">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

/** Error state for a failed scan. Offers reconnect for expired sessions, retry otherwise. */
export function ScanErrorState({
  code,
  onRetry,
  onReconnect,
}: {
  code: ProviderErrorCode;
  onRetry: () => void;
  onReconnect: () => void;
}) {
  const { t } = useI18n();
  const needsReconnect = code === 'unauthorized';
  return (
    <Card className="border-rose-200 p-6" role="alert">
      <div className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-rose-600" />
        <div className="space-y-3">
          <div>
            <h2 className="font-semibold text-slate-900">{t('errors.title')}</h2>
            <p className="mt-1 text-sm text-slate-700">{t(`errors.${code}`)}</p>
          </div>
          {needsReconnect ? (
            <Button onClick={onReconnect}>{t('errors.reconnect')}</Button>
          ) : (
            <Button variant="secondary" onClick={onRetry}>
              {t('common.retry')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Shown on /app when no provider is connected (e.g. after a page refresh). */
export function NotConnectedState() {
  const { t } = useI18n();
  return (
    <EmptyState
      icon="lock"
      title={t('dashboard.notConnectedTitle')}
      body={t('dashboard.notConnectedBody')}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/connect/gmail" className={buttonClasses('primary')}>
            {t('landing.ctaGmail')}
          </Link>
          <Link to="/connect/outlook" className={buttonClasses('primary')}>
            {t('landing.ctaOutlook')}
          </Link>
          <Link to="/demo" className={buttonClasses('secondary')}>
            {t('landing.ctaDemo')}
          </Link>
        </div>
      }
    />
  );
}

export function PrivacyPanel() {
  const { t } = useI18n();
  return (
    <aside
      aria-labelledby="privacy-panel-title"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]"
    >
      <h2
        id="privacy-panel-title"
        className="flex items-center gap-2 text-sm font-semibold text-slate-900"
      >
        <Icon name="shield" className="size-4 text-brand-600" />
        {t('dashboard.privacyPanelTitle')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {t('dashboard.privacyPanelBody')}
      </p>
      <Link
        to="/privacy"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        {t('dashboard.privacyPanelLink')}
        <Icon name="arrowRight" className="size-3.5" />
      </Link>
    </aside>
  );
}
