# AnimeHub UA

Next.js 14 + TypeScript + Tailwind anime streaming catalog with Shikimori API and embedded watch player.

## Quick start

```bash
npm install
npm run dev
```

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
