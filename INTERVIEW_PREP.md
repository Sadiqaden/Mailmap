# Interview preparation: Mailmap

## First: be honest about how this was built

Mailmap's initial code, tests and documentation were **generated with AI assistance** (Claude, via Claude Code) from a detailed specification you wrote. Interviewers increasingly ask about this, and honesty is a strength here: using AI well is a real skill, but claiming you hand-wrote it is easy to expose with one follow-up question.

Use this table and **keep it up to date**. Only move something to the right-hand columns when it's true.

| Area                                        | AI-generated | I have read and can explain it | I have modified or extended it | I have tested/validated it myself |
| ------------------------------------------- | ------------ | ------------------------------ | ------------------------------ | --------------------------------- |
| Data model (`types/`)                       | ✅           | ☐                              | ☐                              | ☐                                 |
| Header parsing & detection                  | ✅           | ☐                              | ☐                              | ☐                                 |
| URL validation & unsubscribe classification | ✅           | ☐                              | ☐                              | ☐                                 |
| Session reducer / state                     | ✅           | ☐                              | ☐                              | ☐                                 |
| Dashboard UI & components                   | ✅           | ☐                              | ☐                              | ☐                                 |
| i18n system                                 | ✅           | ☐                              | ☐                              | ☐                                 |
| Gmail integration                           | ✅           | ☐                              | ☐                              | ☐ (needs live test)               |
| Outlook integration                         | ✅           | ☐                              | ☐                              | ☐ (needs live test)               |
| Tests                                       | ✅           | ☐                              | ☐                              | ☐                                 |
| Deployment                                  | ✅           | ☐                              | ☐                              | ☐                                 |

What _is_ yours already: the product idea, the requirements (privacy rules, honesty about unsubscribe results, Norwegian default, demo mode for recruiters), and the review. Say that.

A good way to phrase it:

> "I wrote a detailed spec — privacy constraints, the unsubscribe rules, what the demo must prove and not prove — and used an AI coding assistant to produce the first implementation. Since then I've gone through it module by module. For example, I [your real change here]. The part I find most interesting is…"

Don't use any of the answers below until you can say them in your own words and point to the code.

---

## 30-second explanation

> "Mailmap is a web app that finds the newsletters in your Gmail or Outlook inbox and helps you unsubscribe safely. It only reads email headers — things like List-Unsubscribe — never message bodies, and it runs entirely in the browser with no backend, so your mail data never touches a server I control. It's built with React and TypeScript, supports Norwegian and English, and has a demo mode with invented data so anyone can try it without connecting an account."

## Two-minute technical walkthrough

> "It's a Vite + React + TypeScript single-page app. The code is split into three layers.
>
> The **integration layer** has one adapter per provider behind a common `MailProvider` interface. Gmail uses Google Identity Services' token model with the `gmail.metadata` scope, and asks only for six headers per message. Outlook uses MSAL.js — authorization code flow with PKCE — and Microsoft Graph with `$select` so only sender, date and headers come back. Both convert responses into the same `MessageMetadata` type. A demo provider produces synthetic metadata the same way.
>
> The **feature layer** is plain TypeScript with no React. Detection deduplicates messages, groups them by List-Id or sender, and assigns a confidence level from standards-based headers. It estimates frequency from the median gap between messages. Unsubscribe classification validates every URL from the headers — rejecting things like `javascript:` URLs, IP addresses and localhost — and only offers RFC 8058 one-click unsubscribe when the provider recorded a passing DKIM signature.
>
> The **UI layer** is React with a `useReducer`-based session context. Filtered lists and statistics are derived with `useMemo`, so they can't get out of sync. Unsubscribing always goes through a confirmation dialog that explains exactly what happens, and results are honest: a one-click request shows 'request sent', not 'unsubscribed', because the browser can't read the response.
>
> There are about 155 unit and component tests with Vitest and Testing Library, using mocked Gmail and Graph responses, and 36 Playwright end-to-end tests on desktop and mobile. CI runs lint, type-check, tests and build."

## Why React and TypeScript?

- **React**: component model fits a dashboard of repeated cards; huge ecosystem; the job market uses it. Plain React state (`useReducer` + Context) was enough — no Redux needed for one in-memory session.
- **TypeScript**: the data comes from untrusted, messy sources (email headers). Types like `string | null` force handling missing headers. Discriminated unions (`UnsubscribeMethod`) make it impossible to read a URL from a `mailto` method. The translation system uses types so a missing Norwegian string is a compile error.

## How the app integrates with email providers

- Common `MailProvider` interface → UI and detection don't know which provider they talk to.
- Gmail: list ids (`messages.list`), then `messages.get?format=metadata` with concurrency 6; retries with backoff on 429/5xx.
- Graph: one paged query with `$select`; skips Junk and Deleted Items; only follows `nextLink` URLs that point to Graph.
- Every token-bearing request goes through one helper that refuses non-allow-listed origins.

## How authentication works

