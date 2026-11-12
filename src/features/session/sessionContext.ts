import { createContext } from 'react';
import type { MailProvider } from '../../integrations/types';
import type { Newsletter, UnsubscribeMethod, UnsubscribeOutcome } from '../../types/newsletter';
import type { SessionState } from './sessionReducer';

export interface SessionContextValue {
  state: SessionState;
  /** The connected provider, or null when nothing is connected. */
  provider: MailProvider | null;
  connect: (provider: MailProvider) => void;
  disconnect: () => Promise<void>;
  startScan: (maxMessages: number) => void;
  cancelScan: () => void;
  toggleSelected: (key: string) => void;
  setSelected: (keys: readonly string[]) => void;
  clearSelection: () => void;
  /** Execute one-click requests (or simulate them in demo mode) for the given newsletters. */
  sendOneClick: (newsletters: readonly Newsletter[]) => Promise<void>;
  /** Record that the user opened a web page / email draft (or simulate it in demo mode). */
  recordManualStep: (newsletter: Newsletter, method: UnsubscribeMethod) => void;
  outcomeFor: (key: string) => UnsubscribeOutcome | undefined;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
