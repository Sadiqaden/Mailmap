import {
  AuthError,
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  LogLevel,
  PublicClientApplication,
  type AccountInfo,
  type IPublicClientApplication,
} from '@azure/msal-browser';
import { popupRedirectUri, type MicrosoftMailScope } from '../config';
import { ProviderError } from '../types';

export interface OutlookAuthConfig {
  clientId: string;
  authority: string;
  mailScope: MicrosoftMailScope;
}

/**
 * Microsoft sign-in with MSAL.js (Authorization Code Flow + PKCE, as a public SPA client).
 *
 * - No client secret: the app registration uses the "Single-page application" platform.
 * - Tokens are kept in memory only (`memoryStorage`), so a refresh or closed tab signs out.
 * - MSAL's logger is configured with PII logging disabled and nothing written to the console.
 */
export class OutlookAuth {
  private app: IPublicClientApplication | null = null;
  private account: AccountInfo | null = null;
  readonly scopes: string[];

  constructor(private readonly config: OutlookAuthConfig) {
    this.scopes = [config.mailScope];
  }

  async prepare(): Promise<void> {
    if (this.app) return;
    this.app = await PublicClientApplication.createPublicClientApplication({
      auth: {
        clientId: this.config.clientId,
        authority: this.config.authority,
        redirectUri: popupRedirectUri(),
        postLogoutRedirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: BrowserCacheLocation.MemoryStorage,
        temporaryCacheLocation: BrowserCacheLocation.SessionStorage,
      },
      system: {
        loggerOptions: {
          logLevel: LogLevel.Error,
          piiLoggingEnabled: false,
          loggerCallback: () => {
            // Intentionally silent: MSAL messages may include account identifiers.
          },
        },
      },
    });
  }

  get isReady(): boolean {
    return this.app !== null;
  }

  /** Opens the Microsoft sign-in popup. Call directly from a click handler. */
  async signIn(): Promise<AccountInfo> {
    if (!this.app) throw new ProviderError('script-load-failed', 'OutlookAuth not prepared');
    try {
      const result = await this.app.loginPopup({ scopes: this.scopes, prompt: 'select_account' });
      this.account = result.account;
      return result.account;
    } catch (error) {
      throw mapMsalError(error);
    }
  }

  /** Get a valid access token, refreshing silently when possible. */
  getAccessToken = async (): Promise<string> => {
    if (!this.app || !this.account) throw new ProviderError('unauthorized', 'Not signed in');
    try {
      const result = await this.app.acquireTokenSilent({
        scopes: this.scopes,
        account: this.account,
      });
      return result.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        throw new ProviderError('unauthorized', 'Interaction required');
      }
      throw mapMsalError(error);
    }
  };

  /** Forget all tokens held by MSAL in this tab. Consent at Microsoft is not revoked. */
  async signOutLocally(): Promise<void> {
    const app = this.app;
    const account = this.account;
    this.account = null;
    if (app) await app.clearCache(account ? { account } : undefined);
  }
}

/** Translate MSAL errors to Mailmap error codes without leaking details. */
export function mapMsalError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  if (error instanceof AuthError) {
    const code = error.errorCode;
    if (code === 'user_cancelled') return new ProviderError('cancelled', code);
    if (code === 'popup_window_error' || code === 'empty_window_error') {
      return new ProviderError('popup-blocked', code);
    }
    if (
      code === 'access_denied' ||
      code === 'consent_required' ||
      /AADSTS65004/.test(error.message)
    ) {
      return new ProviderError('consent-denied', code);
    }
    return new ProviderError('unknown', code);
  }
  return new ProviderError('unknown', 'Unexpected sign-in error');
}
