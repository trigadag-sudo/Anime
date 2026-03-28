'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface AnimePlayerProps {
  shikimoriId: number;
  title: string;
}

interface Provider {
  label: string;
  url: string;
}

const PROVIDER_TEMPLATES: Provider[] = [
  { label: 'Ashdi UA', url: 'https://ashdi.vip/embed/{id}?voice=uk&lang=uk&translation=uk' },
  { label: 'Ashdi Mirror UA', url: 'https://ashdi.me/embed/{id}?voice=uk&lang=uk&translation=uk' },
  { label: 'UFDub UA', url: 'https://ufdub.com/embed/{id}?lang=uk' },
  { label: 'Hikka UA', url: 'https://hikka.io/embed/{id}?language=uk' },
  { label: 'Fallback', url: 'https://ashdi.vip/embed/{id}' },
];

const LOAD_TIMEOUT_MS = 7000;

function parseUkrainianDubProviders(shikimoriId: number): Provider[] {
  const normalized = PROVIDER_TEMPLATES.map((provider) => ({
    label: provider.label,
    url: provider.url.replace('{id}', String(shikimoriId)),
  }));

  const seen = new Set<string>();
  return normalized.filter((provider) => {
    if (seen.has(provider.url)) return false;
    seen.add(provider.url);
    return true;
  });
}

export default function AnimePlayer({ shikimoriId, title }: AnimePlayerProps) {
  const providerPool = useMemo(() => parseUkrainianDubProviders(shikimoriId), [shikimoriId]);

  const [mounted, setMounted] = useState(false);
  const [activeProviderIndex, setActiveProviderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failedProviders, setFailedProviders] = useState<number[]>([]);
  const [autoSwitchCount, setAutoSwitchCount] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeProvider = providerPool[activeProviderIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimeoutRef = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const handleSourceFallback = useCallback((reason: string) => {
    // Used for analytics/debug hooks if needed in the future.
    void reason;
    setFailedProviders((prev) => {
      const nextFailed = prev.includes(activeProviderIndex) ? prev : [...prev, activeProviderIndex];
      const nextIndex = providerPool.findIndex((_, idx) => idx > activeProviderIndex && !nextFailed.includes(idx));

      if (nextIndex === -1) {
        setLoading(false);
        setAllFailed(true);
        return nextFailed;
      }

      setActiveProviderIndex(nextIndex);
      setLoading(true);
      setAutoSwitchCount((count) => count + 1);
      return nextFailed;
    });
  }, [activeProviderIndex, providerPool]);

  const setProviderManually = (index: number) => {
    if (index < 0 || index >= providerPool.length) return;
    setActiveProviderIndex(index);
    setLoading(true);
    setAllFailed(false);
  };

  useEffect(() => {
    if (!mounted || allFailed) return;

    setLoading(true);
    clearTimeoutRef();
    timeoutRef.current = setTimeout(() => {
      handleSourceFallback('timeout');
    }, LOAD_TIMEOUT_MS);

    return clearTimeoutRef;
  }, [activeProviderIndex, mounted, allFailed, handleSourceFallback]);

  useEffect(() => {
    if (!mounted || allFailed || !activeProvider) return;

    const providerOrigin = (() => {
      try {
        return new URL(activeProvider.url).origin;
      } catch {
        return '';
      }
    })();

    const onMessage = (event: MessageEvent) => {
      if (providerOrigin && event.origin !== providerOrigin) return;

      const payload = typeof event.data === 'string' ? event.data.toLowerCase() : '';
      if (payload.includes('ready') || payload.includes('player:ready') || payload.includes('playback-ready')) {
        clearTimeoutRef();
        setLoading(false);
      }
    };

    const onGlobalError = () => {
      handleSourceFallback('window-error');
    };

    const onUnhandledRejection = () => {
      handleSourceFallback('unhandled-rejection');
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('error', onGlobalError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('error', onGlobalError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [activeProvider, mounted, allFailed, handleSourceFallback]);

  const onIframeLoad = () => {
    // Fallback for providers that do not emit postMessage ready signals.
    clearTimeoutRef();
    setLoading(false);
  };

  const onIframeError = () => {
    handleSourceFallback('iframe-error');
  };

  const retryFromStart = () => {
    setFailedProviders([]);
    setAutoSwitchCount(0);
    setAllFailed(false);
    setActiveProviderIndex(0);
    setLoading(true);
  };

  const reportIssueHref = `mailto:support@example.com?subject=${encodeURIComponent(
    `Anime player issue: ${title}`,
  )}&body=${encodeURIComponent(`Anime ID: ${shikimoriId}\nCurrent provider: ${activeProvider?.label ?? 'unknown'}`)}`;

  if (!mounted) {
    return (
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
        <div className="aspect-video animate-pulse rounded-xl bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-xl">
      <div className="flex flex-wrap gap-2">
        {providerPool.map((provider, index) => {
          const isActive = activeProviderIndex === index;
          const isFailed = failedProviders.includes(index);

          return (
            <button
              key={`${provider.label}-${index}`}
              type="button"
              onClick={() => setProviderManually(index)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-orange-500 hover:text-orange-400'
              } ${isFailed ? 'opacity-60' : ''}`}
            >
              {provider.label}
            </button>
          );
        })}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        {loading && !allFailed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/80">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-600 border-t-orange-500" />
              <div className="h-2 w-40 animate-pulse rounded bg-zinc-700" />
              <p className="text-xs text-zinc-400">Підключення до джерела…</p>
            </div>
          </div>
        )}

        {!allFailed && activeProvider ? (
          <iframe
            key={activeProvider.url}
            src={activeProvider.url}
            title={`Плеєр для ${title}`}
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
              <h3 className="text-base font-semibold text-zinc-100">Контент тимчасово недоступний</h3>
              <p className="text-sm text-zinc-400">Ми перевірили всі джерела, але відтворення зараз недоступне.</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={retryFromStart}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 hover:border-orange-500 hover:text-orange-400"
                >
                  Спробувати знову
                </button>
                <a
                  href={reportIssueHref}
                  className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-400"
                >
                  Report Issue
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span>
          Активне джерело: <span className="text-zinc-200">{activeProvider?.label ?? '—'}</span>
        </span>
        {autoSwitchCount > 0 && (
          <span className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-orange-300">автоперемикання: {autoSwitchCount}</span>
        )}
      </div>
    </div>
  );
}
