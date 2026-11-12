import type { ProviderErrorCode } from '../../integrations/types';
import type { Newsletter, UnsubscribeOutcome } from '../../types/newsletter';
import type { ScanResult } from '../discovery/scan';

export type ScanState =
  | { status: 'idle' }
  | { status: 'scanning'; processed: number; target: number }
  | { status: 'done'; result: ScanResult }
  | { status: 'error'; code: ProviderErrorCode };

export interface SessionState {
  scan: ScanState;
  /** Newsletters from the latest scan (empty until a scan has finished). */
  newsletters: Newsletter[];
  /** Keys of selected newsletters. */
  selected: ReadonlySet<string>;
  /** Unsubscribe attempts by newsletter key. Lives in memory only. */
  outcomes: Readonly<Record<string, UnsubscribeOutcome>>;
}

export const initialSessionState: SessionState = {
  scan: { status: 'idle' },
  newsletters: [],
  selected: new Set(),
  outcomes: {},
};

export type SessionAction =
  | { type: 'scan-started'; target: number }
  | { type: 'scan-progress'; processed: number; target: number }
  | { type: 'scan-finished'; result: ScanResult }
  | { type: 'scan-failed'; code: ProviderErrorCode }
  | { type: 'toggle-selected'; key: string }
  | { type: 'set-selected'; keys: readonly string[] }
  | { type: 'clear-selection' }
  | { type: 'set-outcome'; key: string; outcome: UnsubscribeOutcome }
  | { type: 'reset' };

/**
 * Pure state transitions for a mailbox session. Keeping this a plain function
 * (no React, no side effects) makes it easy to test and reason about.
 */
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'scan-started':
      return {
        ...initialSessionState,
        // Keep earlier unsubscribe results visible across re-scans.
        outcomes: state.outcomes,
        scan: { status: 'scanning', processed: 0, target: action.target },
      };
    case 'scan-progress':
      if (state.scan.status !== 'scanning') return state;
      return {
        ...state,
        scan: { status: 'scanning', processed: action.processed, target: action.target },
      };
    case 'scan-finished':
      return {
        ...state,
        scan: { status: 'done', result: action.result },
        newsletters: action.result.newsletters,
        selected: new Set(),
      };
    case 'scan-failed':
      return { ...state, scan: { status: 'error', code: action.code } };
    case 'toggle-selected': {
      const selected = new Set(state.selected);
      if (selected.has(action.key)) selected.delete(action.key);
      else selected.add(action.key);
      return { ...state, selected };
    }
    case 'set-selected':
      return { ...state, selected: new Set(action.keys) };
    case 'clear-selection':
      return { ...state, selected: new Set() };
    case 'set-outcome':
      return { ...state, outcomes: { ...state.outcomes, [action.key]: action.outcome } };
    case 'reset':
      return initialSessionState;
  }
}
