import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';

interface BulkActionBarProps {
  selectedCount: number;
  visibleCount: number;
  onSelectVisible: () => void;
  onClear: () => void;
  onUnsubscribe: () => void;
}

/** Sticky bar at the bottom of the screen while newsletters are selected. */
export function BulkActionBar({
  selectedCount,
  visibleCount,
  onSelectVisible,
  onClear,
  onUnsubscribe,
}: BulkActionBarProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onSelectVisible} disabled={visibleCount === 0}>
          {t('selection.selectVisible')}
        </Button>
        {selectedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t('selection.clear')}
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <div
          role="toolbar"
          aria-label={t('selection.toolbarLabel')}
          className="animate-rise-in fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[var(--shadow-dialog)]"
        >
          <p className="text-sm font-medium text-slate-800" aria-live="polite">
            {t('selection.count', { count: selectedCount })}
          </p>
          <Button onClick={onUnsubscribe}>{t('selection.bulkUnsubscribe')}</Button>
        </div>
      )}
    </div>
  );
}
