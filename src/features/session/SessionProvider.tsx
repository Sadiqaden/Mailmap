import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { MailProvider } from '../../integrations/types';
import { toProviderError } from '../../integrations/types';
import type { Newsletter, UnsubscribeMethod, UnsubscribeOutcome } from '../../types/newsletter';
import { runScan } from '../discovery/scan';
import { sendOneClickRequest } from '../unsubscribe/oneClick';
import { SessionContext, type SessionContextValue } from './sessionContext';
import { initialSessionState, sessionReducer } from './sessionReducer';

/** At most this many one-click requests run at the same time. */
const ONE_CLICK_CONCURRENCY = 2;

interface SessionProviderProps {
  children: ReactNode;
  /** Optional provider to connect immediately (used by the demo route). */
  initialProvider?: MailProvider;
  /** Injected in tests. */
  oneClick?: typeof sendOneClickRequest;
}

/**
 * Holds one mailbox session in memory.
 *
 * Demo and real sessions use *separate* instances of this provider (see routes), so
 * demo data can never mix with real account data. Nothing here is written to storage:
 * refreshing or closing the tab discards the session.
 */
export function SessionProvider({
  children,
  initialProvider,
  oneClick = sendOneClickRequest,
}: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const [provider, setProvider] = useState<MailProvider | null>(initialProvider ?? null);
  const scanController = useRef<AbortController | null>(null);

  // Abort any running scan when the session unmounts.
  useEffect(() => () => scanController.current?.abort(), []);

  const connect = useCallback((next: MailProvider) => {
    scanController.current?.abort();
    dispatch({ type: 'reset' });
    setProvider(next);
  }, []);

  const disconnect = useCallback(async () => {
    scanController.current?.abort();
    const current = provider;
    setProvider(null);
    dispatch({ type: 'reset' });
    if (current) {
      try {
        await current.disconnect();
      } catch {
        // Local state is already cleared; revocation failures are not fatal.
      }
    }
  }, [provider]);

  const startScan = useCallback(
    (maxMessages: number) => {
      if (!provider) return;
      scanController.current?.abort();
      const controller = new AbortController();
      scanController.current = controller;
      dispatch({ type: 'scan-started', target: maxMessages });

      runScan(provider, {
        maxMessages,
        signal: controller.signal,
        onProgress: (processed, target) => {
          if (!controller.signal.aborted) dispatch({ type: 'scan-progress', processed, target });
        },
      })
        .then((result) => {
          // A newer scan (or disconnect) replaced this one: ignore the stale result.
          if (scanController.current === controller) dispatch({ type: 'scan-finished', result });
        })
        .catch((error: unknown) => {
          if (scanController.current === controller) {
            dispatch({ type: 'scan-failed', code: toProviderError(error).code });
          }
        });
    },
    [provider],
  );

  const cancelScan = useCallback(() => scanController.current?.abort(), []);

  const setOutcome = (key: string, outcome: UnsubscribeOutcome) =>
    dispatch({ type: 'set-outcome', key, outcome });

  const sendOneClick = useCallback(
    async (newsletters: readonly Newsletter[]) => {
      const queue = newsletters.filter((n) => n.unsubscribe.primary?.kind === 'one-click');
      const simulate = provider?.isSimulation ?? true;

      async function process(newsletter: Newsletter) {
        const method = newsletter.unsubscribe.primary;
        if (method?.kind !== 'one-click') return;
        setOutcome(newsletter.key, { status: 'sending' });
        if (simulate) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          setOutcome(newsletter.key, { status: 'simulated', kind: 'one-click', at: Date.now() });
          return;
        }
        setOutcome(newsletter.key, await oneClick(method));
      }

      const workers = Array.from(
        { length: Math.min(ONE_CLICK_CONCURRENCY, queue.length) },
        async () => {
          while (queue.length > 0) {
            const next = queue.shift();
            if (next) await process(next);
          }
        },
      );
      await Promise.all(workers);
    },
    [provider, oneClick],
  );

  const recordManualStep = useCallback(
    (newsletter: Newsletter, method: UnsubscribeMethod) => {
      const at = Date.now();
      if (provider?.isSimulation ?? true) {
        setOutcome(newsletter.key, { status: 'simulated', kind: method.kind, at });
      } else if (method.kind === 'mailto') {
        setOutcome(newsletter.key, { status: 'manual-required', at });
      } else {
        setOutcome(newsletter.key, { status: 'page-opened', at });
      }
    },
    [provider],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      state,
      provider,
      connect,
      disconnect,
      startScan,
      cancelScan,
      toggleSelected: (key) => dispatch({ type: 'toggle-selected', key }),
      setSelected: (keys) => dispatch({ type: 'set-selected', keys }),
      clearSelection: () => dispatch({ type: 'clear-selection' }),
      sendOneClick,
      recordManualStep,
      outcomeFor: (key) => state.outcomes[key],
    }),
    [state, provider, connect, disconnect, startScan, cancelScan, sendOneClick, recordManualStep],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
