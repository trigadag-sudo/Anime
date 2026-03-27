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

## Deploy to Vercel

### Option A (recommended): Git integration
1. Push this repo to GitHub.
2. Open Vercel Dashboard → **Add New Project**.
3. Import the repository.
4. Click **Deploy**.

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
