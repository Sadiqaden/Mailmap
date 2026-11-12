# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] – 2026-11-11

Initial version, generated with AI assistance from Sadiq Aden's specification.

### Added

- Landing page with hero, original dashboard illustration, benefits, privacy section, FAQ and footer.
- Demo mode at `/demo` with 22 invented newsletter senders and ordinary mail that must not be detected; simulated unsubscribe, clearly labelled.
- Gmail integration: Google Identity Services token model, `gmail.metadata` scope, metadata-only message requests with concurrency limit, retries and cancellation.
- Outlook integration: MSAL.js popup sign-in (Auth Code + PKCE), in-memory token cache, Microsoft Graph `$select` of headers, Junk/Deleted Items skipped, safe pagination.
- Connect pages explaining requested permissions before sign-in; graceful handling of cancelled sign-in, blocked pop-ups, denied consent and missing scopes.
- Newsletter detection from `List-Unsubscribe`, `List-Id`, `Precedence` and sender patterns; de-duplication; grouping by list or sender; frequency estimate; confidence levels.
- Unsubscribe method classification with URL and mailto validation; RFC 8058 one-click requests only with DKIM pass; web-page and mailto manual flows; single and bulk dialogs with per-item results.
- Dashboard: statistics, search, filters, sort orders, bulk selection bar, scan limit, progress, stop scan with partial results, empty/loading/error states, privacy panel.
- Privacy page describing actual data handling and how to revoke access.
- Norwegian Bokmål (default) and English with type-checked translation keys and runtime parity tests.
- Accessibility: semantic landmarks, skip link, native `<dialog>`, visible focus, labelled controls, live regions, reduced-motion support.
- Original logo and favicon.
- Security headers (CSP etc.) and SPA redirects for Netlify / Cloudflare Pages; `netlify.toml`.
- 155 Vitest unit/component tests and 36 Playwright end-to-end tests (desktop + mobile).
- GitHub Actions CI, Dependabot, PR template.
- Documentation: README, ARCHITECTURE, LEARNING_GUIDE, INTERVIEW_PREP, CONTRIBUTING, SECURITY, provider setup, deployment, manual testing and Git guides.
