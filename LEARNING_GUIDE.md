# Learning guide: React and TypeScript through Mailmap

This guide is for you, Sadiq. You already know JavaScript, HTML, CSS, Java, Python, SQL and Git basics. The goal is to understand **every part of Mailmap well enough to explain it, change it and defend it in an interview**.

Each section explains a concept, then points to where Mailmap uses it. Read with the code open next to you.

---

## Part 1 — The tools

### What React is

React is a library for building user interfaces out of **components**. You describe _what the UI should look like for the current data_, and React figures out _how to update the page_ when the data changes.

Compare with plain JavaScript, where you would write `document.querySelector(...).textContent = ...` every time something changes. In React you write:

```tsx
function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}
```

When `name` changes, React re-runs `Greeting` and updates only the text that changed. That idea — **UI is a function of state** — is the core of React.

The HTML-like syntax is **JSX**. It compiles to function calls (`React.createElement(...)`). Differences from HTML you will see: `className` instead of `class`, `htmlFor` instead of `for`, `{expression}` for JavaScript values, and every tag must be closed.

### What TypeScript adds to JavaScript

TypeScript is JavaScript plus **static types**, checked before the code runs. Coming from Java, this will feel familiar, but TypeScript's types are _structural_ (shape-based), not _nominal_ (name-based):

```ts
interface Sender {
  name: string;
  email: string;
}
const s: Sender = { name: 'Nordlys', email: 'weekly@nordlys.example' }; // OK: same shape
```

Things Mailmap uses a lot:

| Feature              | Example in Mailmap                                    | Java equivalent (roughly)        |
| -------------------- | ----------------------------------------------------- | -------------------------------- |
| `interface` / `type` | `MessageMetadata` in `src/types/mail.ts`              | class with fields                |
| Union types          | `type ProviderId = 'gmail' \| 'outlook' \| 'demo'`    | enum                             |
| Discriminated unions | `UnsubscribeMethod` in `src/types/newsletter.ts`      | sealed interface + records       |
| `null` in types      | `listId: string \| null`                              | `@Nullable` / `Optional`         |
| Generics             | `authorizedGetJson<T>(...)` in `integrations/http.ts` | `<T> T get(...)`                 |
| `as const`           | `SCAN_LIMITS = [250, 500, 1000, 2000] as const`       | `static final` array of literals |
| Type-only imports    | `import type { Newsletter } ...`                      | —                                |

**Discriminated unions** are the most important pattern in this codebase. Look at `UnsubscribeMethod`:

```ts
type UnsubscribeMethod =
  | { kind: 'one-click'; url: string; host: string }
  | { kind: 'web'; url: string; host: string; insecure: boolean }
  | { kind: 'mailto'; address: string; subject: string; body: string; href: string };
```

When you write `if (method.kind === 'mailto')`, TypeScript _narrows_ the type, so `method.address` is allowed inside the `if` but `method.url` is not. The compiler prevents a whole class of bugs.

`tsconfig.app.json` turns on `strict` and `noUncheckedIndexedAccess`. The second one means `array[0]` has type `T | undefined` — that's why you'll see `group[0]` followed by a check, or `!` where the code has already proven the value exists.

### How Vite works

Vite is the **dev server and build tool**.

- `npm run dev`: Vite serves your source files directly to the browser as native ES modules, transforming `.tsx` on the fly. Saving a file updates the page instantly (Hot Module Replacement).
- `npm run build`: `tsc -b` type-checks first, then Vite bundles, minifies and fingerprints everything into `dist/` (e.g. `index-CCnTnlD4.js`).
- `import.meta.env.VITE_*` reads environment variables **at build time** and inlines them into the bundle. That's why secrets must never go into `VITE_` variables — see `src/integrations/config.ts`.

`vite.config.ts` registers two plugins (React, Tailwind) and also holds the Vitest configuration.

### Tailwind CSS

Instead of writing CSS files, you compose small utility classes: `className="rounded-2xl border border-slate-200 bg-white p-5"`. The design tokens (brand colours, shadows, font) are defined once in `src/styles/index.css` under `@theme`. `bg-brand-600` refers to `--color-brand-600` there.

---

## Part 2 — React concepts

### Components

A component is a function that returns JSX. Mailmap's components are grouped by purpose:

