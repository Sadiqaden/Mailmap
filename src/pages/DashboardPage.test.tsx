import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EXPECTED_DEMO_NEWSLETTERS } from '../demo/demoData';
import { DemoProvider } from '../demo/demoProvider';
import { ProviderError } from '../integrations/types';
import { message } from '../test/fixtures';
import { fakeProvider, renderWithProviders } from '../test/render';
import { DashboardPage } from './DashboardPage';
import { DemoPage } from './DemoPage';

const fastDemo = () => new DemoProvider({ batchDelayMs: 0 });

async function renderScannedDemo() {
  const utils = renderWithProviders(<DashboardPage />, { provider: fastDemo() });
  await utils.user.click(screen.getByRole('button', { name: 'Start scan' }));
  await screen.findByTestId('newsletter-grid');
  return utils;
}

describe('DashboardPage', () => {
  it('shows a "not connected" state without a session', () => {
    renderWithProviders(<DashboardPage />, { withSession: true });
    expect(screen.getByText('No mailbox connected')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore the demo' })).toHaveAttribute('href', '/demo');
  });

  it('asks before scanning a real account and offers scan limits', () => {
    renderWithProviders(<DashboardPage />, { provider: fakeProvider() });
    expect(screen.getByText('Ready to scan')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Messages to scan' })).toHaveValue('500');
  });

  it('shows a loading state while scanning', async () => {
    const { user } = renderWithProviders(<DashboardPage />, {
      provider: fakeProvider({ fetchMessageMetadata: () => new Promise(() => {}) }),
    });
    await user.click(screen.getByRole('button', { name: 'Start scan' }));
    expect(screen.getByText('Scanning your mailbox')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows an error state with reconnect for expired sessions', async () => {
    const { user } = renderWithProviders(<DashboardPage />, {
      provider: fakeProvider({
        fetchMessageMetadata: () => Promise.reject(new ProviderError('unauthorized')),
      }),
    });
    await user.click(screen.getByRole('button', { name: 'Start scan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your session has expired');
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
  });

  it('shows an empty state when nothing is detected', async () => {
    const { user } = renderWithProviders(<DashboardPage />, {
      provider: fakeProvider({
        fetchMessageMetadata: async ({ onBatch }) => onBatch([message({ id: '1' })]),
      }),
    });
    await user.click(screen.getByRole('button', { name: 'Start scan' }));
    expect(await screen.findByText('No newsletters found')).toBeInTheDocument();
    expect(screen.getByTestId('stat-senders')).toHaveTextContent('0');
  });

  it('shows stats derived from the detected list', async () => {
    await renderScannedDemo();
    expect(screen.getByTestId('stat-senders')).toHaveTextContent(String(EXPECTED_DEMO_NEWSLETTERS));
    expect(screen.getAllByTestId('newsletter-card')).toHaveLength(EXPECTED_DEMO_NEWSLETTERS);
    expect(screen.getByText(/Based on 259 scanned messages/)).toBeInTheDocument();
  });

  it('searches, filters and resets', async () => {
    const { user } = await renderScannedDemo();
    await user.type(screen.getByRole('searchbox', { name: 'Search newsletters' }), 'nordlys');
    expect(screen.getAllByTestId('newsletter-card')).toHaveLength(1);
    expect(screen.getByTestId('result-count')).toHaveTextContent(
      `Showing 1 of ${EXPECTED_DEMO_NEWSLETTERS} newsletters`,
    );

    await user.clear(screen.getByRole('searchbox', { name: 'Search newsletters' }));
    await user.type(
      screen.getByRole('searchbox', { name: 'Search newsletters' }),
      'no-such-sender',
    );
    expect(screen.getByText('No newsletters match')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search and filters' }));
    expect(screen.getAllByTestId('newsletter-card')).toHaveLength(EXPECTED_DEMO_NEWSLETTERS);
  });

  it('filters by "Manual action required" and sorts by most emails', async () => {
    const { user } = await renderScannedDemo();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'count');
    const first = screen.getAllByTestId('newsletter-card')[0]!;
    expect(within(first).getByRole('heading')).toHaveTextContent('The Morning Byte');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter' }), 'manual');
    for (const card of screen.getAllByTestId('newsletter-card')) {
      expect(within(card).queryByText('One-click unsubscribe')).toBeNull();
    }
  });

  it('supports bulk selection', async () => {
    const { user } = await renderScannedDemo();
    const cards = screen.getAllByTestId('newsletter-card');
    await user.click(within(cards[0]!).getByRole('checkbox'));
    await user.click(within(cards[1]!).getByRole('checkbox'));
    const toolbar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(toolbar).toHaveTextContent('2 selected');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter' }), 'selected');
    expect(screen.getAllByTestId('newsletter-card')).toHaveLength(2);

    await user.click(within(toolbar).getByRole('button', { name: 'Unsubscribe from selected' }));
    expect(
      screen.getByRole('dialog', { name: 'Unsubscribe from 2 newsletters' }),
    ).toBeInTheDocument();
  });

  it('labels demo mode clearly', async () => {
    renderWithProviders(<DemoPage />);
    expect(screen.getByText('Demo mode, with invented data')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo dashboard');
  });
});

describe('Language switching', () => {
  it('switches between Norwegian and English without reloading', async () => {
    // The dashboard header contains the language switcher.
    const { user } = renderWithProviders(<DashboardPage />, { locale: 'nb', withSession: true });
    expect(screen.getByText('Ingen e-postkonto tilkoblet')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('nb');

    await user.click(screen.getByRole('button', { name: /English/ }));
    expect(screen.getByText('No mailbox connected')).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
    expect(window.localStorage.getItem('mailmap.locale')).toBe('en');
  });
});
