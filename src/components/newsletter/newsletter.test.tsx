import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DemoProvider } from '../../demo/demoProvider';
import { DAY, newsletter, NOW } from '../../test/fixtures';
import { fakeProvider, renderWithProviders } from '../../test/render';
import type { Newsletter } from '../../types/newsletter';
import { BulkUnsubscribeDialog } from './BulkUnsubscribeDialog';
import { NewsletterCard } from './NewsletterCard';
import { UnsubscribeDialog } from './UnsubscribeDialog';

const webNewsletter = newsletter({
  key: 'web',
  name: 'Pixel & Pine',
  unsubscribe: {
    primary: {
      kind: 'web',
      url: 'https://pixelpine.example/u',
      host: 'pixelpine.example',
      insecure: false,
    },
    alternatives: [],
    rejectedCount: 0,
  },
});
const mailtoNewsletter = newsletter({
  key: 'mail',
  name: 'Kaffeklubben',
  unsubscribe: {
    primary: {
      kind: 'mailto',
      address: 'leave@kaffe.example',
      subject: 'unsubscribe',
      body: '',
      href: 'mailto:leave@kaffe.example?subject=unsubscribe',
    },
    alternatives: [],
    rejectedCount: 0,
  },
});
const noneNewsletter = newsletter({
  key: 'none',
  name: 'No Method',
  unsubscribe: { primary: null, alternatives: [], rejectedCount: 2 },
});

describe('NewsletterCard', () => {
  function renderCard(
    n: Newsletter = newsletter(),
    props: Partial<Parameters<typeof NewsletterCard>[0]> = {},
  ) {
    const onToggleSelected = vi.fn();
    const onUnsubscribe = vi.fn();
    const utils = renderWithProviders(
      <NewsletterCard
        newsletter={n}
        selected={false}
        outcome={undefined}
        now={NOW}
        onToggleSelected={onToggleSelected}
        onUnsubscribe={onUnsubscribe}
        {...props}
      />,
    );
    return { ...utils, onToggleSelected, onUnsubscribe };
  }

  it('shows sender details, counts, estimate label and method', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Example News' })).toBeInTheDocument();
    expect(screen.getByText('news@example.com')).toBeInTheDocument();
    expect(screen.getByText('5 emails')).toBeInTheDocument();
    expect(screen.getByText('yesterday')).toBeInTheDocument();
    expect(screen.getByText('About weekly')).toBeInTheDocument();
    expect(screen.getByText('(estimate)')).toBeInTheDocument();
    expect(screen.getByText('One-click unsubscribe')).toBeInTheDocument();
    expect(screen.getByText('Recently active')).toBeInTheDocument();
  });

  it('marks old senders as inactive', () => {
    renderCard(newsletter({ lastSeenAt: NOW - 90 * DAY }));
    expect(screen.getByText('No email in 30 days')).toBeInTheDocument();
  });

  it('calls back on selection and unsubscribe', async () => {
    const { user, onToggleSelected, onUnsubscribe } = renderCard();
    await user.click(screen.getByRole('checkbox', { name: 'Select Example News' }));
    expect(onToggleSelected).toHaveBeenCalledWith('sender:news@example.com');
    await user.click(screen.getByRole('button', { name: 'Unsubscribe: Example News' }));
    expect(onUnsubscribe).toHaveBeenCalled();
  });

  it('renders HTML in sender names as plain text', () => {
    renderCard(newsletter({ name: '<img src=x onerror=alert(1)>' }));
    expect(
      screen.getByRole('heading', { name: '<img src=x onerror=alert(1)>' }),
    ).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('shows an honest outcome badge', () => {
    renderCard(newsletter(), { outcome: { status: 'request-sent', at: NOW } });
    expect(screen.getByText('Request sent')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View details/ })).toBeInTheDocument();
  });

  it('labels the action by method', () => {
    renderCard(noneNewsletter);
    expect(
      screen.getByRole('button', { name: 'How to unsubscribe: No Method' }),
    ).toBeInTheDocument();
  });
});

