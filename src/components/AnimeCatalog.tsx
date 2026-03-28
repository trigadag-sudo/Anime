'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { AnimeCardData } from '@/lib/shikimori';

interface AnimeCatalogProps {
  initialItems: AnimeCardData[];
}

interface ApiResponse {
  items: AnimeCardData[];
  hasMore: boolean;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#27272a" offset="20%" />
      <stop stop-color="#3f3f46" offset="50%" />
      <stop stop-color="#27272a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#27272a" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (value: string) => {
  if (typeof window === 'undefined') return '';
  return window.btoa(value);
};

export default function AnimeCatalog({ initialItems }: AnimeCatalogProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AnimeCardData[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 20);

  useEffect(() => {
    if (!query.trim()) {
      setItems(initialItems);
      setPage(1);
      setHasMore(initialItems.length >= 20);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const response = await fetch(`/api/anime?q=${encodeURIComponent(query.trim())}&page=1&limit=20`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('Search failed');

        const payload = (await response.json()) as ApiResponse;
        setItems(payload.items);
        setHasMore(payload.hasMore);
        setPage(1);
      } catch {
        setItems([]);
        setHasMore(false);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [initialItems, query]);

  const header = useMemo(() => (query.trim() ? `Результати пошуку: ${query}` : 'Популярні онґоїнґ аніме'), [query]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({ page: String(nextPage), limit: '20' });
      if (query.trim()) params.set('q', query.trim());

      const response = await fetch(`/api/anime?${params.toString()}`);
      if (!response.ok) throw new Error('Load more failed');

      const payload = (await response.json()) as ApiResponse;
      setItems((prev) => {
        const knownIds = new Set(prev.map((item) => item.id));
        const unique = payload.items.filter((item) => !knownIds.has(item.id));
        return [...prev, ...unique];
      });
      setPage(nextPage);
      setHasMore(payload.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section id="search" className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Пошук аніме..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none ring-orange-500/50 transition focus:ring"
        />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">{header}</h1>
        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">{items.length} тайтлів</span>
      </div>

      {loadingSearch ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-2xl bg-zinc-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((anime, index) => (
              <motion.article
                key={anime.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70"
              >
                <Link href={`/watch/${anime.id}`} className="block">
                  <div className="relative aspect-[2/3] w-full">
                    <Image
                      src={anime.posterUrl}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      placeholder="blur"
                      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(300, 450))}`}
                    />
                  </div>
                  <div className="space-y-1 p-3">
                    <h2 className="line-clamp-1 text-sm font-semibold text-zinc-100">{anime.title}</h2>
                    <p className="line-clamp-1 text-xs text-zinc-400">{anime.subtitle}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-orange-400">★ {anime.score.toFixed(1)}</span>
                      <span className="text-zinc-400">EP {anime.episodesAired}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          <div className="pt-2 text-center">
            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs text-zinc-200 transition hover:border-orange-500 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? 'Завантаження...' : 'Показати ще'}
              </button>
            ) : (
              <p className="text-xs text-zinc-500">Більше результатів немає.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