- `components/ui/` — generic building blocks (`Button`, `Badge`, `Dialog`)
- `components/newsletter/` — things that know about newsletters (`NewsletterCard`)
- `pages/` — one component per URL

Rule of thumb used in this project: **components display things and handle clicks; logic lives in `features/`**. `NewsletterCard` doesn't compute "recently active" itself — it calls `isRecentlyActive` from `features/discovery/frequency.ts`.

### Props

Props are a component's inputs — like constructor parameters. Read `NewsletterCard.tsx`:

```tsx
interface NewsletterCardProps {
  newsletter: Newsletter;
  selected: boolean;
  onToggleSelected: (key: string) => void;
  ...
}
```

Notice that `onToggleSelected` is a **function passed down as a prop**. The card doesn't change the selection itself; it tells its parent "the user clicked". The parent owns the data. This is called _lifting state up_.

### State

State is data that changes over time and should cause a re-render. In `SiteHeader.tsx`:

```tsx
const [menuOpen, setMenuOpen] = useState(false);
```

- `menuOpen` is the current value.
- `setMenuOpen(true)` schedules a re-render with the new value.
- Never mutate state directly (`menuOpen = true` does nothing useful).

For more complex state, Mailmap uses **`useReducer`** in `SessionProvider.tsx`. A reducer is a pure function `(state, action) => newState` — see `src/features/session/sessionReducer.ts`. If you've seen the _state machine_ idea in your courses, this is the same thing: each `action.type` is a transition.

Important: the reducer always returns **new objects** (`{ ...state, selected }`, `new Set(state.selected)`). React compares by reference; mutating the old object would mean React doesn't notice the change.

### Hooks

Hooks are functions starting with `use` that let components use React features. Rules: call them at the top level of a component (not inside `if`/loops), and only from components or other hooks.

| Hook           | What it does                                                    | Where to look                                                            |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `useState`     | local state                                                     | `SiteHeader.tsx`, `DashboardPage.tsx`                                    |
| `useReducer`   | state with explicit transitions                                 | `SessionProvider.tsx`                                                    |
| `useEffect`    | run side effects after render (timers, subscriptions, DOM APIs) | `Dialog.tsx` (calls `showModal()`), `ConnectPage.tsx` (prepares sign-in) |
| `useMemo`      | cache a computed value until inputs change                      | `DashboardPage.tsx` (`applyQuery`, `computeStats`)                       |
| `useCallback`  | cache a function so children don't re-render needlessly         | `SessionProvider.tsx`                                                    |
| `useRef`       | a mutable box that survives re-renders without causing them     | `scanController` in `SessionProvider.tsx`                                |
| `useId`        | unique ids for `aria-labelledby` etc.                           | `Dialog.tsx`, `NewsletterToolbar.tsx`                                    |
| `use(Context)` | read a context value                                            | `hooks/useSession.ts`, `hooks/useI18n.ts`                                |

**Custom hooks** like `useSession()` wrap a context and add an error if it's used in the wrong place. They are just functions that call other hooks.

`useEffect` cleanup is worth studying in `Dialog.tsx`: the function returned from the effect runs when the dialog closes, so focus goes back to the button that opened it.

### Context

Passing props through many levels is tedious. **Context** lets a provider make a value available to everything below it. Mailmap has two:

- `I18nProvider` → language, `t()` translation function, date formatters
- `SessionProvider` → the connected provider, scan state, selection, commands

The demo page renders its **own** `SessionProvider`, so demo data physically lives in a different object from real data. That's a design choice you can explain in an interview.

### Routing

`src/app/App.tsx` maps URLs to pages with React Router:

```tsx
<Route path="connect/:provider" element={<ConnectPage />} />
```

`:provider` is a URL parameter; `ConnectPage` reads it with `useParams()`. Navigation uses `<Link to="/demo">` (no full page reload) or `useNavigate()` in code. `<Outlet />` in `RealSessionLayout` is where child routes render.

Because this is a single-page app, the host must serve `index.html` for every path — that's what `public/_redirects` does on Netlify.

---

## Part 3 — Talking to APIs

### API calls and async/await

`fetch` returns a Promise. `async`/`await` lets you write asynchronous code that reads like synchronous code — similar to Python's `asyncio`:

```ts
const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
if (!response.ok) throw new ProviderError('server');
const data = await response.json();
```

Study `src/integrations/http.ts`. It shows real-world concerns you won't see in tutorials:

