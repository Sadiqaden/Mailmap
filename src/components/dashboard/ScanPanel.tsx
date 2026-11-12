import { useId, useState } from 'react';
import { DEFAULT_SCAN_LIMIT, SCAN_LIMITS, type ScanLimit } from '../../features/discovery/scan';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { ProgressBar, Spinner } from '../ui/Spinner';

/** Shown before the first real scan: explains what happens and lets the user pick a limit. */
export function ScanReadyPanel({ onStart }: { onStart: (limit: ScanLimit) => void }) {
  const { t } = useI18n();
  const [limit, setLimit] = useState<ScanLimit>(DEFAULT_SCAN_LIMIT);
  const selectId = useId();

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name="search" className="size-5" />
        </span>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{t('dashboard.readyTitle')}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              {t('dashboard.readyBody')}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-slate-700">
                {t('dashboard.limitLabel')}
              </label>
              <select
                id={selectId}
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value) as ScanLimit)}
                className="h-10 rounded-lg border border-slate-300 bg-white pr-8 pl-3 text-sm shadow-sm"
              >
                {SCAN_LIMITS.map((value) => (
                  <option key={value} value={value}>
                    {t('dashboard.limitOption', { count: value })}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={() => onStart(limit)}>{t('dashboard.startScan')}</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ScanProgressPanel({
  processed,
  target,
  onCancel,
}: {
  processed: number;
  target: number;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  return (
    <Card className="p-6 sm:p-8" aria-busy="true">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Spinner className="size-5 text-brand-600" />
          <h2 className="text-lg font-semibold">{t('dashboard.scanningTitle')}</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {t('dashboard.cancelScan')}
        </Button>
      </div>
      <div className="mt-5 space-y-2">
        <ProgressBar value={processed} max={target} label={t('dashboard.scanningTitle')} />
        <p className="text-sm text-slate-600" role="status" aria-live="polite">
          {t('dashboard.scanningProgress', { processed, target })}
        </p>
      </div>
    </Card>
  );
}
