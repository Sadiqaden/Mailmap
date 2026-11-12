# Provider setup: Gmail and Outlook

Mailmap needs one OAuth registration per provider. Both are free. You never need a client secret.

> Provider consoles change their menus often. If a name below doesn't match, search the console for the setting. The underlying concepts (client ID, origin, redirect URI, scope) stay the same. Always confirm limits and policies in the official docs linked at the end.

---

## Gmail (Google Cloud)

### 1. Project and API

1. Open <https://console.cloud.google.com/> and create a project, e.g. `mailmap-dev`.
2. **APIs & Services → Library** → search **Gmail API** → **Enable**.

### 2. OAuth consent screen (Google Auth Platform)

1. **Google Auth Platform → Branding**: app name `Mailmap`, your support email, developer contact email. Optionally add a privacy policy URL (`https://<your-site>/privacy`) and home page.
2. **Audience**: user type **External**. Leave publishing status as **Testing**.
3. **Audience → Test users**: add the Google accounts you will test with (max 100).
4. **Data access → Add or remove scopes**: add `https://www.googleapis.com/auth/gmail.metadata`. Google marks it as **restricted**.

### 3. OAuth client

1. **Clients → Create client** (or _Credentials → Create credentials → OAuth client ID_).
2. Application type: **Web application**.
3. **Authorized JavaScript origins**:
   - `http://localhost:5173` (development)
   - `http://localhost:4173` (if you test `npm run preview`)
   - `https://<your-production-domain>` (later)
4. **Authorized redirect URIs**: none needed. The GIS token model returns the token to the page via a Google popup.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`) into `.env.local`:

```bash
VITE_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
```

Restart `npm run dev`.

### What to expect

- Google shows **"Google hasn't verified this app"**. As a test user, choose _Continue_.
- The consent screen may show the Gmail permission as a **checkbox**. If it's unticked, Mailmap shows "The Gmail permission was not granted".
- The access token lasts about one hour. After that, Mailmap asks you to reconnect.

### Going public (not done in this project)

`gmail.metadata` is a **restricted scope**. To let anyone (beyond 100 test users) connect without warnings, Google requires:

- **OAuth app verification** (verified domain, privacy policy, demo video, justification of the scope), and
- an annual **third-party security assessment** (CASA) for restricted scopes.

This takes time and may cost money. Until it's done, keep the app in Testing mode and describe Gmail support as "available to test users".

---

## Outlook (Microsoft Entra)

### 1. Register the app

1. Open <https://entra.microsoft.com/> → **Applications → App registrations → New registration**.
   (A personal Microsoft account can register apps; if prompted, a free Azure/Entra tenant may be created.)
2. Name: `Mailmap`.
3. **Supported account types**: _Accounts in any organizational directory and personal Microsoft accounts_. This matches the default authority `https://login.microsoftonline.com/common`.
4. **Redirect URI**: platform **Single-page application (SPA)**, URI `http://localhost:5173/auth/popup-redirect.html`.
5. Register, then copy the **Application (client) ID**.

### 2. Add more redirect URIs

**Authentication → Single-page application → Add URI**:

- `http://localhost:4173/auth/popup-redirect.html` (preview build)
- `https://<your-production-domain>/auth/popup-redirect.html` (later)

It must be the **SPA** platform. Registering it under **Web** causes `AADSTS9002326` because the browser would need a secret.

### 3. API permissions

**API permissions → Add a permission → Microsoft Graph → Delegated permissions**:

- `Mail.Read`
- (`User.Read` is often added by default; Mailmap doesn't use it and you can remove it. `openid`, `profile` and `offline_access` are requested automatically at sign-in.)

Do **not** create a client secret or certificate.

### 4. Configure Mailmap

```bash
VITE_MICROSOFT_CLIENT_ID=00000000-0000-0000-0000-000000000000
# optional
VITE_MICROSOFT_AUTHORITY=https://login.microsoftonline.com/common
VITE_MICROSOFT_MAIL_SCOPE=Mail.Read
```

### Account types and consent

- **Personal accounts** (outlook.com, hotmail.com): the user can consent to `Mail.Read` themselves.
- **Work/school accounts**: depends on the tenant. Many tenants only allow users to consent to apps from **verified publishers**, or require **admin consent**. Publisher verification needs a Microsoft Partner Network account. Use a personal account for testing.

### Microsoft: `Mail.ReadBasic` vs `Mail.Read`

`Mail.ReadBasic` is documented as excluding the body, body preview, attachments and extended properties — that would be ideal. However, Microsoft's documentation does not say whether `internetMessageHeaders` is returned with it, as a general guarantee. A local Hotmail test with a personal-only app registration, the `/consumers` authority, and delegated `Mail.ReadBasic` found newsletter headers in a 500-message scan. The code still defaults to `Mail.Read`, and discloses that this permission would allow reading bodies (Mailmap never requests them).

To try `Mail.ReadBasic`:

1. Add `Mail.ReadBasic` in API permissions.
2. Set `VITE_MICROSOFT_MAIL_SCOPE=Mail.ReadBasic` and restart.
3. Scan. If Graph returns messages without headers, Mailmap stops with a **"headers-unavailable"** error rather than silently finding nothing.

If it works, please open an issue — it would let Mailmap request less.

---

## Rate limits and quotas (verify current values)

| Provider        | What applies to Mailmap                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gmail           | Per-user quota of roughly 250 quota units/second; `messages.list` and `messages.get` cost 5 units each. Mailmap runs 6 requests in parallel and backs off on 429 / `rateLimitExceeded`. |
| Microsoft Graph | Outlook mailbox limits (about 10,000 requests per 10 minutes and 4 concurrent requests per app per mailbox). Mailmap pages sequentially and honours `Retry-After`.                      |

## Official documentation

- Gmail API scopes: <https://developers.google.com/workspace/gmail/api/auth/scopes>
- Gmail `users.messages.list` (`q` not allowed with `gmail.metadata`): <https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list>
- Google Identity Services token model: <https://developers.google.com/identity/oauth2/web/guides/use-token-model>
- Google restricted scope verification: <https://support.google.com/cloud/answer/13464325>
- Gmail usage limits: <https://developers.google.com/workspace/gmail/api/reference/quota>
- MSAL.js for SPAs: <https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-overview>
- Graph message resource (`internetMessageHeaders` requires `$select`): <https://learn.microsoft.com/en-us/graph/api/resources/message>
- Graph permissions reference: <https://learn.microsoft.com/en-us/graph/permissions-reference>
- Graph throttling: <https://learn.microsoft.com/en-us/graph/throttling-limits>
