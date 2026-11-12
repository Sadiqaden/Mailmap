import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BulkActionBar } from '../components/dashboard/BulkActionBar';
import { NewsletterToolbar } from '../components/dashboard/NewsletterToolbar';
import { ScanProgressPanel, ScanReadyPanel } from '../components/dashboard/ScanPanel';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import {
  EmptyState,
  NotConnectedState,
  PrivacyPanel,
  ScanErrorState,
} from '../components/dashboard/states';
import { AppHeader } from '../components/layout/AppHeader';
import { MAIN_CONTENT_ID, SkipLink } from '../components/layout/SkipLink';
import { BulkUnsubscribeDialog } from '../components/newsletter/BulkUnsubscribeDialog';
import { NewsletterCard } from '../components/newsletter/NewsletterCard';
import { UnsubscribeDialog } from '../components/newsletter/UnsubscribeDialog';
import { Button } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { applyQuery, type NewsletterQuery } from '../features/dashboard/query';
import { computeStats } from '../features/dashboard/stats';
import { DEFAULT_SCAN_LIMIT } from '../features/discovery/scan';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import type { Newsletter } from '../types/newsletter';

const INITIAL_QUERY: NewsletterQuery = { search: '', filter: 'all', sort: 'recent' };

/**
 * The dashboard. Used for both real sessions (/app) and demo mode (/demo);
 * which one it shows depends only on the session it is rendered inside.
 */
export function DashboardPage() {
  const { t, locale } = useI18n();
  const session = useSession();
  const { provider, state } = session;
  const navigate = useNavigate();

  const [query, setQuery] = useState<NewsletterQuery>(INITIAL_QUERY);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [lastLimit, setLastLimit] = useState<number>(DEFAULT_SCAN_LIMIT);

  const result = state.scan.status === 'done' ? state.scan.result : null;
  const now = result?.completedAt ?? 0;

  const visible = useMemo(
    () => applyQuery(state.newsletters, query, { selected: state.selected, now, locale }),
    [state.newsletters, state.selected, query, now, locale],
  );
  const stats = useMemo(() => computeStats(state.newsletters, now), [state.newsletters, now]);
  const selectedNewsletters = useMemo(
    () => state.newsletters.filter((n) => state.selected.has(n.key)),
    [state.newsletters, state.selected],
  );
  const activeNewsletter = activeKey
    ? (state.newsletters.find((n) => n.key === activeKey) ?? null)
    : null;

  const { startScan, toggleSelected } = session;
  const scan = useCallback(
    (limit: number) => {
      setLastLimit(limit);
      startScan(limit);
    },
    [startScan],
  );
  const openUnsubscribe = useCallback((n: Newsletter) => setActiveKey(n.key), []);

  const isDemo = provider?.isSimulation ?? false;

  function renderBody() {
    if (!provider) return <NotConnectedState />;

    switch (state.scan.status) {
      case 'idle':
        return <ScanReadyPanel onStart={scan} />;
      case 'scanning':
        return (
          <ScanProgressPanel
            processed={state.scan.processed}
            target={state.scan.target}
            onCancel={session.cancelScan}
          />
        );
      case 'error':
        return (
          <ScanErrorState
            code={state.scan.code}
            onRetry={() => scan(lastLimit)}
            onReconnect={() => navigate(`/connect/${provider.id}`)}
          />
        );
      case 'done':
        break;
    }

    if (!result) return null;

    return (
      <div className="space-y-6">
        {result.partial && (
          <Notice tone="warning" role="status">
            {t('dashboard.partialNotice', { count: result.scannedMessages })}
          </Notice>
        )}

        <StatsGrid stats={stats} scannedMessages={result.scannedMessages} />

        {state.newsletters.length === 0 ? (
          <EmptyState
            icon="mail"
            title={t('empty.noneFoundTitle')}
            body={t('empty.noneFoundBody')}
          />
        ) : (
          <section aria-labelledby="newsletter-list-title" className="space-y-4">
            <h2 id="newsletter-list-title" className="sr-only">
              {t('dashboard.title')}
            </h2>
            <NewsletterToolbar query={query} onChange={setQuery} />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-600" aria-live="polite" data-testid="result-count">
                {t('toolbar.resultCount', {
                  count: visible.length,
                  total: state.newsletters.length,
                })}
              </p>
              <BulkActionBar
                selectedCount={state.selected.size}
                visibleCount={visible.length}
                onSelectVisible={() =>
                  session.setSelected([...state.selected, ...visible.map((n) => n.key)])
                }
                onClear={session.clearSelection}
                onUnsubscribe={() => setBulkOpen(true)}
              />
            </div>

            {visible.length === 0 ? (
              <EmptyState
                title={t('empty.noMatchesTitle')}
                body={t('empty.noMatchesBody')}
                action={
                  <Button variant="secondary" onClick={() => setQuery(INITIAL_QUERY)}>
                    {t('empty.clearFilters')}
                  </Button>
                }
              />
            ) : (
              <ul
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                data-testid="newsletter-grid"
              >
                {visible.map((newsletter) => (
                  <li key={newsletter.key} className="flex min-w-0">
                    <div className="flex w-full flex-col [&>article]:flex-1">
                      <NewsletterCard
                        newsletter={newsletter}
                        selected={state.selected.has(newsletter.key)}
                        outcome={state.outcomes[newsletter.key]}
                        now={now}
                        onToggleSelected={toggleSelected}
                        onUnsubscribe={openUnsubscribe}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <AppHeader />
      <main
        id={MAIN_CONTENT_ID}
        className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pt-8 pb-32 sm:px-6"
      >
        {isDemo && (
          <Notice tone="demo" title={t('dashboard.demoBannerTitle')}>
            {t('dashboard.demoBannerBody')}
          </Notice>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {isDemo ? t('dashboard.titleDemo') : t('dashboard.title')}
          </h1>
          {result && (
            <Button variant="secondary" size="sm" onClick={() => scan(lastLimit)}>
              {t('dashboard.rescan')}
            </Button>
          )}
        </div>

        {renderBody()}

        <PrivacyPanel />
      </main>

      <UnsubscribeDialog newsletter={activeNewsletter} onClose={() => setActiveKey(null)} />
      <BulkUnsubscribeDialog
        open={bulkOpen}
        newsletters={selectedNewsletters}
        onClose={() => setBulkOpen(false)}
      />
    </div>
  );
}
