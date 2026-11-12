import { memo, useId } from 'react';
import { isRecentlyActive } from '../../features/discovery/frequency';
import { useI18n } from '../../hooks/useI18n';
import type { Newsletter, UnsubscribeOutcome } from '../../types/newsletter';
import { cx } from '../../utils/cx';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { MethodBadge, OutcomeBadge } from './badges';

interface NewsletterCardProps {
  newsletter: Newsletter;
  selected: boolean;
  outcome: UnsubscribeOutcome | undefined;
  /** Reference time for "recently active" and relative dates (scan completion time). */
  now: number;
  onToggleSelected: (key: string) => void;
  onUnsubscribe: (newsletter: Newsletter) => void;
}

/**
 * One newsletter sender. All text comes from email headers and is rendered as plain
 * text by React (never as HTML).
 */
export const NewsletterCard = memo(function NewsletterCard({
  newsletter,
  selected,
  outcome,
  now,
  onToggleSelected,
  onUnsubscribe,
}: NewsletterCardProps) {
  const { t, formatRelative, formatDate } = useI18n();
  const titleId = useId();
  const kind = newsletter.unsubscribe.primary?.kind ?? 'none';
  const recent = isRecentlyActive(newsletter.lastSeenAt, now);
  const actionLabel = outcome ? t('card.action.details') : t(`card.action.${kind}`);

  return (
    <article
      aria-labelledby={titleId}
      data-testid="newsletter-card"
      className={cx(
        'group flex flex-col rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200 hover:shadow-[var(--shadow-card-hover)]',
        selected ? 'border-brand-400 ring-1 ring-brand-400' : 'border-slate-200',
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelected(newsletter.key)}
          aria-label={t('card.select', { name: newsletter.name })}
          className="mt-3 size-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-600"
        />
        <Avatar name={newsletter.name} seed={newsletter.key} />
        <div className="min-w-0 flex-1">
          <h3
            id={titleId}
            className="truncate font-semibold text-slate-900"
            title={newsletter.name}
          >
            {newsletter.name}
          </h3>
          <p
            className="truncate text-sm text-slate-500"
            title={newsletter.email || newsletter.domain}
          >
            {newsletter.email || newsletter.domain}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-medium text-slate-900" data-testid="email-count">
            {t('card.emails', { count: newsletter.messageCount })}
          </span>
          <span className="text-slate-600">
            {t('card.lastReceived')}{' '}
            <time
              dateTime={new Date(newsletter.lastSeenAt).toISOString()}
              title={formatDate(newsletter.lastSeenAt)}
            >
              {formatRelative(newsletter.lastSeenAt, now)}
            </time>
          </span>
        </p>
        <p className="flex items-center gap-1.5 text-slate-600">
          <Icon name="clock" className="size-4 shrink-0 text-slate-400" />
          <span className="sr-only">{t('card.frequencyLabel')}:</span>
          {t(`card.frequency.${newsletter.frequency}`)}
          <span className="text-slate-400">({t('card.estimate')})</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge tone={recent ? 'green' : 'neutral'}>
          {recent ? t('card.activity.recent') : t('card.activity.inactive')}
        </Badge>
        <MethodBadge kind={kind} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{t(`card.confidence.${newsletter.confidence}`)}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <div role="status" className="min-h-6">
          {outcome && <OutcomeBadge outcome={outcome} />}
        </div>
        <Button
          variant={kind === 'none' || outcome ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => onUnsubscribe(newsletter)}
          aria-label={`${actionLabel}: ${newsletter.name}`}
        >
          {actionLabel}
        </Button>
      </div>
    </article>
  );
});
