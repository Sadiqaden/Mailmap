import { cx } from '../../utils/cx';
import { hashString, initialsFor } from '../../utils/text';

/**
 * Initials avatar.
 *
 * Mailmap intentionally does NOT load sender logos: fetching favicons from sender
 * domains (or a favicon service) would reveal which newsletters you receive to
 * third parties, and load untrusted images. Initials are private and predictable.
 */
const PALETTE = [
  'bg-brand-100 text-brand-800',
  'bg-sky-100 text-sky-800',
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
  'bg-slate-200 text-slate-800',
  'bg-violet-100 text-violet-800',
] as const;

export function Avatar({
  name,
  seed,
  className,
}: {
  name: string;
  seed: string;
  className?: string;
}) {
  const colour = PALETTE[hashString(seed) % PALETTE.length];
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
        colour,
        className,
      )}
    >
      {initialsFor(name)}
    </span>
  );
}
