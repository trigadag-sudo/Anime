# AnimeHub UA

Next.js 14 + TypeScript + Tailwind anime streaming catalog with Shikimori API and embedded watch player.

## Quick start

```bash
npm install
npm run dev
npm run lint
```

## Push this branch to your GitHub repository

```bash
git remote add origin https://github.com/trigadag-sudo/Anime.git # one-time
git push -u origin work
```

If `origin` already exists, update it:

```bash
git remote set-url origin https://github.com/trigadag-sudo/Anime.git
git push -u origin work
```

## Auto checks after every push

This repository now includes GitHub Actions workflow `.github/workflows/ci.yml`.
It automatically runs `npm ci`, `npm run lint`, and `npm run build` for every push to `work`/`main` and for pull requests.

### Auto content updates on the site

- The homepage now auto-loads more ongoing anime pages from Shikimori while the user scrolls.
- No manual content input is needed; data is fetched dynamically from `/api/anime` with pagination.
- New deployments are automatic after each push when Vercel Git Integration is enabled.


## Deploy to Vercel

### Option A (recommended): Git integration
1. Push this repo to GitHub.
2. Open Vercel Dashboard → **Add New Project**.
3. Import the repository.
4. Click **Deploy**.
5. In Vercel Project → **Settings → Domains**, open the generated domain and use it directly.

### If you see `404 Not Found nginx`

- This means the request is not reaching your Next.js app (domain/DNS points to another server).
- Open Vercel Project → **Settings → Domains** and re-assign the correct domain.
- After domain fix, run **Redeploy**.

### Option B: CLI deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Token-based CI deploy

```bash
VERCEL_TOKEN=*** vercel --prod --token "$VERCEL_TOKEN"
```

> Security: never publish long-lived Vercel tokens in chat/messages. Revoke leaked tokens immediately.


## Vercel fix: "No Output Directory named public"

If Vercel shows this error, your project is configured as a static app.
This repository now includes `vercel.json` with `framework: "nextjs"` and `outputDirectory: ".next"`.

In Vercel Dashboard (can be done from phone):
1. Project → **Settings** → **General**.
2. Set **Framework Preset** to **Next.js**.
3. Clear custom **Output Directory** (or set `.next`).
4. Save and click **Redeploy** from latest commit.
