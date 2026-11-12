import { cx } from '../../utils/cx';

/**
 * Mailmap mark: an envelope whose flap doubles as a route between two map points.
 * Original artwork; the same drawing is used for public/favicon.svg.
 */
export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#2552d6" />
      <rect
        x="6.5"
        y="9.5"
        width="19"
        height="14"
        rx="2.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <path
        d="M7.5 11l8.5 6.2L24.5 11"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="11" r="2" fill="#93b6fb" />
      <circle cx="24.5" cy="11" r="2" fill="#93b6fb" />
      <circle cx="16" cy="17.2" r="2.2" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-slate-900">Mailmap</span>
    </span>
  );
}