- **No passwords** ever reach Mailmap: sign-in happens on Google's/Microsoft's pages in a popup.
- **Gmail**: GIS token model, because Google's code exchange for web clients needs a secret that a browser can't keep. Access token only, ~1 hour, held in memory. Disconnect revokes it.
- **Outlook**: MSAL.js, auth code + PKCE, SPA registration with no secret, tokens in memory, silent refresh.
- Tokens are never put in URLs, localStorage or logs.

## How newsletter detection works

- Signals: `List-Unsubscribe` / `List-Id` (high), `Precedence: bulk` (medium), newsletter-like address with ≥3 messages (low).
- Group by List-Id first (lists can have several sender addresses), otherwise by sender.
- Deduplicate by message id. Sanitize display names (remove bidi-override and zero-width characters used for spoofing).
- Frequency = median interval, labelled as an estimate; "not enough data" under 3 messages.
- Wording: "detected", never "subscribed".

## How unsubscribe works

- **One-click (RFC 8058)**: HTTPS + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` + DKIM pass → after confirmation, a `no-cors` POST with no cookies, no referrer and no token. Result: "Request sent".
- **Web page**: the dialog shows a real link the user clicks; opens in a new tab with `noopener noreferrer`. Result: "Page opened, finish there".
- **Mailto**: Mailmap has no send permission, so it opens the user's mail app with a prefilled email. Result: "Manual action required".
- **None**: practical manual steps.
- **Bulk**: grouped into automatic/manual/unavailable; one confirmation for the automatic batch; per-item results.

## Security and privacy trade-offs

- Browser-only: nothing to breach server-side, but tokens are in page memory (XSS would be serious) → React escaping, lint ban on `dangerouslySetInnerHTML`, strict CSP.
- CSP has to allow `connect-src https:` for one-click requests to arbitrary senders. A future fix: send them from a separate sandboxed origin.
- Outlook's `Mail.Read` is broader than needed; disclosed in the UI.
- One-click reveals the user's IP to the sender — disclosed before confirming.
- DKIM is trusted from the provider's `Authentication-Results`, not verified cryptographically.
- No sender logos, because loading them would leak the user's newsletter list to third parties.

## Technical challenges (in the design)

Only describe these as _your_ challenges once you've worked through them yourself. They are real challenges in this design:

1. **Restricted scopes**: `gmail.metadata` can't use search, so the scan reads recent messages and filters locally.
2. **Unknowable results**: cross-origin `no-cors` responses are opaque, which forced the honest "request sent" state.
3. **Untrusted input everywhere**: every header value is attacker-controlled; URL validation has to handle tricks like `https://0x7f.1/` (an IP in hex).
4. **Keeping demo and real data apart**: solved structurally with separate session providers per route.
5. **Popup sign-in vs. pop-up blockers**: the OAuth libraries are prepared _before_ the click so the popup opens synchronously inside the click handler.

## Limitations

- Header-only detection misses some newsletters; scan covers only recent messages.
- Gmail sessions last ~1 hour; no refresh token.
- Public Gmail use needs Google verification + security assessment (restricted scope).
- Live provider flows not yet verified with real accounts (be upfront about this until you've done it).
- No persistence across reloads (by design).

## Future improvements

- Separate sandboxed origin for one-click requests → tighter CSP.
- Verify whether `Mail.ReadBasic` exposes headers; if yes, make it default.
- Incremental scans (Gmail history API / Graph delta queries).
- Gmail batch endpoint to cut request overhead.
- Formal accessibility audit with a screen reader.

## Common questions and suggested answers

**"Why no backend?"**
"Both providers document browser-only OAuth flows, both APIs support CORS, and nothing needs a secret. A backend would be one more place where tokens and mail data could leak. The cost is shorter Gmail sessions."

**"How do you prevent XSS from email data?"**
"All header text is rendered as text through React, which escapes it. ESLint forbids `dangerouslySetInnerHTML`. URLs are validated before they become links. And the CSP restricts where scripts can come from."

**"What happens if an attacker puts `javascript:alert(1)` in List-Unsubscribe?"**
"`checkHttpUrl` only allows `http:`/`https:`; the URI is rejected and counted, and the dialog says some links were ignored as unsafe. There's a test for exactly that, and the demo includes such a sender."

**"How do you know the unsubscribe worked?"**
"We don't, and the UI says so. A `no-cors` request's response is opaque. We show 'request sent' and tell the user to use the sender's page if emails keep coming."

**"How did you test code that needs Gmail?"**
"The provider tests replace `fetch` with a fake that returns Gmail- and Graph-shaped JSON. They check the requests — that we use `format=metadata`, never `q`, never ask for subjects — and that responses map correctly. Live testing is a documented manual checklist."

**"What would you change with more time?"** — See _Future improvements_. Pick one and explain the trade-off.

**"What was the hardest bug?"** — Answer only from your own experience. If you haven't hit one yet, say what you found hardest to _understand_, and how you worked it out.

**"How much of this did you write?"** — Use the honest phrasing at the top of this document and the table.
