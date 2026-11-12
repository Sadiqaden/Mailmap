import type { DashboardStats } from '../../features/dashboard/stats';
import { useI18n } from '../../hooks/useI18n';
import type { MessageKey } from '../../i18n/translate';
import { Icon, type IconName } from '../ui/Icon';

const ITEMS: { key: keyof DashboardStats; label: MessageKey; icon: IconName }[] = [
  { key: 'senders', label: 'stats.senders', icon: 'layers' },
  { key: 'newsletterEmails', label: 'stats.emails', icon: 'mail' },
  { key: 'withUnsubscribe', label: 'stats.withUnsubscribe', icon: 'bolt' },
  { key: 'recentlyActive', label: 'stats.recent', icon: 'clock' },
];

export function StatsGrid({
  stats,
  scannedMessages,
}: {
  stats: DashboardStats;
  scannedMessages: number;
}) {
  const { t, formatNumber } = useI18n();
  return (
    <section aria-label={t('stats.label')}>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <dt className="flex items-center gap-2 text-sm text-slate-600">
              <Icon name={item.icon} className="size-4 text-brand-600" />
              {t(item.label)}
            </dt>
            <dd
              className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums"
              data-testid={`stat-${item.key}`}
            >
              {formatNumber(stats[item.key])}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
        <Icon name="info" className="mt-px size-3.5 shrink-0" />
        <span>
          {t('dashboard.scanSummary', { count: scannedMessages })}. {t('stats.disclaimer')}
        </span>
      </p>
    </section>
  );
}