- **Retries with exponential backoff** for 429 (rate limited) and 5xx responses.
- **`Retry-After`** header support.
- **Cancellation** with `AbortSignal` — when the user clicks "Stop scan", every in-flight request is cancelled.
- **An origin allow-list**, so a bug can never send the token to the wrong server.

`src/utils/async.ts` has `mapWithConcurrency`: run N async tasks at a time. Gmail requires one request per message; doing 500 at once would hit rate limits, doing them one by one would be slow.

### Error handling

Errors are converted into a small set of codes (`ProviderError` in `integrations/types.ts`). The UI never shows raw error messages; it translates the code. Benefits: no sensitive data in the UI, consistent wording, easy translation.

Also note: **cancellation is not an error**. `runScan` in `features/discovery/scan.ts` catches the `AbortError` and returns partial results.

### OAuth 2.0

OAuth lets a user give an app _limited_ access to their account **without giving it their password**. The pieces:

- **Client ID** — identifies the app (public).
- **Scope** — what the app is allowed to do (e.g. `gmail.metadata`).
- **Consent screen** — the provider asks the user to approve.
- **Access token** — a short-lived string the app sends with API requests (`Authorization: Bearer ...`).
- **Refresh token** — a longer-lived string used to get new access tokens.

The user signs in on **Google's or Microsoft's page**, never on Mailmap's. Mailmap never sees a password.

### PKCE

PKCE ("pixy", _Proof Key for Code Exchange_) protects the _authorization code_ flow in apps that can't keep a secret, like browser apps:

1. The app makes a random `code_verifier` and sends its hash (`code_challenge`) when starting sign-in.
2. The provider returns an authorization `code`.
3. The app exchanges the `code` **plus the original `code_verifier`** for tokens.

An attacker who steals the `code` can't use it without the verifier, which never left the app. MSAL.js does all of this for Outlook.

For Gmail, Mailmap uses Google's **token model** instead, because Google's code exchange for web clients requires a client secret. Read the comment at the top of `GmailAuth` in `integrations/gmail/gmailAuth.ts`.

### Gmail API

- `users.messages.list` returns message **ids** only.
- `users.messages.get?format=metadata&metadataHeaders=...` returns chosen headers.
- The `gmail.metadata` scope can't read bodies — and can't use Gmail search (`q`), so Mailmap reads recent messages and filters locally.

### Microsoft Graph

- `GET /me/messages?$select=...` — `$select` chooses exactly which fields come back. Mailmap selects sender, date, folder and `internetMessageHeaders`.
- Paging uses `@odata.nextLink` URLs. Mailmap checks the link points to Graph before following it.

### Type definitions for external code

`src/types/google-identity.d.ts` describes the Google script's API to TypeScript, because that script isn't an npm package. A `.d.ts` file contains only types — no runtime code. MSAL ships its own types in the npm package.

---

## Part 4 — Testing

| Kind       | Tool                                   | What it checks                            | Example                                     |
| ---------- | -------------------------------------- | ----------------------------------------- | ------------------------------------------- |
| Unit       | Vitest                                 | one function, no browser                  | `features/discovery/detect.test.ts`         |
| Component  | Vitest + React Testing Library + jsdom | a component's behaviour as a user sees it | `components/newsletter/newsletter.test.tsx` |
| End-to-end | Playwright                             | the built app in a real browser           | `tests/e2e/demo.spec.ts`                    |

React Testing Library encourages finding elements **the way a user would**: by role and accessible name (`getByRole('button', { name: 'Start scan' })`). If a test can't find a button by its name, a screen-reader user probably can't either — so tests double as accessibility checks.

Mocking: `providers.test.ts` replaces the global `fetch` with a fake that returns Gmail/Graph-shaped JSON. That tests request building and response parsing without real accounts.

Run one file while learning:

```bash
npx vitest src/features/discovery/detect.test.ts
```

---

## Part 5 — How the files connect

Follow one click from start to finish: **"Start scan" in demo mode**.

