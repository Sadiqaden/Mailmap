/**
 * Runtime configuration from `VITE_*` environment variables.
 *
 * These values are compiled into the public JavaScript bundle. OAuth client IDs are
 * public identifiers, so that is fine — but a client *secret* must never be added here.
 */

export type MicrosoftMailScope = 'Mail.Read' | 'Mail.ReadBasic';

export interface AppConfig {
  googleClientId: string | null;
  microsoftClientId: string | null;
  microsoftAuthority: string;
  microsoftMailScope: MicrosoftMailScope;
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readConfig(env: Record<string, string | undefined> = import.meta.env): AppConfig {
  const scope = clean(env.VITE_MICROSOFT_MAIL_SCOPE);
  return {
    googleClientId: clean(env.VITE_GOOGLE_CLIENT_ID),
    microsoftClientId: clean(env.VITE_MICROSOFT_CLIENT_ID),
    microsoftAuthority:
      clean(env.VITE_MICROSOFT_AUTHORITY) ?? 'https://login.microsoftonline.com/common',
    microsoftMailScope: scope === 'Mail.ReadBasic' ? 'Mail.ReadBasic' : 'Mail.Read',
  };
}

export const appConfig: AppConfig = readConfig();

/** Popup redirect target for Microsoft sign-in. Derived from the current origin, never hardcoded. */
export function popupRedirectUri(origin: string = window.location.origin): string {
  return `${origin}/auth/popup-redirect.html`;
}
