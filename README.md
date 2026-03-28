# AnimeHub UA

Next.js 14 + TypeScript + Tailwind anime catalog with Shikimori API, search, watch page, and mobile-friendly UI.

## One-click deploy (recommended)

1. Push this repository to GitHub.
2. Import repo in Vercel (**Add New Project**).
3. Keep **Framework Preset = Next.js**.
4. Click **Deploy**.

After each push to your connected branch, Vercel automatically creates a new deployment.

## Local run

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run lint
npm run build
```

## API behavior

- `/api/anime?q=<query>&page=<n>&limit=<n>` returns normalized data from Shikimori.
- Default mode shows top ongoing anime.
- Search mode filters by query.
- Response contains `items`, `page`, `limit`, and `hasMore`.

## Troubleshooting

### `404 Not Found nginx`

This usually means your domain points to another server, not Vercel.

- Open Vercel → Project → **Settings → Domains**.
- Re-attach correct domain.
- Redeploy latest commit.

### Merge conflicts (`README.md`, `package.json`, etc.)

```bash
git fetch origin
git checkout work
git merge origin/main
# resolve conflicts in editor
git add README.md package.json src/app/api/anime/route.ts src/components/AnimeCatalog.tsx src/components/AnimePlayer.tsx src/lib/shikimori.ts
git commit -m "Resolve merge conflicts"
git push origin work
```
