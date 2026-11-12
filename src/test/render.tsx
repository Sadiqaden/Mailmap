import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { SessionProvider } from '../features/session/SessionProvider';
import type { sendOneClickRequest } from '../features/unsubscribe/oneClick';
import { I18nProvider } from '../i18n/I18nProvider';
import type { Locale } from '../i18n/translate';
import type { MailProvider } from '../integrations/types';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale;
  route?: string;
  /** Wrap in a SessionProvider with this provider connected. */
  provider?: MailProvider;
  /** Wrap in a SessionProvider without a provider. */
  withSession?: boolean;
  oneClick?: typeof sendOneClickRequest;
}

/** Render a component with the same providers the app uses. English by default for readable tests. */
export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const { locale = 'en', route = '/', provider, withSession = false, oneClick, ...rest } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    const content =
      provider || withSession ? (
        <SessionProvider initialProvider={provider} oneClick={oneClick}>
          {children}
        </SessionProvider>
      ) : (
        children
      );
    return (
      <I18nProvider initialLocale={locale}>
        <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
      </I18nProvider>
    );
  }

  return { user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...rest }) };
}

/** A configurable fake provider for component tests. */
export function fakeProvider(overrides: Partial<MailProvider> = {}): MailProvider {
  return {
    id: 'gmail',
    isSimulation: false,
    accountLabel: 'ola@example.com',
    fetchMessageMetadata: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    ...overrides,
  };
}
