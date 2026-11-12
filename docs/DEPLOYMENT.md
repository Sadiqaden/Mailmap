# Deployment

Mailmap is a static site: `npm run build` produces `dist/`, which any static host can serve over HTTPS.

## Choosing a host

| Host             | Custom security headers | SPA fallback              | Env vars in UI        | Verdict                                                              |
| ---------------- | ----------------------- | ------------------------- | --------------------- | -------------------------------------------------------------------- |
| **Netlify**      | `_headers` file         | `_redirects` file         | ✅                    | **Recommended** — simple, free tier, both files already in `public/` |
| Cloudflare Pages | `_headers` file         | automatic (no `404.html`) | ✅                    | Good alternative; same files work                                    |
| Vercel           | `vercel.json`           | `vercel.json` rewrites    | ✅                    | Works, but needs a separate config file                              |
| GitHub Pages     | ❌ (no custom headers)  | 404.html hack             | ❌ (build in Actions) | Not recommended: can't set CSP headers                               |

Netlify was chosen because the security headers (especially the CSP) matter for an app that handles OAuth tokens, and Netlify applies `public/_headers` with no extra configuration.

## Netlify step by step

1. Push the repository to GitHub (see [GIT_GUIDE.md](GIT_GUIDE.md)).
2. In Netlify: **Add new site → Import an existing project → GitHub** → choose `mailmap`.
3. Build settings are read from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 22
4. **Site configuration → Environment variables**: add `VITE_GOOGLE_CLIENT_ID` and/or `VITE_MICROSOFT_CLIENT_ID` (and optional ones from `.env.example`). Leave them out to deploy a demo-only site.
5. Deploy. Note your URL, e.g. `https://mailmap-sadiq.netlify.app`.

Environment variables are baked in at **build time**: after changing them, trigger a new deploy.

## Register the production URL with the providers

HTTPS is required for production origins (Netlify provides it).

**Google** (OAuth client → Authorized JavaScript origins):

```
https://mailmap-sadiq.netlify.app
```

**Microsoft** (App registration → Authentication → Single-page application):

```
https://mailmap-sadiq.netlify.app/auth/popup-redirect.html
```

Use the exact origin — no trailing slash for Google, exact path for Microsoft. Mailmap computes the redirect URI from `window.location.origin`, so no URL is hardcoded in the code.

If you add a custom domain, register that origin too.

## Security headers

`public/_headers` sets the CSP and other headers. Directives and why they exist:

| Directive                                                                                                                                               | Why                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `script-src 'self' https://accounts.google.com/gsi/client`                                                                                              | App bundle + Google Identity Services                                                                    |
| `style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style`                                                                                | Bundled CSS; GIS injects styles for its UI                                                               |
| `connect-src 'self' https://gmail.googleapis.com https://graph.microsoft.com https://login.microsoftonline.com https://accounts.google.com/gsi/ https:` | APIs, MSAL token endpoint, and `https:` for one-click unsubscribe to arbitrary senders (see SECURITY.md) |
| `frame-src https://accounts.google.com/gsi/ https://login.microsoftonline.com`                                                                          | GIS iframe; MSAL silent token renewal iframe                                                             |
| `img-src 'self' data:`                                                                                                                                  | No remote images (no sender logos by design)                                                             |
| `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`                                                                  | Standard hardening                                                                                       |

`Cross-Origin-Opener-Policy` is not set because `same-origin` would break the MSAL sign-in popup.

## Deployment verification checklist

After each production deploy:

- [ ] `https://<site>/` loads in Norwegian; switching to English works.
- [ ] `https://<site>/demo` scans and shows 22 demo newsletters.
- [ ] Refreshing `https://<site>/privacy` works (SPA fallback).
- [ ] `https://<site>/does-not-exist` shows Mailmap's 404 page.
- [ ] Response headers include `Content-Security-Policy` (DevTools → Network → document → Headers, or `curl -I https://<site>/`).
- [ ] DevTools console shows no CSP violations on `/`, `/demo` and `/connect/gmail`.
- [ ] `/connect/gmail` and `/connect/outlook` either show the permission explanation (configured) or the "not configured" message (not configured).
- [ ] With credentials configured: run the manual tests in [MANUAL_TESTING.md](MANUAL_TESTING.md) against the production URL.

Do not describe Gmail or Outlook as working publicly until those manual tests pass on the production URL — and remember Gmail stays limited to test users until Google verification is complete.

## Cloudflare Pages (alternative)

Build command `npm run build`, output directory `dist`, environment variable `NODE_VERSION=22`. Cloudflare reads `public/_headers`. For SPA routing Cloudflare serves `index.html` automatically when no `404.html` exists; the `_redirects` line is Netlify-specific and Cloudflare may warn about it — you can delete it there.
