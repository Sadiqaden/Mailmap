import { useI18n } from '../../hooks/useI18n';
import { useOutcomeLabel } from '../../hooks/useOutcomeLabel';
import type { UnsubscribeKind, UnsubscribeOutcome } from '../../types/newsletter';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Icon, type IconName } from '../ui/Icon';
import { Spinner } from '../ui/Spinner';

const METHOD_STYLE: Record<UnsubscribeKind, { tone: BadgeTone; icon: IconName }> = {
  'one-click': { tone: 'green', icon: 'bolt' },
  web: { tone: 'blue', icon: 'external' },
  mailto: { tone: 'blue', icon: 'mail' },
  none: { tone: 'neutral', icon: 'info' },
};

export function MethodBadge({ kind }: { kind: UnsubscribeKind }) {
  const { t } = useI18n();
  const style = METHOD_STYLE[kind];
  return (
    <Badge tone={style.tone} icon={<Icon name={style.icon} className="size-3" />}>
      {t(`card.method.${kind}`)}
    </Badge>
  );
}

const OUTCOME_TONE: Record<UnsubscribeOutcome['status'], BadgeTone> = {
  sending: 'neutral',
  'request-sent': 'green',
  'page-opened': 'amber',
  'manual-required': 'amber',
  failed: 'red',
  simulated: 'blue',
};

export function OutcomeBadge({ outcome }: { outcome: UnsubscribeOutcome }) {
  const label = useOutcomeLabel();
  const icon =
    outcome.status === 'sending' ? (
      <Spinner className="size-3" />
    ) : (
      <Icon
        name={
          outcome.status === 'failed'
            ? 'alert'
            : outcome.status === 'request-sent'
              ? 'check'
              : 'clock'
        }
        className="size-3"
      />
    );
  return (
    <Badge tone={OUTCOME_TONE[outcome.status]} icon={icon}>
      {label(outcome)}
    </Badge>
  );
}
