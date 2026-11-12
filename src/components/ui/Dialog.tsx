import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { cx } from '../../utils/cx';
import { Icon } from './Icon';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

/**
 * Accessible modal built on the native <dialog> element.
 *
 * `showModal()` gives us, for free: a focus trap, Escape to close, an inert page
 * behind the dialog and a proper `dialog` role. Focus returns to the element that
 * opened it when the dialog closes.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => {
      // Close first: while the modal is open the rest of the page is inert and can't take focus.
      if (dialog.open) dialog.close();
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        // Escape key: let React state drive closing.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself, outside the panel).
        if (event.target === ref.current) onClose();
      }}
      className={cx(
        'm-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 text-slate-900 shadow-[var(--shadow-dialog)]',
        'open:animate-rise-in max-h-[min(90vh,100%)]',
        size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
      )}
    >
      {open && (
        <div className="flex max-h-[90vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-5 pb-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-balance">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm text-slate-600">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label={t('common.close')}
            >
              <Icon name="x" className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
