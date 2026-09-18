# WillowSite

Astro (static) + Convex, deployed to GitHub Pages.

## Setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create a Convex project and start the backend (this writes `CONVEX_URL` to `.env.local`):

   ```sh
   pnpm convex:dev
   ```

   Convex is already a project dependency, so use the local CLI (`pnpm exec convex` / `pnpm convex:dev`). Do not use `pnpm dlx convex` — pnpm 12 ignores esbuild’s install script in the dlx cache (`ERR_PNPM_IGNORED_BUILDS`), and `pnpm approve-builds` only applies to this repo, not that cache. If you still want dlx: `pnpm --allow-build=esbuild dlx convex dev`.

3. Copy `.env.example` to `.env` and set `PUBLIC_CONVEX_URL` to the same deployment URL as `CONVEX_URL`.

4. In another terminal, start the Astro dev server:

   ```sh
   pnpm dev
   ```

5. Before deploying, set `site` in `astro.config.mjs` to `https://<your-github-username>.github.io`. Keep `base` as `/WillowSite/` (the repository name), or change it if the repo name differs.

6. In the GitHub repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## GitHub secrets

| Secret | Purpose |
| --- | --- |
| `CONVEX_DEPLOY_KEY` | Production deploy key from the Convex dashboard (Deployment Settings → Generate Production Deploy Key). Used by `pnpm exec convex deploy` in CI. |

The workflow deploys Convex functions, injects the resulting URL as `PUBLIC_CONVEX_URL`, runs `pnpm build`, and publishes `dist/` to GitHub Pages.
