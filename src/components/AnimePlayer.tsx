'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface AnimePlayerProps {
  shikimoriId: number;
  title: string;
}

interface ProviderSource {
  label: string;
  embedTemplate: string;
  torrentTemplate?: string;
}

interface ParsedProvider {
  label: string;
  embedUrl: string;
  torrentUrl: string | null;
}

const PROVIDERS: ProviderSource[] = [
  {
    label: 'UA #1',
    embedTemplate: 'https://ashdi.vip/embed/{id}?voice=uk&lang=uk&translation=uk',
    torrentTemplate: 'https://nyaa.si/?f=0&c=1_2&q={query}',
  },
  {
    label: 'UA #2',
    embedTemplate: 'https://ashdi.me/embed/{id}?voice=uk&lang=uk&translation=uk',
    torrentTemplate: 'https://toloka.to/tracker.php?nm={query}',
  },
  {
    label: 'Fallback',
    embedTemplate: 'https://ashdi.vip/embed/{id}',
    torrentTemplate: 'https://nyaa.si/?f=0&c=1_0&q={query}',
  },
];

const LOAD_TIMEOUT_MS = 7000;
const EMBED_ALLOWED_QUERY = new Set(['voice', 'lang', 'translation', 'language', 'id']);

function sanitizeEmbedUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);

    // Strip trackers/ads params from embed URL.
    const keysToValidate: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      keysToValidate.push(key);
    });

    keysToValidate.forEach((key) => {
      if (!EMBED_ALLOWED_QUERY.has(key)) {
        parsed.searchParams.delete(key);
      }
    });

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function extractTorrentLink(provider: ProviderSource, shikimoriId: number, title: string): string | null {
  if (!provider.torrentTemplate) return null;

  return provider.torrentTemplate
    .replace('{id}', String(shikimoriId))
    .replace('{query}', encodeURIComponent(`${title} ukr dub`));
}

function parseProviderSources(shikimoriId: number, title: string): ParsedProvider[] {
  const parsed = PROVIDERS.map((provider) => {
    const embedUrl = sanitizeEmbedUrl(provider.embedTemplate.replace('{id}', String(shikimoriId)));
    const torrentUrl = extractTorrentLink(provider, shikimoriId, title);

    return {
      label: provider.label,
      embedUrl,
      torrentUrl,
    };
  });

  const seen = new Set<string>();
  return parsed.filter((item) => {
    if (seen.has(item.embedUrl)) return false;
    seen.add(item.embedUrl);
    return true;
  });
}

export default function AnimePlayer({ shikimoriId, title }: AnimePlayerProps) {
  const providers = useMemo(() => parseProviderSources(shikimoriId, title), [shikimoriId, title]);

  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);
  const [failedIndexes, setFailedIndexes] = useState<number[]>([]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeProvider = providers[activeIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearLoadTimer = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const handleSourceFallback = useCallback(
    (reason: string) => {
      void reason;

      setFailedIndexes((prev) => {
        const nextFailed = prev.includes(activeIndex) ? prev : [...prev, activeIndex];
        const next = providers.findIndex((_, idx) => idx > activeIndex && !nextFailed.includes(idx));

        if (next === -1) {
          setAllFailed(true);
          setLoading(false);
          return nextFailed;
        }

        setActiveIndex(next);
        setLoading(true);
        return nextFailed;
      });
    },
    [activeIndex, providers],
  );

  useEffect(() => {
    if (!mounted || allFailed || !activeProvider) return;

    clearLoadTimer();
    setLoading(true);

    timeoutRef.current = setTimeout(() => {
      handleSourceFallback('timeout');
    }, LOAD_TIMEOUT_MS);

    return clearLoadTimer;
  }, [mounted, allFailed, activeProvider, handleSourceFallback]);

  useEffect(() => {
    if (!mounted || allFailed || !activeProvider) return;

    let providerOrigin = '';
    try {
      providerOrigin = new URL(activeProvider.embedUrl).origin;
    } catch {
      providerOrigin = '';
    }

    const onMessage = (event: MessageEvent) => {
      if (providerOrigin && event.origin !== providerOrigin) return;

      const payload = typeof event.data === 'string' ? event.data.toLowerCase() : '';
      if (payload.includes('blocked') || payload.includes('forbidden') || payload.includes('error')) {
        handleSourceFallback('postmessage-error');
        return;
      }

      if (payload.includes('ready') || payload.includes('player:ready') || payload.includes('playback-ready')) {
        clearLoadTimer();
        setLoading(false);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [mounted, allFailed, activeProvider, handleSourceFallback]);

  const onIframeLoad = () => {
    clearLoadTimer();
    setLoading(false);
  };

  const onIframeError = () => {
    handleSourceFallback('iframe-error');
  };

  const onSwitchSource = (index: number) => {
    if (index < 0 || index >= providers.length) return;
    setActiveIndex(index);
    setAllFailed(false);
    setLoading(true);
  };

  const retryAll = () => {
    setFailedIndexes([]);
    setAllFailed(false);
    setActiveIndex(0);
    setLoading(true);
  };

  const reportIssueHref = `mailto:support@example.com?subject=${encodeURIComponent(
    `Video unavailable: ${title}`,
  )}&body=${encodeURIComponent(`Anime: ${title}\nID: ${shikimoriId}\nProvider: ${activeProvider?.label ?? 'N/A'}`)}`;

  if (!mounted) {
    return <div className="aspect-video w-full animate-pulse rounded-2xl bg-black/40 backdrop-blur-xl" />;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
      <div className="relative flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-zinc-900/70 p-2">
        {providers.map((provider, index) => {
          const isActive = activeIndex === index;
          const isFailed = failedIndexes.includes(index);

          return (
            <motion.button
              key={provider.label}
              type="button"
              onClick={() => onSwitchSource(index)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-xl px-3 py-2 text-xs font-medium transition ${
                isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
              } ${isFailed ? 'opacity-60' : ''}`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-provider-pill"
                  className="absolute inset-0 rounded-xl bg-orange-500"
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}
              <span className="relative z-10">{provider.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/70">
        {loading && !allFailed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 backdrop-blur-sm">
            <div className="w-48 space-y-3">
              <div className="h-2 w-full animate-pulse rounded-full bg-zinc-700" />
              <div className="h-2 w-5/6 animate-pulse rounded-full bg-zinc-700/80" />
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-500 border-t-orange-500" />
              <p className="text-center text-xs text-zinc-300">Підключаємо найкраще джерело...</p>
            </div>
          </div>
        )}

        {!allFailed && activeProvider ? (
          <iframe
            key={activeProvider.embedUrl}
            src={activeProvider.embedUrl}
            title={`Anime player: ${title}`}
            allow="autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
            onLoad={onIframeLoad}
            onError={onIframeError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Content Unavailable</h3>
              <p className="text-sm text-zinc-300">Не вдалося підключити жодне джерело. Спробуй ще раз або повідом про проблему.</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={retryAll}
                  className="rounded-xl border border-white/15 bg-zinc-800/80 px-4 py-2 text-xs font-medium text-zinc-100 hover:border-orange-400"
                >
                  Retry
                </button>
                <a
                  href={reportIssueHref}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  Report Issue
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 backdrop-blur-lg">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Download (Torrent)</p>
        <div className="flex flex-wrap gap-2">
          {providers
            .filter((provider) => provider.torrentUrl)
            .map((provider) => (
              <a
                key={`torrent-${provider.label}`}
                href={provider.torrentUrl ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-zinc-200 hover:border-orange-400 hover:text-white"
              >
                .torrent via {provider.label}
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
