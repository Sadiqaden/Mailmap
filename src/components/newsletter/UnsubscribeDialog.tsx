import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useSession } from '../../hooks/useSession';
import type { Newsletter, UnsubscribeMethod } from '../../types/newsletter';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { Notice } from '../ui/Notice';
import { OutcomeBadge } from './badges';
import { ManualStepAction } from './ManualStepAction';

interface UnsubscribeDialogProps {
  newsletter: Newsletter | null;
  onClose: () => void;
}

/**
 * Explains exactly what will happen, then lets the user confirm.
 * Nothing is sent or opened until the user clicks the action inside this dialog.
 */
export function UnsubscribeDialog({ newsletter, onClose }: UnsubscribeDialogProps) {
  const { t } = useI18n();
  const { provider, sendOneClick, recordManualStep, outcomeFor } = useSession();
  const [busy, setBusy] = useState(false);

  if (!newsletter) return null;

  const simulate = provider?.isSimulation ?? true;
  const primary = newsletter.unsubscribe.primary;
  const outcome = outcomeFor(newsletter.key);

  async function confirmOneClick() {
    if (!newsletter) return;
    setBusy(true);
    try {
      await sendOneClick([newsletter]);
    } finally {
      setBusy(false);
    }
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {outcome ? t('common.close') : t('common.cancel')}
      </Button>
      {primary?.kind === 'one-click' && !outcome && (
        <Button onClick={confirmOneClick} disabled={busy} icon={<Icon name="bolt" />}>
          {simulate
            ? `${t('unsubscribe.simulate')}: ${t('unsubscribe.oneClick.confirm')}`
            : t('unsubscribe.oneClick.confirm')}
        </Button>
      )}
    </>
  );

  return (
    <Dialog
      open
      onClose={onClose}
      title={t('unsubscribe.title', { name: newsletter.name })}
      description={
        newsletter.email ? t('unsubscribe.senderLine', { email: newsletter.email }) : undefined
      }
      footer={footer}
    >
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        {simulate && <Notice tone="demo">{t('unsubscribe.demoNote')}</Notice>}

        {outcome && (
          <div role="status" className="space-y-1">
            <OutcomeBadge outcome={outcome} />
            {outcome.status === 'request-sent' && (
              <p className="text-slate-600">{t('outcome.requestSentHint')}</p>
            )}
          </div>
        )}

        {primary ? (
          <MethodExplanation
            method={primary}
            simulate={simulate}
            onManualStep={(method) => recordManualStep(newsletter, method)}
          />
        ) : (
          <NoMethodHelp />
        )}

        {newsletter.unsubscribe.alternatives.length > 0 && (
          <section className="border-t border-slate-100 pt-4">
            <h3 className="mb-2 font-semibold text-slate-900">
              {t('unsubscribe.alternativesTitle')}
            </h3>
            <ul className="space-y-2">
              {newsletter.unsubscribe.alternatives.map((method, index) =>
                method.kind === 'one-click' ? null : (
                  <li key={index} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-600">
                      {method.kind === 'web' ? method.host : method.address}
                    </span>
                    <ManualStepAction
                      method={method}
                      simulate={simulate}
                      variant="secondary"
                      size="sm"
                      onDone={() => recordManualStep(newsletter, method)}
                    />
                  </li>
                ),
              )}
            </ul>
          </section>
        )}

        {newsletter.unsubscribe.rejectedCount > 0 && (
          <Notice tone="warning">
            {t('unsubscribe.rejected', { count: newsletter.unsubscribe.rejectedCount })}
          </Notice>
        )}
      </div>
    </Dialog>
  );
}

function MethodExplanation({
  method,
  simulate,
  onManualStep,
}: {
  method: UnsubscribeMethod;
  simulate: boolean;
  onManualStep: (method: UnsubscribeMethod) => void;
}) {
  const { t } = useI18n();

  if (method.kind === 'one-click') {
    return (
      <section>
        <h3 className="mb-2 font-semibold text-slate-900">{t('unsubscribe.oneClick.heading')}</h3>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>{t('unsubscribe.oneClick.p1', { host: method.host })}</li>
          <li>{t('unsubscribe.oneClick.p2')}</li>
          <li>{t('unsubscribe.oneClick.p3')}</li>
        </ul>
      </section>
    );
  }

  if (method.kind === 'web') {
    return (
      <section className="space-y-3">
        <h3 className="font-semibold text-slate-900">{t('unsubscribe.web.heading')}</h3>
        <p>{t('unsubscribe.web.p1', { host: method.host })}</p>
        <p>{t('unsubscribe.web.p2')}</p>
        {method.insecure && <Notice tone="warning">{t('unsubscribe.web.insecure')}</Notice>}
        <ManualStepAction method={method} simulate={simulate} onDone={() => onManualStep(method)} />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-900">{t('unsubscribe.mailto.heading')}</h3>
      <p>{t('unsubscribe.mailto.p1', { address: method.address })}</p>
      <p>{t('unsubscribe.mailto.p2')}</p>
      <ManualStepAction method={method} simulate={simulate} onDone={() => onManualStep(method)} />
    </section>
  );
}

function NoMethodHelp() {
  const { t } = useI18n();
  return (
    <section className="space-y-2">
      <h3 className="font-semibold text-slate-900">{t('unsubscribe.none.heading')}</h3>
      <p>{t('unsubscribe.none.p1')}</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>{t('unsubscribe.none.tip1')}</li>
        <li>{t('unsubscribe.none.tip2')}</li>
        <li>{t('unsubscribe.none.tip3')}</li>
      </ul>
    </section>
  );
}
