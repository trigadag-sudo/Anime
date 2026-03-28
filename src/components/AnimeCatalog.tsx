'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnimeCardData } from '@/lib/shikimori';

interface AnimeCatalogProps {
  initialItems: AnimeCardData[];
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

const toBase64 = (str: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.btoa(str);
};

export default function AnimeCatalog({ initialItems }: AnimeCatalogProps) {
  const [query, setQuery] = useState('');
  const [animeList, setAnimeList] = useState<AnimeCardData[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialItems.length > 0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setAnimeList(initialItems);
      setPage(1);
      setHasMore(initialItems.length > 0);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/anime?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = (await response.json()) as AnimeCardData[];
        setAnimeList(data);
        setHasMore(data.length >= 20);
        setPage(1);
      } catch {
        setAnimeList([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [initialItems, query]);

  const header = useMemo(
    () => (query.trim() ? `Результати пошуку: ${query}` : 'Популярні онґоїнґ тайтли'),
    [query],
  );

  useEffect(() => {
    if (query.trim()) {
      return;
    }

    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore && hasMore) {
          setLoadingMore(true);

          const nextPage = page + 1;
          fetch(`/api/anime?page=${nextPage}&limit=20`)
            .then(async (response) => {
              if (!response.ok) {
                throw new Error('Failed to load more anime');
              }

              const data = (await response.json()) as AnimeCardData[];
              setAnimeList((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const unique = data.filter((item) => !existingIds.has(item.id));
                return [...prev, ...unique];
              });
              setPage(nextPage);
              setHasMore(data.length >= 20);
            })
            .catch(() => {
              setHasMore(false);
            })
            .finally(() => {
              setLoadingMore(false);
            });
        }
      },
      { rootMargin: '500px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, query]);

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
        <h1 className="text-lg font-semibold">{header}</h1>
        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
          {animeList.length} тайтлів
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-2xl bg-zinc-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {animeList.map((anime, index) => (
              <motion.article
                key={anime.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.03 }}
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

          {!query.trim() && (
            <div ref={loadMoreRef} className="py-2 text-center text-xs text-zinc-500">
              {loadingMore ? 'Підвантаження наступної сторінки…' : hasMore ? 'Прокрути нижче для автопідвантаження' : 'Усі доступні аніме завантажені'}
            </div>
          )}
        </>
      )}
    </section>
  );
}
