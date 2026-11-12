# Contributing to Mailmap

Thanks for your interest! This is a learning and portfolio project, so small, focused contributions are easiest to review.

## Ground rules

- **Privacy first.** Do not add analytics, trackers, remote fonts, sender logos or any request that leaks mailbox data. Do not request broader OAuth scopes.
- **Honesty in the UI.** Never show "unsubscribed" or "success" unless it can be confirmed.
- **No secrets.** Never commit `.env.local` or any token. Client IDs are fine in your local env only.
- **Translations.** All UI text goes in `src/i18n/messages/en.ts` **and** `nb.ts`. TypeScript will fail the build if one is missing.

## Getting started

```bash
git clone https://github.com/<your-username>/mailmap.git
cd mailmap
npm install
npm run dev
```

The demo at `/demo` needs no configuration.

## Branches

`main` is always releasable. Create a branch per change:

```bash
git switch main
git pull
git switch -c feature/oldest-sort      # new feature
git switch -c fix/mailto-encoding      # bug fix
git switch -c docs/setup-guide         # documentation
```

## Commit messages

Use short, imperative messages, optionally with a type prefix ([Conventional Commits](https://www.conventionalcommits.org/)):

```
feat: add "oldest first" sort order
fix: reject unsubscribe URLs with non-default ports
docs: explain Mail.ReadBasic trade-off
test: cover partial scan results
```

## Before opening a pull request

```bash
npm run check          # lint + typecheck + unit tests + build
npm run test:e2e       # end-to-end tests (needs: npx playwright install chromium)
npm run format         # Prettier
```

Add or update tests for any behaviour change. Pure logic belongs in `src/features/` with a `*.test.ts` file next to it.

## Opening a pull request

1. Push your branch: `git push -u origin feature/oldest-sort`.
2. On GitHub, click **Compare & pull request**.
3. Fill in the template: what changed, why, and how you tested it. Include screenshots for UI changes.
4. CI must pass (lint, typecheck, unit tests, build, e2e).

## Reporting bugs and security issues

- Bugs: open an issue with steps to reproduce, browser and OS.
- Security problems: **do not** open a public issue. See [SECURITY.md](SECURITY.md).
