import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]',
        className,
      )}
      {...rest}
    />
  );
}
