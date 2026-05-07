# tri-brick
Like the classic brick breaker games, but with more triangles

## Running locally

Because this project uses ES modules, open it with a dev server (not via `file://`).

```bash
npm install
npm run dev
```

Then open the local Vite URL (usually `http://localhost:5173/`).

## Deploying to GitHub Pages

This repository is configured to deploy on every push to `main` (and manually via `workflow_dispatch`) using GitHub Actions.

1. In GitHub, go to **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` to trigger `.github/workflows/deploy-pages.yml`.

Expected production URL format:

- `https://<owner>.github.io/tri-brick/`

The Vite `base` path is set to `/tri-brick/` for GitHub Pages project-site hosting. If the repository is renamed, update `base` in `vite.config.js` to match the new repository name.
