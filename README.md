# AnimeHub UA

Next.js 14 + TypeScript + Tailwind проєкт для каталогу аніме з Shikimori, пошуком і сторінкою перегляду.

## Швидкий старт

```bash
npm install
npm run dev
```

## Production перевірка

```bash
npm run lint
npm run build
```

## One-click deploy на Vercel

1. Запуш репозиторій у GitHub.
2. У Vercel натисни **Add New Project**.
3. Імпортуй репозиторій.
4. Переконайся, що **Framework Preset = Next.js**.
5. Натисни **Deploy**.

Після кожного push у підключену гілку Vercel робить автоматичний redeploy.

## API

`/api/anime?q=<query>&page=<n>&limit=<n>`

Відповідь:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

## Що робити, якщо є конфлікти у гілці

```bash
git fetch origin
git checkout work
git merge origin/main
# виріши конфлікти у файлах
# README.md
# package.json
# src/app/api/anime/route.ts
# src/app/watch/[id]/page.tsx
# src/components/AnimeCatalog.tsx
# src/components/AnimePlayer.tsx
# src/lib/shikimori.ts
git add README.md package.json src/app/api/anime/route.ts src/app/watch/[id]/page.tsx src/components/AnimeCatalog.tsx src/components/AnimePlayer.tsx src/lib/shikimori.ts
git commit -m "Resolve merge conflicts"
git push origin work
```

## PR шаблон

Використовуй `.github/pull_request_template.md` для коректного опису PR перед мерджем.
