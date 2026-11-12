import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from './Icon';

type Tone = 'info' | 'warning' | 'error' | 'demo';

const STYLES: Record<Tone, { box: string; icon: IconName }> = {
  info: { box: 'border-brand-200 bg-brand-50 text-brand-900', icon: 'info' },
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'alert' },
  error: { box: 'border-rose-200 bg-rose-50 text-rose-900', icon: 'alert' },
  demo: { box: 'border-violet-200 bg-violet-50 text-violet-900', icon: 'sparkle' },
};

/** Inline message box. Use `role="alert"` only for errors that appear after an action. */
export function Notice({
  tone = 'info',
  title,
  children,
  role,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  role?: 'alert' | 'status';
  className?: string;
}) {
  const style = STYLES[tone];
  return (
    <div
      role={role}
      className={cx('flex gap-3 rounded-xl border p-4 text-sm', style.box, className)}
    >
      <Icon name={style.icon} className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
