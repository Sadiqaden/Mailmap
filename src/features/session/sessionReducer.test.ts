import { describe, expect, it } from 'vitest';
import { newsletter, NOW } from '../../test/fixtures';
import { initialSessionState, sessionReducer, type SessionState } from './sessionReducer';

const result = {
  newsletters: [newsletter({ key: 'a' }), newsletter({ key: 'b' })],
  scannedMessages: 10,
  partial: false,
  completedAt: NOW,
};

describe('sessionReducer', () => {
  it('moves through scanning → done', () => {
    let state = sessionReducer(initialSessionState, { type: 'scan-started', target: 500 });
    expect(state.scan).toEqual({ status: 'scanning', processed: 0, target: 500 });
    state = sessionReducer(state, { type: 'scan-progress', processed: 100, target: 500 });
    expect(state.scan).toMatchObject({ processed: 100 });
    state = sessionReducer(state, { type: 'scan-finished', result });
    expect(state.scan.status).toBe('done');
    expect(state.newsletters).toHaveLength(2);
  });

  it('ignores progress when not scanning', () => {
    expect(
      sessionReducer(initialSessionState, { type: 'scan-progress', processed: 1, target: 2 }),
    ).toBe(initialSessionState);
  });

  it('toggles, sets and clears selection immutably', () => {
    const s1 = sessionReducer(initialSessionState, { type: 'toggle-selected', key: 'a' });
    expect([...s1.selected]).toEqual(['a']);
    expect(initialSessionState.selected.size).toBe(0);
    const s2 = sessionReducer(s1, { type: 'toggle-selected', key: 'a' });
    expect(s2.selected.size).toBe(0);
    const s3 = sessionReducer(s2, { type: 'set-selected', keys: ['a', 'b', 'a'] });
    expect(s3.selected.size).toBe(2);
    expect(sessionReducer(s3, { type: 'clear-selection' }).selected.size).toBe(0);
  });

  it('keeps unsubscribe outcomes across a re-scan but clears them on reset', () => {
    let state: SessionState = sessionReducer(initialSessionState, {
      type: 'set-outcome',
      key: 'a',
      outcome: { status: 'request-sent', at: NOW },
    });
    state = sessionReducer(state, { type: 'scan-started', target: 10 });
    expect(state.outcomes.a).toBeDefined();
    expect(sessionReducer(state, { type: 'reset' }).outcomes).toEqual({});
  });

  it('records scan errors', () => {
    expect(
      sessionReducer(initialSessionState, { type: 'scan-failed', code: 'rate-limited' }).scan,
    ).toEqual({
      status: 'error',
      code: 'rate-limited',
    });
  });
});
