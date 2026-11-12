# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private reporting instead: on the repository page, go to **Security → Report a vulnerability**. (The repository owner must enable _Private vulnerability reporting_ under Settings → Code security.) Include steps to reproduce and the impact you expect. You should get a response within 7 days.

This is a personal portfolio project maintained by one student. There is no bug bounty.

## Supported versions

Only the latest commit on `main` is supported.

## Security review

This is a realistic review of the current implementation, not a claim that Mailmap is "secure". It covers the areas the project is most exposed to.

### OAuth and token handling

| Item                                                                                                 | Status                                         |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| No client secrets anywhere (`VITE_*` holds only public client IDs)                                   | ✅                                             |
| Least-privilege scopes: Gmail `gmail.metadata`; Outlook `Mail.Read` (see residual risk)              | ✅ / ⚠️                                        |
| No send, delete or modify scopes                                                                     | ✅                                             |
| Tokens never in URLs, `localStorage` or logs                                                         | ✅                                             |
| Gmail token in memory; revoked on disconnect                                                         | ✅                                             |
| MSAL cache in memory; MSAL logging silenced with `piiLoggingEnabled: false`                          | ✅                                             |
| Tokens only sent to `gmail.googleapis.com` / `graph.microsoft.com` (enforced in `authorizedGetJson`) | ✅                                             |
| Graph `@odata.nextLink` only followed when it points to Graph                                        | ✅                                             |
| Granular Google consent: missing scope is detected; partial token revoked                            | ✅                                             |
| Cancelled / denied consent handled without crashing                                                  | ✅ (unit-tested mapping; live flow unverified) |

### Untrusted email data

Every header is attacker-controlled: anyone can send the user an email.

- Display names: control, bidirectional-override and zero-width characters are removed, length is capped (`utils/text.ts`).
- Rendering: React escapes all text. `dangerouslySetInnerHTML` is banned by an ESLint rule.
- `List-Id`: must be a valid dot-atom; otherwise ignored.
- Unsubscribe URIs (`utils/url.ts`):
  - only `https:`, `http:` (flagged insecure, never one-click) and `mailto:`;
  - no embedded credentials;
  - no IP literals (including hex/decimal forms), `localhost`, single-label or local-network names (`.local`, `.lan`, `.internal`, `.home.arpa`…) — prevents using the browser to reach the user's router or intranet;
  - no non-default ports; max 2048 characters; at most 5 URIs per header;
  - `mailto`: single valid recipient; `cc`/`bcc` dropped; subject/body sanitized and capped.
- URLs are re-validated immediately before a one-click request is sent.

### Unsubscribe requests

- Nothing is opened or requested during scanning.
- Every action requires explicit confirmation in a dialog that explains what will happen.
- One-click requests: `POST`, `mode: no-cors`, `credentials: omit`, `referrerPolicy: no-referrer`, no `Authorization` header, 15 s timeout.
- One-click is offered only with HTTPS, the exact RFC 8058 header, and `dkim=pass` in the first `Authentication-Results` header.
- External pages are opened by a real link with `rel="noopener noreferrer"`.
- No proxy exists that could be abused to fetch arbitrary URLs.

### Browser security controls

`public/_headers` (Netlify / Cloudflare Pages):

- `Content-Security-Policy`: `default-src 'self'`; scripts from self + `https://accounts.google.com/gsi/client`; frames only from Google GIS and Microsoft login; `object-src 'none'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, restrictive `Permissions-Policy`.
- `Cross-Origin-Opener-Policy` is intentionally **not** set: `same-origin` would break the MSAL popup's connection to the opener.

### Storage

- `localStorage`: only the language preference (`mailmap.locale`).
- `sessionStorage`: MSAL's temporary interaction state during sign-in.
- Everything else: memory only. Refresh = signed out.

### Dependencies and supply chain

- Runtime dependencies are deliberately few: React, React DOM, React Router, MSAL Browser, a self-hosted font.
- No analytics, ads, tracking pixels or CDN scripts other than Google's GIS (only loaded when the user chooses Gmail).
- Dependabot opens weekly update PRs; CI runs `npm audit --omit=dev` at high severity.
- At the time of writing, `npm audit` reports moderate advisories in **dev-only** lint tooling (a `minimatch` ReDoS inside `typescript-eslint`). They do not ship to users. Re-check with `npm audit`.

## Residual risks (known and accepted for now)

1. **`Mail.Read` is broader than needed.** It permits reading message bodies; Mailmap doesn't request them, but a compromised build could. `Mail.ReadBasic` may suffice and should be verified.
2. **CSP allows `connect-src https:`.** Needed to POST one-click requests to arbitrary senders. If an XSS bug existed, data could be sent to any HTTPS host. Mitigation idea: perform one-click requests from a separate, sandboxed origin.
3. **Tokens in JS memory.** Any XSS would expose them. No known XSS sink exists, but this is the main consequence of a browser-only design.
4. **Third-party script.** Google's GIS script runs with full page privileges when Gmail is chosen. It cannot be pinned with Subresource Integrity because Google updates it in place.
5. **DKIM heuristic.** `dkim=pass` is read from the provider's header, not verified. The domain that signed is not compared to the unsubscribe host.
6. **IP disclosure.** One-click requests reveal the user's IP address and a request time to the sender. Disclosed in the dialog.
7. **DNS-based internal targets.** Hostname checks can't detect a public domain that resolves to a private IP (DNS rebinding). Browsers' Private Network Access protections partly cover this; Mailmap cannot.
8. **Unverified live flows.** Gmail and Outlook sign-in have not yet been tested end-to-end with real accounts.
9. **No formal audit.** No penetration test or third-party review has been performed.
