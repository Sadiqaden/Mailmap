import { ProviderError } from '../types';

/**
 * Least-privileged Gmail scope that exposes headers.
 * "Read resources metadata including labels, history records, and email message headers,
 * but not the message body or attachments." Google classifies it as a *restricted* scope.
 */
export const GMAIL_METADATA_SCOPE = 'https://www.googleapis.com/auth/gmail.metadata';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export interface GmailToken {
  accessToken: string;
  /** Epoch ms when the token stops working. */
  expiresAt: number;
}

let scriptPromise: Promise<void> | null = null;

/** Load Google Identity Services once. Only called when the user chooses Gmail. */
export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new ProviderError('script-load-failed', 'Google Identity Services failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Wraps the GIS *token model*.
 *
 * Why not Authorization Code + PKCE? For Google "Web application" clients the token
 * endpoint requires a client secret, which cannot be kept secret in a browser. Google's
 * documented approach for browser-only apps is the GIS token model: a Google-hosted popup
 * returns a short-lived access token directly to this page. No refresh token is issued,
 * so the user re-consents after the token expires (about an hour).
 */
export class GmailAuth {
  private client: google.accounts.oauth2.TokenClient | null = null;
  private pending: {
    resolve: (token: GmailToken) => void;
    reject: (error: ProviderError) => void;
  } | null = null;

  constructor(private readonly clientId: string) {}

  /** Must finish *before* the user clicks "Continue", so the popup opens from the click. */
  async prepare(): Promise<void> {
    await loadGoogleIdentityScript();
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) throw new ProviderError('script-load-failed', 'GIS not available');

    this.client = oauth2.initTokenClient({
      client_id: this.clientId,
      scope: GMAIL_METADATA_SCOPE,
      include_granted_scopes: false,
      callback: (response) => this.handleResponse(response),
      error_callback: (error) => {
        const code = error.type === 'popup_failed_to_open' ? 'popup-blocked' : 'cancelled';
        this.settle(new ProviderError(code, `GIS error: ${error.type}`));
      },
    });
  }

  get isReady(): boolean {
    return this.client !== null;
  }

  /** Opens Google's consent popup. Call synchronously from a click handler. */
  requestAccess(): Promise<GmailToken> {
    if (!this.client) {
      return Promise.reject(new ProviderError('script-load-failed', 'GmailAuth not prepared'));
    }
    // Reject any earlier, still-pending attempt.
    this.settle(new ProviderError('cancelled', 'Superseded'));
    const promise = new Promise<GmailToken>((resolve, reject) => {
      this.pending = { resolve, reject };
    });
    this.client.requestAccessToken({ prompt: '' });
    return promise;
  }

  private handleResponse(response: google.accounts.oauth2.TokenResponse): void {
    if (response.error) {
      const code = response.error === 'access_denied' ? 'consent-denied' : 'unknown';
      this.settle(new ProviderError(code, `OAuth error: ${response.error}`));
      return;
    }
    const oauth2 = window.google?.accounts?.oauth2;
    // With granular consent the user can untick the Gmail permission while still "allowing".
    if (!response.access_token || !oauth2?.hasGrantedAllScopes(response, GMAIL_METADATA_SCOPE)) {
      if (response.access_token) oauth2?.revoke(response.access_token);
      this.settle(new ProviderError('scope-missing', 'Gmail metadata scope not granted'));
      return;
    }
    const seconds = Number(response.expires_in ?? 3600);
    const lifetime = Number.isFinite(seconds) ? seconds : 3600;
    this.settle({
      accessToken: response.access_token,
      // Treat the token as expired a minute early to avoid failing mid-request.
      expiresAt: Date.now() + Math.max(0, lifetime - 60) * 1000,
    });
  }

  private settle(result: GmailToken | ProviderError): void {
    const pending = this.pending;
    this.pending = null;
    if (!pending) return;
    if (result instanceof ProviderError) pending.reject(result);
    else pending.resolve(result);
  }
}

/** Revoke the grant at Google. Afterwards Mailmap has no access until the user consents again. */
export function revokeGmailToken(accessToken: string): Promise<void> {
  return new Promise((resolve) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      resolve();
      return;
    }
    oauth2.revoke(accessToken, () => resolve());
  });
}
