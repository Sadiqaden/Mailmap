/**
 * Minimal type declarations for the parts of Google Identity Services (GIS)
 * that Mailmap uses. GIS is loaded at runtime from https://accounts.google.com/gsi/client.
 * Reference: https://developers.google.com/identity/oauth2/web/reference/js-reference
 */

declare namespace google.accounts.oauth2 {
  interface TokenResponse {
    access_token?: string;
    expires_in?: number | string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  }

  interface ClientConfigError {
    type: 'popup_failed_to_open' | 'popup_closed' | 'unknown';
    message?: string;
  }

  interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: ClientConfigError) => void;
    prompt?: '' | 'none' | 'consent' | 'select_account';
    include_granted_scopes?: boolean;
  }

  interface OverridableTokenClientConfig {
    prompt?: '' | 'none' | 'consent' | 'select_account';
    login_hint?: string;
  }

  interface TokenClient {
    requestAccessToken(overrideConfig?: OverridableTokenClientConfig): void;
  }

  function initTokenClient(config: TokenClientConfig): TokenClient;
  function hasGrantedAllScopes(response: TokenResponse, ...scopes: string[]): boolean;
  function revoke(accessToken: string, done?: () => void): void;
}

interface Window {
  google?: { accounts?: { oauth2?: typeof google.accounts.oauth2 } };
}
