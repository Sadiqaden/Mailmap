# Mailmap

> A privacy-conscious newsletter manager for Gmail and Outlook, built with React and TypeScript.

Mailmap finds newsletter senders in your mailbox by reading **mailing-list headers** (not message bodies), shows them as cards you can search, filter and sort, and helps you unsubscribe using **standard, safe mechanisms** — always after you confirm, and always with an honest result.

It runs entirely in the browser: no Mailmap server, no database, no analytics.

**Status:** Outlook sign-in and newsletter scanning were verified locally with a personal Hotmail account and delegated `Mail.ReadBasic`. One-click unsubscribe depends on the sender endpoint and failed in the DHgate test. See [provider setup](docs/PROVIDER_SETUP.md) and [Project status](#project-status).

---

## Contents

1. [Overview](#overview)
2. [Screenshots](#screenshots)
3. [Features](#features)
4. [Technology stack](#technology-stack)
5. [Architecture overview](#architecture-overview)
6. [Prerequisites](#prerequisites)
7. [Installation](#installation)
8. [Environment variables](#environment-variables)
9. [Gmail OAuth configuration](#gmail-oauth-configuration)
10. [Microsoft OAuth configuration](#microsoft-oauth-configuration)
11. [Local development](#local-development)
12. [Running tests](#running-tests)
13. [Production build](#production-build)
14. [Deployment](#deployment)
15. [Security and privacy limitations](#security-and-privacy-limitations)
16. [Known limitations](#known-limitations)
17. [Troubleshooting](#troubleshooting)
18. [Future improvements](#future-improvements)
19. [Project status](#project-status)
20. [Author and attribution](#author-and-attribution)

---

## Overview

Newsletters accumulate quietly. Most email apps show messages one by one, not _who_ keeps sending them. Mailmap:

1. Connects to Gmail or Outlook with **read-only** OAuth access.
2. Reads the headers of your most recent messages (you choose 250–2000).
3. Detects senders using standards-based signals — `List-Unsubscribe` (RFC 2369), `List-Id` (RFC 2919), `Precedence: bulk` — and groups them.
4. Shows a dashboard with statistics, search, filters, sorting and bulk selection.
5. Unsubscribes with RFC 8058 one-click requests where the sender supports them, and gives clear manual steps everywhere else.

A detected sender is **not proof** that you are still subscribed, and a sent request is **not proof** that you were unsubscribed. The UI says so.

## Screenshots

Screenshots are not committed. To generate your own from the demo:

```bash
npm run build
npx vite preview --port 4173
```

Then open `http://localhost:4173/demo` and take screenshots of the landing page (`/`), the demo dashboard (`/demo`), an unsubscribe dialog, and the privacy page (`/privacy`). For consistent images you can use Playwright:

```bash
npx playwright screenshot --viewport-size=1280,800 http://localhost:4173/ docs/screenshots/landing.png
npx playwright screenshot --viewport-size=1280,900 --wait-for-timeout=2000 http://localhost:4173/demo docs/screenshots/demo.png
```

The demo uses invented senders on reserved `.example` domains, so screenshots never contain real data.

## Features

| Feature              | Notes                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Landing page         | Hero, original dashboard illustration, benefits, privacy explanation, FAQ                                     |
| Demo mode            | Clearly labelled, 22 synthetic newsletters + personal mail that must _not_ be detected, simulated unsubscribe |
| Gmail integration    | Google Identity Services token model, `gmail.metadata` scope, metadata-only requests                          |
| Outlook integration  | MSAL.js (Auth Code + PKCE), Microsoft Graph `$select` of headers only                                         |
| Newsletter detection | Header signals, grouping by List-Id or sender, de-duplication, frequency estimate, confidence level           |
| Unsubscribe          | One-click (RFC 8058) with DKIM check, external page, mailto, manual guidance; single and bulk                 |
| URL safety           | Scheme allow-list, no credentials, no IPs/localhost/local-network hosts, no odd ports, length cap             |
| Dashboard            | Statistics, search, 5 filters, 3 sort orders, bulk selection bar, privacy panel                               |
| Localization         | Norwegian Bokmål (default) and English, switchable without reload, type-checked keys                          |
| Accessibility        | Semantic HTML, native `<dialog>`, focus states, skip link, live regions, reduced motion                       |
| Security headers     | CSP and other headers for Netlify/Cloudflare Pages (`public/_headers`)                                        |

## Technology stack

- **React 19** + **TypeScript 5.9** (strict, `noUncheckedIndexedAccess`)
- **Vite 7** build tool, **Tailwind CSS 4**
- **React Router 7** (library mode)
- **@azure/msal-browser 4** for Microsoft sign-in; Google Identity Services loaded at runtime for Gmail
- **Vitest 4** + **React Testing Library** + **jsdom** for unit/component tests
- **Playwright** for end-to-end tests (desktop and mobile)
- **ESLint 9** (flat config) + **Prettier**
- **@fontsource-variable/inter** — the font is bundled, so no Google Fonts request

State management is React's own `useReducer` + Context. No extra state library is needed for one in-memory session.

> Why not the very latest major versions? When this project was created, newer majors existed (e.g. Vite 8, React Router 8, TypeScript 7, MSAL 5). The project deliberately uses the newest releases of the previous majors, whose APIs are well documented and stable. Dependabot will propose upgrades.

## Architecture overview

```
Browser tab
├── React UI (pages, components)            ← renders, never talks to APIs directly
├── features/                               ← pure business logic (no React)
│   ├── discovery/  header parsing, detection, scan orchestration
│   ├── unsubscribe/ method classification, one-click request
│   ├── dashboard/  search, filter, sort, statistics
│   └── session/    reducer + provider for the in-memory session
├── integrations/                           ← provider adapters behind one interface
│   ├── gmail/      GIS token model + Gmail REST API
│   └── outlook/    MSAL.js + Microsoft Graph
└── demo/                                   ← synthetic mailbox, same interface
```

Every provider implements `MailProvider` and returns provider-neutral `MessageMetadata`. Detection runs the same code for Gmail, Outlook and the demo. See [ARCHITECTURE.md](ARCHITECTURE.md) for diagrams and the reasoning behind each decision.

**Why no backend?** Both Google and Microsoft document browser-only OAuth flows for public clients, Gmail and Graph both allow CORS requests from browsers, and nothing Mailmap does needs a secret. A backend would add a place where tokens and mailbox data could leak. The trade-offs (no refresh token for Gmail, CSP must allow one-click requests to arbitrary HTTPS hosts) are documented in ARCHITECTURE.md.

## Prerequisites

- **Node.js 20.19+** (22 LTS recommended; developed on Node 26) and npm
- For real accounts: a Google Cloud project and/or a Microsoft Entra app registration (free)
- For E2E tests: Playwright's Chromium (`npx playwright install chromium`)

## Installation

```bash
git clone https://github.com/<your-username>/mailmap.git
cd mailmap
npm install
```

## Environment variables

Copy the example file and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable                    | Required    | Description                                                 |
| --------------------------- | ----------- | ----------------------------------------------------------- |
| `VITE_GOOGLE_CLIENT_ID`     | for Gmail   | OAuth client ID (type "Web application")                    |
| `VITE_MICROSOFT_CLIENT_ID`  | for Outlook | Application (client) ID of an SPA app registration          |
| `VITE_MICROSOFT_AUTHORITY`  | no          | Default `https://login.microsoftonline.com/common`          |
| `VITE_MICROSOFT_MAIL_SCOPE` | no          | `Mail.Read` (default) or `Mail.ReadBasic` — see setup guide |

`VITE_*` values are **compiled into the public JavaScript**. Client IDs are public identifiers, so this is fine. **Never put a client secret in a `VITE_` variable.** Mailmap does not use any secret. `.env.local` is git-ignored.

Without client IDs, the app still works: the connect pages explain that the provider isn't configured and offer the demo.

## Gmail OAuth configuration

Short version (full guide with screenshots-to-look-for in [docs/PROVIDER_SETUP.md](docs/PROVIDER_SETUP.md)):

1. In Google Cloud Console, create a project and **enable the Gmail API**.
2. Configure the **OAuth consent screen** (Google Auth Platform): user type _External_, publishing status _Testing_, and add yourself as a **test user**.
3. Under **Data access**, add the scope `https://www.googleapis.com/auth/gmail.metadata`.
4. Create an **OAuth client ID** of type **Web application**. Under **Authorized JavaScript origins** add `http://localhost:5173` (and later your production origin). No redirect URI is needed for the token model popup.
5. Put the client ID in `VITE_GOOGLE_CLIENT_ID`.

`gmail.metadata` is a **restricted** scope. In _Testing_ mode only listed test users (max 100) can connect, and Google shows an "unverified app" warning. Public use requires Google's app verification **and** a third-party security assessment for restricted scopes. That cannot be completed from this repository.

## Microsoft OAuth configuration

1. In the Microsoft Entra admin center, **App registrations → New registration**.
2. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**.
3. Add platform **Single-page application** with redirect URI `http://localhost:5173/auth/popup-redirect.html` (add your production URL later).
4. **API permissions**: Microsoft Graph → Delegated → `Mail.Read` (`openid`, `profile`, `offline_access` are added automatically at sign-in). Do **not** create a client secret.
5. Put the Application (client) ID in `VITE_MICROSOFT_CLIENT_ID`.

Work/school tenants may require admin consent or a verified publisher. See [docs/PROVIDER_SETUP.md](docs/PROVIDER_SETUP.md#microsoft-mailreadbasic-vs-mailread) for why the default is `Mail.Read` rather than `Mail.ReadBasic`.

## Local development

```bash
npm run dev          # http://localhost:5173
```

- Demo: <http://localhost:5173/demo> (no configuration needed)
- Gmail: <http://localhost:5173/connect/gmail>
- Outlook: <http://localhost:5173/connect/outlook>

Other scripts:

```bash
npm run lint         # ESLint (fails on warnings)
npm run typecheck    # TypeScript project build check
npm run format       # Prettier write
npm run check        # lint + typecheck + unit tests + production build
```

## Running tests

```bash
npm test                         # 155 unit + component tests (Vitest)
npm run test:watch               # watch mode while developing
npx playwright install chromium  # once
npm run test:e2e                 # 36 end-to-end tests, desktop + mobile
```

The automated tests use the demo data and mocked Gmail/Graph responses. **They never need real credentials.** Manual testing with real accounts is described in [docs/MANUAL_TESTING.md](docs/MANUAL_TESTING.md).

## Production build

```bash
npm run build        # type-checks, then builds to dist/
npm run preview      # serve dist/ locally on http://localhost:4173
```

## Deployment

Recommended: **Netlify** (static hosting, HTTPS, custom headers, SPA redirects, environment variables in the UI). The repository includes `netlify.toml`, `public/_headers` (CSP and security headers) and `public/_redirects` (SPA fallback). Cloudflare Pages understands the same `_headers`/`_redirects` files.

Step-by-step instructions, including OAuth origins and post-deploy verification: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Gmail and Outlook sign-in will **not** work on a public URL until that URL is registered with Google and Microsoft and the provider restrictions above are dealt with.

## Security and privacy limitations

Read [SECURITY.md](SECURITY.md) for the full review. In short:

- **Outlook permission is broader than needed.** `Mail.Read` technically allows reading message bodies. Mailmap only requests headers via `$select`, but the permission itself does not enforce that.
- **One-click requests reveal your IP address** to the newsletter sender's server, and the CSP must allow `connect-src https:` to send them.
- **Unsubscribe results cannot be confirmed.** Browser `no-cors` requests hide the response.
- **DKIM is not verified cryptographically.** Mailmap trusts the receiving provider's `Authentication-Results` header.
- **Tokens live in JavaScript memory.** An XSS bug would expose them; mitigations are React's escaping, a lint ban on `dangerouslySetInnerHTML`, and a strict CSP.
- **Google's script is loaded from accounts.google.com** when you choose Gmail, so Google is trusted code in the page.

## Known limitations

- Detection only covers the scanned messages, and only senders that use standard headers (or obvious sender patterns).
- Gmail's `gmail.metadata` scope cannot use Gmail search, so Mailmap scans the most recent messages instead of searching for newsletters.
- Gmail access tokens last about an hour and the token model issues no refresh token — long sessions require reconnecting.
- Results are lost on refresh (by design).
- Sender logos are not shown (privacy choice, see ARCHITECTURE.md); avatars use initials.
- Outlook's popup flow requires that pop-ups are allowed.
- Outlook sign-in and scanning were tested locally with Hotmail. The one-click unsubscribe test with DHgate did not complete.

## Troubleshooting

| Symptom                                                      | Likely cause / fix                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| "Gmail is not configured for this deployment"                | `VITE_GOOGLE_CLIENT_ID` missing. Restart `npm run dev` after editing `.env.local`. |
| Google: `Error 400: origin_mismatch`                         | Add the exact origin (scheme + host + port) to Authorized JavaScript origins.      |
| Google: "Access blocked: app has not completed verification" | Your account isn't a test user, or the app isn't in Testing mode.                  |
| "The Gmail permission was not granted"                       | You unticked the permission checkbox in Google's consent screen.                   |
| Microsoft: `AADSTS50011` redirect URI mismatch               | Register `<origin>/auth/popup-redirect.html` under the **SPA** platform (not Web). |
| Microsoft: `AADSTS9002326` cross-origin token redemption     | The redirect URI is registered as **Web** instead of **Single-page application**.  |
| Microsoft: needs admin approval                              | Your organisation restricts user consent. Ask an admin or use a personal account.  |
| "headers-unavailable" error on Outlook                       | You switched to `Mail.ReadBasic` and Graph returned no headers. Use `Mail.Read`.   |
| Sign-in window doesn't open                                  | Allow pop-ups for the site.                                                        |
| Session expired after an hour                                | Normal for Gmail's token model. Click Reconnect.                                   |
| Unit tests print `ExperimentalWarning: localStorage...`      | Harmless on Node 25+. The test setup provides its own storage.                     |

## Future improvements

- Optional small backend (or edge function) to use Gmail's authorization-code flow with refresh tokens, if longer sessions are needed — at the cost of handling tokens server-side.
- Test `Mail.ReadBasic` with more Outlook accounts before changing the default.
- Gmail batch requests to reduce HTTP overhead.
- Incremental re-scans using Gmail history IDs / Graph delta queries.
- Optional "mark as handled" state and export of the newsletter list (CSV).
- Stricter CSP by sending one-click requests from a dedicated, sandboxed origin.

## Project status

| Status                                                                | Items                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Implemented and tested**                                            | Landing page, demo mode, detection, header parsing, URL validation, unsubscribe classification, one-click request logic (mocked), search/filter/sort, statistics, bulk selection, dialogs, localization, responsive layout, accessibility basics, Gmail and Graph request/response mapping (mocked) |
| **Implemented, needs external configuration and manual verification** | Gmail sign-in (GIS) and scanning, additional Outlook account types, real one-click requests to real senders, deployment headers on Netlify                                                                                                                                                 |
| **Partially implemented**                                             | Accessibility: target WCAG 2.2 AA, but no formal audit or screen-reader test session has been done                                                                                                                                                                                                  |
| **Not implemented**                                                   | Sending unsubscribe emails automatically (would require send permission — deliberately excluded), sender logos, persistence across reloads                                                                                                                                                          |

## Author and attribution

**Sadiq Aden** — project owner, product requirements and review.

The initial implementation, tests and documentation were generated with AI assistance (Claude by Anthropic, via Claude Code) from a detailed specification written by Sadiq. Sadiq is studying the code, verifying it and extending it; see [INTERVIEW_PREP.md](INTERVIEW_PREP.md) for an honest account of what was AI-generated versus personally understood and modified.

Licensed under the [MIT License](LICENSE).