1. `pages/DemoPage.tsx` creates a `DemoProvider` and wraps `DashboardPage` in a `SessionProvider`.
2. `components/dashboard/ScanPanel.tsx` → `ScanReadyPanel` calls `onStart(limit)`. (In the demo, `AutoStartDemoScan` does it for you.)
3. `pages/DashboardPage.tsx` → `scan(limit)` → `session.startScan(limit)`.
4. `features/session/SessionProvider.tsx` → dispatches `scan-started`, calls `runScan(provider, …)`.
5. `features/discovery/scan.ts` → `provider.fetchMessageMetadata(...)` collects batches.
6. `demo/demoProvider.ts` → serves `generateDemoMessages()` from `demo/demoData.ts` in 8 batches, calling `onProgress`.
7. Back in `scan.ts` → `detectNewsletters()` in `features/discovery/detect.ts` → uses `headers.ts`, `frequency.ts`, and `features/unsubscribe/classify.ts`.
8. `SessionProvider` dispatches `scan-finished`; `sessionReducer` stores the newsletters.
9. `DashboardPage` re-renders: `computeStats` → `StatsGrid`; `applyQuery` → list of `NewsletterCard`s.

For Gmail, step 6 is `integrations/gmail/gmailProvider.ts` instead. Nothing else changes. That is the benefit of the `MailProvider` interface.

## Recommended reading order

1. `src/types/mail.ts` and `src/types/newsletter.ts` — the data model.
2. `src/features/discovery/headers.ts` → `detect.ts` (with `detect.test.ts`).
3. `src/utils/url.ts` and `src/features/unsubscribe/classify.ts` (with tests).
4. `src/features/session/sessionReducer.ts` → `SessionProvider.tsx` → `hooks/useSession.ts`.
5. `src/pages/DashboardPage.tsx` → `components/newsletter/NewsletterCard.tsx`.
6. `src/components/newsletter/UnsubscribeDialog.tsx` and `features/unsubscribe/oneClick.ts`.
7. `src/i18n/translate.ts` → `I18nProvider.tsx` → `messages/en.ts`.
8. `src/integrations/types.ts` → `http.ts` → `gmail/*` → `outlook/*`.
9. `src/pages/ConnectPage.tsx` — ties sign-in to the session.
10. `src/app/App.tsx` and `src/main.tsx` — how it all starts.
11. Tests: `providers.test.ts`, `DashboardPage.test.tsx`, `tests/e2e/demo.spec.ts`.

---

## Practical exercises

Do these yourself, in order. Each one touches a different layer. Run `npm run check` after each; write or update a test every time.

1. **Change a text (i18n).** Change the Norwegian landing headline in `src/i18n/messages/nb.ts`. Then add a _new_ key only to `en.ts` and run `npm run typecheck` — read the error and fix it in `nb.ts`. You've just seen why typed translations matter.
2. **Add a sort order (logic + UI).** Add `'oldest'` (least recently received) to `SORTS` in `features/dashboard/query.ts`, implement it in `compareNewsletters`, add translations, and add a unit test in `dashboard.test.ts`.
3. **Add a filter (logic + UI).** Add a "Possible newsletters" filter that shows only `confidence === 'low'`. Write a test that uses the `newsletter()` fixture.
4. **Add a demo sender.** Add a new invented sender in `demo/demoData.ts` with `unsubscribe: 'mailto'`. Which tests break, and why? (Hint: `EXPECTED_DEMO_NEWSLETTERS` and the e2e count/statistics.)
5. **Harden URL validation.** `checkHttpUrl` currently accepts any public domain. Add a rule rejecting hosts longer than 253 characters, with a test in `url.test.ts`.
6. **New statistic.** Add "One-click available" to `computeStats` and `StatsGrid`. Update the stats tests.
7. **Component state.** Add a "Mark as handled" button to `NewsletterCard` that dims the card. Decide: does this state belong in the card (`useState`) or in the session reducer? Why?
8. **Read a real API response.** After setting up Gmail (docs/PROVIDER_SETUP.md), add a temporary `console.warn(batch.length)` in `gmailProvider.ts`, watch the network tab in DevTools, then remove it (ESLint forbids `console.log` for a reason — which one?).
9. **Accessibility check.** Navigate the whole demo with only the keyboard (Tab, Shift+Tab, Enter, Space, Escape). Write down anything awkward and fix one thing.
10. **Write an e2e test.** In `tests/e2e/demo.spec.ts`, test that the "Manual action required" filter never shows a card with "One-click unsubscribe".

Keep a short log of what you changed and what you learned — it becomes your honest interview material (see INTERVIEW_PREP.md).
