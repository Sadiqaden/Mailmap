import { describe, expect, it } from 'vitest';
import { EXPECTED_DEMO_NEWSLETTERS } from '../../demo/demoData';
import { DemoProvider } from '../../demo/demoProvider';
import { ProviderError, type MailProvider } from '../../integrations/types';
import { NOW } from '../../test/fixtures';
import { runScan } from './scan';

const demo = () => new DemoProvider({ batchDelayMs: 0, now: () => NOW });

describe('runScan', () => {
  it('scans the demo mailbox and reports progress', async () => {
    const progress: number[] = [];
    const result = await runScan(demo(), {
      maxMessages: 1000,
      signal: new AbortController().signal,
      onProgress: (processed) => progress.push(processed),
      now: () => NOW,
    });
    expect(result.newsletters).toHaveLength(EXPECTED_DEMO_NEWSLETTERS);
    expect(result.partial).toBe(false);
    expect(result.completedAt).toBe(NOW);
    expect(progress.at(-1)).toBe(result.scannedMessages);
  });

  it('honours the scan limit', async () => {
    const result = await runScan(demo(), {
      maxMessages: 50,
      signal: new AbortController().signal,
      onProgress: () => {},
    });
    expect(result.scannedMessages).toBe(50);
  });

  it('returns partial results when cancelled', async () => {
    const controller = new AbortController();
    const result = await runScan(new DemoProvider({ batchDelayMs: 5, now: () => NOW }), {
      maxMessages: 1000,
      signal: controller.signal,
      onProgress: (processed) => {
        if (processed > 0) controller.abort();
      },
    });
    expect(result.partial).toBe(true);
    expect(result.scannedMessages).toBeGreaterThan(0);
    expect(result.scannedMessages).toBeLessThan(259);
  });

  it('converts provider failures to ProviderError', async () => {
    const failing: MailProvider = {
      id: 'gmail',
      isSimulation: false,
      accountLabel: 'x',
      fetchMessageMetadata: () => Promise.reject(new TypeError('Failed to fetch')),
      disconnect: () => Promise.resolve(),
    };
    await expect(
      runScan(failing, {
        maxMessages: 10,
        signal: new AbortController().signal,
        onProgress: () => {},
      }),
    ).rejects.toBeInstanceOf(ProviderError);
  });
});