describe('UnsubscribeDialog', () => {
  it('explains one-click, and sends only after confirmation', async () => {
    const oneClick = vi.fn().mockResolvedValue({ status: 'request-sent', at: NOW });
    const n = newsletter();
    const { user } = renderWithProviders(<UnsubscribeDialog newsletter={n} onClose={() => {}} />, {
      provider: fakeProvider(),
      oneClick,
    });

    const dialog = screen.getByRole('dialog', { name: 'Unsubscribe from Example News' });
    expect(within(dialog).getByText(/directly to example.com/)).toBeInTheDocument();
    expect(within(dialog).getByText(/cannot be confirmed/)).toBeInTheDocument();
    expect(oneClick).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Send unsubscribe request' }));
    expect(oneClick).toHaveBeenCalledWith(n.unsubscribe.primary);
    expect(await within(dialog).findByText('Request sent')).toBeInTheDocument();
  });

  it('renders a safe external link for web pages', () => {
    renderWithProviders(<UnsubscribeDialog newsletter={webNewsletter} onClose={() => {}} />, {
      provider: fakeProvider(),
    });
    const link = screen.getByRole('link', { name: /Open pixelpine.example/ });
    expect(link).toHaveAttribute('href', 'https://pixelpine.example/u');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('marks web pages as "page opened" after the user clicks, never as unsubscribed', async () => {
    const { user } = renderWithProviders(
      <UnsubscribeDialog newsletter={webNewsletter} onClose={() => {}} />,
      { provider: fakeProvider() },
    );
    const link = screen.getByRole('link', { name: /Open pixelpine.example/ });
    link.addEventListener('click', (event) => event.preventDefault()); // jsdom cannot navigate
    await user.click(link);
    expect(screen.getByText('Page opened, finish there')).toBeInTheDocument();
  });

  it('explains that Mailmap cannot send unsubscribe emails', () => {
    renderWithProviders(<UnsubscribeDialog newsletter={mailtoNewsletter} onClose={() => {}} />, {
      provider: fakeProvider(),
    });
    expect(screen.getByText(/does not have permission to send email/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compose email' })).toHaveAttribute(
      'href',
      'mailto:leave@kaffe.example?subject=unsubscribe',
    );
  });

  it('gives manual guidance when no method exists and mentions rejected links', () => {
    renderWithProviders(<UnsubscribeDialog newsletter={noneNewsletter} onClose={() => {}} />, {
      provider: fakeProvider(),
    });
    expect(screen.getByText('No unsubscribe option found')).toBeInTheDocument();
    expect(screen.getByText(/2 links from this sender were ignored/)).toBeInTheDocument();
  });

  it('simulates in demo mode and never renders real links', async () => {
    const { user } = renderWithProviders(
      <UnsubscribeDialog newsletter={webNewsletter} onClose={() => {}} />,
      {
        provider: new DemoProvider(),
      },
    );
    expect(screen.getByText(/Demo mode: nothing will be sent or opened/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /pixelpine/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Simulate: Open pixelpine.example/ }));
    expect(screen.getByText('Simulated (demo)')).toBeInTheDocument();
  });

  it('closes with the close button', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <UnsubscribeDialog newsletter={newsletter()} onClose={onClose} />,
      { provider: fakeProvider() },
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('BulkUnsubscribeDialog', () => {
  const selection = [
    newsletter({ key: 'a', name: 'Alpha' }),
    newsletter({ key: 'b', name: 'Beta' }),
    webNewsletter,
    noneNewsletter,
  ];

  it('lists items by what will happen and confirms once for the batch', async () => {
    const oneClick = vi.fn().mockResolvedValue({ status: 'request-sent', at: NOW });
    const { user } = renderWithProviders(
      <BulkUnsubscribeDialog open newsletters={selection} onClose={() => {}} />,
      {
        provider: fakeProvider(),
        oneClick,
      },
    );

    const dialog = screen.getByRole('dialog', { name: 'Unsubscribe from 4 newsletters' });
    expect(
      within(dialog).getByText('Sent automatically after you confirm (2)'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Needs your action (1)')).toBeInTheDocument();
    expect(within(dialog).getByText('No unsubscribe option found (1)')).toBeInTheDocument();
    expect(oneClick).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Send 2 requests' }));
    expect(oneClick).toHaveBeenCalledTimes(2);
    expect(await within(dialog).findAllByText('Request sent')).toHaveLength(2);
    expect(within(dialog).getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('says when nothing can be sent automatically', () => {
    renderWithProviders(
      <BulkUnsubscribeDialog open newsletters={[webNewsletter]} onClose={() => {}} />,
      { provider: fakeProvider() },
    );
    expect(
      screen.getByText('None of the selected newsletters support one-click unsubscribe.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send/ })).toBeNull();
  });

  it('labels the confirmation as a simulation in demo mode', () => {
    renderWithProviders(<BulkUnsubscribeDialog open newsletters={selection} onClose={() => {}} />, {
      provider: new DemoProvider(),
    });
    expect(screen.getByRole('button', { name: 'Simulate 2 requests' })).toBeInTheDocument();
  });
});
