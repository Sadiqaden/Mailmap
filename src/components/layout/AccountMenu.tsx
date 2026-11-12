import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useI18n } from '../../hooks/useI18n';
import { useSession } from '../../hooks/useSession';
import { cx } from '../../utils/cx';
import { Icon } from '../ui/Icon';

/**
 * Account disclosure menu: who is connected, privacy link, disconnect.
 * Implemented as a disclosure (button + panel), which is simpler to make accessible
 * than a full ARIA menu and works well with keyboard and screen readers.
 */
export function AccountMenu() {
  const { t } = useI18n();
  const { provider, disconnect } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!provider) return null;
  const isDemo = provider.isSimulation;

  async function handleDisconnect() {
    setOpen(false);
    await disconnect();
    navigate('/');
  }

  return (
    <div ref={container} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Icon name="user" className="size-3.5" />
        </span>
        <span className="sr-only">{t('account.menuLabel')}</span>
        <Icon
          name="chevronDown"
          className={cx('size-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="animate-fade-in absolute right-0 z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-[var(--shadow-card-hover)]"
        >
          <p className="truncate px-3 pt-2 pb-1 text-sm font-medium text-slate-900">
            {provider.accountLabel}
          </p>
          <p className="px-3 pb-2 text-xs text-slate-500">
            {isDemo
              ? t('dashboard.connectionDemo')
              : provider.id === 'gmail'
                ? t('account.revokeGmail')
                : t('account.revokeOutlook')}
          </p>
          <div className="my-1 border-t border-slate-100" />
          <Link
            to="/privacy"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Icon name="shield" /> {t('account.privacy')}
          </Link>
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
          >
            <Icon name="logout" /> {isDemo ? t('account.exitDemo') : t('account.disconnect')}
          </button>
        </div>
      )}
    </div>
  );
}
