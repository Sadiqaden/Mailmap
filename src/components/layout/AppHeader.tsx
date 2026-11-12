import { Link } from 'react-router';
import { useI18n } from '../../hooks/useI18n';
import { useSession } from '../../hooks/useSession';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import { AccountMenu } from './AccountMenu';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Header for the dashboard: brand, connection status, language and account menu. */
export function AppHeader() {
  const { t } = useI18n();
  const { provider } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="shrink-0 rounded-lg"
            aria-label={`${t('common.appName')} – ${t('nav.home')}`}
          >
            <Logo />
          </Link>
          {provider?.isSimulation && <Badge tone="blue">{t('common.demoBadge')}</Badge>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {provider && (
            <p
              className="hidden max-w-60 truncate text-sm text-slate-500 lg:block"
              data-testid="connection-status"
            >
              <span
                className="mr-1.5 inline-block size-2 rounded-full bg-emerald-500 align-middle"
                aria-hidden="true"
              />
              {provider.isSimulation
                ? t('dashboard.connectionDemo')
                : t('dashboard.connectedAs', { account: provider.accountLabel })}
            </p>
          )}
          <LanguageSwitcher />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
