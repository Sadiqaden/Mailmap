import { useI18n } from '../../hooks/useI18n';
import type { UnsubscribeMethod } from '../../types/newsletter';
import { Button } from '../ui/Button';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '../ui/buttonStyles';
import { Icon } from '../ui/Icon';

interface ManualStepActionProps {
  method: Extract<UnsubscribeMethod, { kind: 'web' | 'mailto' }>;
  simulate: boolean;
  onDone: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * The control for steps the user completes themselves.
 *
 * We render a real <a> the user clicks, rather than calling `window.open` from code:
 *  - the browser shows the real destination on hover,
 *  - pop-up blockers don't interfere,
 *  - `rel="noopener noreferrer"` stops the page from controlling Mailmap's tab and hides
 *    the referrer.
 * In demo mode it is a plain button, so nothing is opened.
 */
export function ManualStepAction({
  method,
  simulate,
  onDone,
  variant = 'primary',
  size = 'md',
}: ManualStepActionProps) {
  const { t } = useI18n();
  const label =
    method.kind === 'web'
      ? t('unsubscribe.web.open', { host: method.host })
      : t('unsubscribe.mailto.compose');

  if (simulate) {
    return (
      <Button variant={variant} size={size} onClick={onDone}>
        {t('unsubscribe.simulate')}: {label}
      </Button>
    );
  }

  if (method.kind === 'web') {
    return (
      <a
        href={method.url}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
        onClick={onDone}
        className={buttonClasses(variant, size)}
      >
        <Icon name="external" />
        {label}
        <span className="sr-only"> {t('common.newTab')}</span>
      </a>
    );
  }

  return (
    <a href={method.href} onClick={onDone} className={buttonClasses(variant, size)}>
      <Icon name="mail" />
      {label}
    </a>
  );
}
