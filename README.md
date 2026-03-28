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


### Optional: custom/open player sources

You can override default player providers from `.env.local`:

```bash
NEXT_PUBLIC_EMBED_PROVIDERS="Ashdi UA|https://ashdi.vip/embed/{id}?voice=uk&lang=uk,Mirror|https://ashdi.me/embed/{id}?voice=uk&lang=uk"
```

Format: `Label|URL` and separate providers with commas.
The URL must include `{id}` placeholder (Shikimori anime id).

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


## Vercel fix: "No Output Directory named public"

If Vercel shows this error, your project is configured as a static app.
This repository now includes `vercel.json` with `framework: "nextjs"` and `outputDirectory: ".next"`.

In Vercel Dashboard (can be done from phone):
1. Project → **Settings** → **General**.
2. Set **Framework Preset** to **Next.js**.
3. Clear custom **Output Directory** (or set `.next`).
4. Save and click **Redeploy** from latest commit.
