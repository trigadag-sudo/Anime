'use client';

import Image from 'next/image';
import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from 'react';

interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string | null;
  image?: {
    original?: string;
    preview?: string;
  };
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Home page crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-2xl border border-red-900/40 bg-zinc-900/80 p-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-100">Сталася помилка</h1>
          <p className="mt-2 text-sm text-zinc-400">Спробуй оновити сторінку.</p>
        </section>
      );
    }

    return this.props.children;
  }
}

function normalizePoster(path?: string): string {
  if (!path) return 'https://shikimori.one/assets/globals/missing_original.jpg';
  return path.startsWith('http') ? path : `https://shikimori.one${path}`;
}

async function fetchAnime(): Promise<ShikimoriAnime[]> {
  const response = await fetch('https://shikimori.one/api/animes?limit=15&order=popularity', {
    headers: {
      'User-Agent': 'UkrFlix-App',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch anime: ${response.status}`);
  }

  return (await response.json()) as ShikimoriAnime[];
}

function HomeContent() {
  const [animeList, setAnimeList] = useState<ShikimoriAnime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<ShikimoriAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAnime();
        if (!isMounted) return;

        setAnimeList(data);
        if (data.length > 0) {
          setSelectedAnime(data[0]);
        }
      } catch {
        if (!isMounted) return;
        setError('Не вдалося завантажити аніме. Спробуй пізніше.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSelectAnime = (anime: ShikimoriAnime) => {
    setSelectedAnime(anime);

    requestAnimationFrame(() => {
      if (playerRef.current) {
        const top = playerRef.current.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  return (
    <main className="space-y-4 pb-8">
      <div ref={playerRef} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
        <h1 className="mb-2 text-lg font-semibold text-zinc-100">UkrFlix — Популярне аніме</h1>

        {loading ? (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-950 text-sm text-zinc-400">Завантаження...</div>
        ) : error ? (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-950 px-4 text-center text-sm text-red-300">{error}</div>
        ) : selectedAnime ? (
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <iframe
              key={selectedAnime.id}
              src={`https://ashdi.vip/embed/${selectedAnime.id}`}
              title={`Player ${selectedAnime.russian || selectedAnime.name}`}
              className="aspect-video w-full"
              allow="autoplay; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-950 text-sm text-zinc-400">Немає даних для відтворення.</div>
        )}
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {animeList.map((anime) => {
          const title = anime.russian || anime.name;
          const poster = normalizePoster(anime.image?.original || anime.image?.preview);
          const isActive = selectedAnime?.id === anime.id;

          return (
            <button
              key={anime.id}
              type="button"
              onClick={() => onSelectAnime(anime)}
              className={`overflow-hidden rounded-2xl border bg-zinc-900 text-left transition ${
                isActive ? 'border-orange-500' : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="relative aspect-[2/3] w-full">
                <Image src={poster} alt={title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium text-zinc-100">{title}</p>
              </div>
            </button>
          );
        })}
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}
