import type { UnsubscribeOutcome } from '../types/newsletter';
import { useI18n } from './useI18n';

/** Text for an outcome. Shared by cards, dialogs and tests. */
export function useOutcomeLabel() {
  const { t } = useI18n();
  return (outcome: UnsubscribeOutcome): string => {
    switch (outcome.status) {
      case 'sending':
        return t('outcome.sending');
      case 'request-sent':
        return t('outcome.requestSent');
      case 'page-opened':
        return t('outcome.pageOpened');
      case 'manual-required':
        return t('outcome.manualRequired');
      case 'failed':
        return t(`outcome.failed.${outcome.reason}`);
      case 'simulated':
        return t('outcome.simulated');
    }
  };
}
