import { useState } from 'react';
import { partitionForBulk } from '../../features/unsubscribe/bulk';
import { useI18n } from '../../hooks/useI18n';
import { useSession } from '../../hooks/useSession';
import type { Newsletter } from '../../types/newsletter';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { Notice } from '../ui/Notice';
import { OutcomeBadge } from './badges';
import { ManualStepAction } from './ManualStepAction';

interface BulkUnsubscribeDialogProps {
  open: boolean;
  newsletters: readonly Newsletter[];
  onClose: () => void;
}

/**
 * Bulk unsubscribe.
 * - One-click items are sent only after a single, explicit confirmation for this batch.
 * - Web-page and email items are listed with individual buttons, because a browser
 *   page cannot (and should not) complete other websites' forms automatically.
 * - Items without a method are listed so nothing silently disappears.
 */
export function BulkUnsubscribeDialog({ open, newsletters, onClose }: BulkUnsubscribeDialogProps) {
  const { t } = useI18n();
  const { provider, sendOneClick, recordManualStep, outcomeFor } = useSession();
  const [phase, setPhase] = useState<'review' | 'sending' | 'done'>('review');
  const simulate = provider?.isSimulation ?? true;
  const { oneClick, manual, unavailable } = partitionForBulk(newsletters);

  function close() {
    setPhase('review');
    onClose();
  }

  async function confirm() {
    setPhase('sending');
    await sendOneClick(oneClick);
    setPhase('done');
  }

  const confirmLabel = t(simulate ? 'bulk.confirmDemo' : 'bulk.confirm', {
    count: oneClick.length,
  });

  const footer =
    phase === 'review' ? (
      <>
        <Button variant="secondary" onClick={close}>
          {t('common.cancel')}
        </Button>
        {oneClick.length > 0 && (
          <Button onClick={confirm} icon={<Icon name="bolt" />}>
            {confirmLabel}
          </Button>
        )}
      </>
    ) : (
      <Button onClick={close} disabled={phase === 'sending'}>
        {t('bulk.done')}
      </Button>
    );

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={t('bulk.title', { count: newsletters.length })}
      description={t('bulk.intro')}
      footer={footer}
    >
      <div className="space-y-6 text-sm">
        {simulate && <Notice tone="demo">{t('unsubscribe.demoNote')}</Notice>}

        <section aria-labelledby="bulk-one-click">
          <h3 id="bulk-one-click" className="font-semibold text-slate-900">
            {t('bulk.oneClickTitle')} ({oneClick.length})
          </h3>
          {oneClick.length > 0 ? (
            <>
              <p className="mt-1 text-slate-600">{t('bulk.oneClickNote')}</p>
              <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {oneClick.map((n) => {
                  const outcome = outcomeFor(n.key);
                  return (
                    <li
                      key={n.key}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                      data-testid="bulk-item"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-900">{n.name}</span>
                        <span className="block truncate text-slate-500">
                          {n.unsubscribe.primary?.kind === 'one-click'
                            ? n.unsubscribe.primary.host
                            : ''}
                        </span>
                      </span>
                      {outcome && <OutcomeBadge outcome={outcome} />}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-slate-600">{t('bulk.nothingAutomatic')}</p>
          )}
        </section>

        {manual.length > 0 && (
          <section aria-labelledby="bulk-manual">
            <h3 id="bulk-manual" className="font-semibold text-slate-900">
              {t('bulk.manualTitle')} ({manual.length})
            </h3>
            <p className="mt-1 text-slate-600">{t('bulk.manualNote')}</p>
            <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
              {manual.map((n) => {
                const method = n.unsubscribe.primary;
                if (method?.kind !== 'web' && method?.kind !== 'mailto') return null;
                const outcome = outcomeFor(n.key);
                return (
                  <li
                    key={n.key}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    data-testid="bulk-item"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-900">{n.name}</span>
                      <span className="block truncate text-slate-500">
                        {t(`card.method.${method.kind}`)}
                      </span>
                    </span>
                    {outcome ? (
                      <OutcomeBadge outcome={outcome} />
                    ) : (
                      <ManualStepAction
                        method={method}
                        simulate={simulate}
                        variant="secondary"
                        size="sm"
                        onDone={() => recordManualStep(n, method)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {unavailable.length > 0 && (
          <section aria-labelledby="bulk-unavailable">
            <h3 id="bulk-unavailable" className="font-semibold text-slate-900">
              {t('bulk.unavailableTitle')} ({unavailable.length})
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              {unavailable.map((n) => (
                <li key={n.key} data-testid="bulk-item">
                  {n.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-slate-600">{t('unsubscribe.none.tip1')}</p>
          </section>
        )}

        {phase !== 'review' && (
          <p role="status" className="sr-only">
            {phase === 'sending' ? t('outcome.sending') : t('bulk.resultsTitle')}
          </p>
        )}
      </div>
    </Dialog>
  );
}
