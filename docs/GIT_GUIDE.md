# Git and GitHub guide for Mailmap

A practical guide for publishing and working on this project. Commands are for macOS/Linux terminals.

## 0. One-time setup

```bash
git config --global user.name "Sadiq Aden"
git config --global user.email "you@example.com"   # the email on your GitHub account
git config --global init.defaultBranch main
```

Install the GitHub CLI (optional, makes publishing easier): <https://cli.github.com/>, then `gh auth login`.

## 1. Before the first commit: check for secrets

```bash
cd mailmap
cat .gitignore | grep env        # .env and .env.* must be listed (they are)
ls -a | grep env                 # you should only see .env.example (+ your own .env.local)
```

`.env.local` holds your client IDs. It is ignored, so it won't be committed. Never remove those lines from `.gitignore`.

## 2. The basic commands

| Command                        | What it does                                                 |
| ------------------------------ | ------------------------------------------------------------ |
| `git init`                     | Turn the current folder into a Git repository (once).        |
| `git status`                   | Show changed, staged and untracked files. Run it constantly. |
| `git add <file>` / `git add .` | Stage changes for the next commit.                           |
| `git commit -m "message"`      | Save a snapshot of the staged changes.                       |
| `git log --oneline`            | List commits, newest first.                                  |
| `git branch`                   | List branches; `*` marks the current one.                    |
| `git switch -c <name>`         | Create a new branch and switch to it.                        |
| `git switch <name>`            | Switch to an existing branch.                                |
| `git push`                     | Upload commits to GitHub.                                    |
| `git pull`                     | Download and merge commits from GitHub.                      |
| `git merge <branch>`           | Merge another branch into the current one.                   |

## 3. Create the repository and first commits

```bash
cd mailmap
git init
git status                       # check: no .env.local, no node_modules, no dist
git add .
git status                       # review the staged list once more
git commit -m "Initial Mailmap implementation (AI-assisted)"
```

A cleaner history for a portfolio splits the initial work into meaningful commits. For example:

```bash
git add package.json package-lock.json tsconfig*.json vite.config.ts eslint.config.js .prettierrc.json .prettierignore .gitignore .env.example index.html .nvmrc .vscode
git commit -m "chore: set up Vite, React, TypeScript, Tailwind, ESLint and Prettier"

git add src/types src/utils src/features src/demo src/integrations
git commit -m "feat: add newsletter detection, unsubscribe logic and provider integrations"

git add src/i18n src/hooks src/components src/pages src/app src/main.tsx src/styles public
git commit -m "feat: add UI, localization, landing page and dashboard"

git add src/test playwright.config.ts tests
git commit -m "test: add unit, component and end-to-end tests"

git add .github netlify.toml
git commit -m "ci: add GitHub Actions, Dependabot and Netlify config"

git add *.md docs LICENSE
git commit -m "docs: add README, architecture, learning guide and project docs"

git status                       # should say "nothing to commit"
```

## 4. Publish to GitHub

**With the GitHub CLI:**

```bash
gh repo create mailmap --public --source=. --remote=origin \
  --description "Mailmap is a privacy-conscious newsletter manager for Gmail and Outlook, built with React and TypeScript." \
  --push
```

**Without the CLI:**

1. On github.com, click **New repository**, name it `mailmap`, add the description above, and **don't** tick "Add a README" (you already have one).
2. Then:

```bash
git remote add origin https://github.com/<your-username>/mailmap.git
git push -u origin main
```

After publishing:

- Check the **Actions** tab — CI should go green.
- **Settings → Code security**: enable _Private vulnerability reporting_, _Dependabot alerts_ and _Secret scanning_ (push protection).
- Add topics: `react`, `typescript`, `vite`, `gmail-api`, `microsoft-graph`, `oauth`, `privacy`.

## 5. Day-to-day workflow with branches

```bash
git switch main
git pull                          # start from the latest main
git switch -c feature/oldest-sort # one branch per change

# ...edit files...
npm run check
git add -A
git commit -m "feat: add oldest-first sort order"
git push -u origin feature/oldest-sort
```

## 6. Pull requests

1. After pushing a branch, GitHub shows **Compare & pull request**. Click it.
2. Fill in the template (what, why, how tested).
3. Wait for CI. Read the diff yourself — reviewing your own PR is good practice.
4. **Merge pull request** → **Delete branch**.
5. Locally:

```bash
git switch main
git pull
git branch -d feature/oldest-sort
```

With the CLI: `gh pr create --fill`, then `gh pr merge --squash --delete-branch`.

## 7. Merging and resolving conflicts

A conflict happens when two branches changed the same lines.

```bash
git switch feature/my-change
git merge main
# CONFLICT (content): Merge conflict in src/i18n/messages/en.ts
```

Open the file. Git marks both versions:

```
<<<<<<< HEAD
    title: 'Your newsletters',
=======
    title: 'My newsletters',
>>>>>>> main
```

1. Edit the block to the correct final text and delete the three marker lines.
2. Repeat for every conflicted file (`git status` lists them).
3. Check that everything still works: `npm run check`.
4. Finish the merge:

```bash
git add src/i18n/messages/en.ts
git commit                         # Git pre-fills a merge message
```

To give up and return to before the merge: `git merge --abort`.

## 8. If you accidentally commit a secret

1. **Revoke it first** — create a new secret/client in the provider console. Deleting the commit is not enough; assume it's been copied.
2. Remove it from the code and commit.
3. If it was pushed, history rewriting (e.g. `git filter-repo`) is needed to purge it — but revoking is what actually protects you.

(Mailmap's client IDs are not secrets, but treat any token or password this way.)
