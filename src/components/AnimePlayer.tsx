'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface AnimePlayerProps {
  shikimoriId: number;
  title: string;
}

interface Provider {
  label: string;
  url: string;
}

const PROVIDERS: Provider[] = [
  {
    label: 'UA Баланс #1',
    url: 'https://ashdi.vip/embed/{id}?voice=uk&lang=uk&translation=uk',
  },
  {
    label: 'UA Баланс #2',
    url: 'https://ashdi.me/embed/{id}?voice=uk&lang=uk',
  },
  {
    label: 'Резерв #3',
    url: 'https://ashdi.vip/embed/{id}',
  },
];

const LOAD_TIMEOUT_MS = 12000;

export default function AnimePlayer({ shikimoriId, title }: AnimePlayerProps) {
  const providerPool = useMemo(
    () => PROVIDERS.map((provider) => ({ ...provider, url: provider.url.replace('{id}', String(shikimoriId)) })),
    [shikimoriId],
  );

  const [activeProvider, setActiveProvider] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoBalanced, setAutoBalanced] = useState(false);
  const [failedProviderIndexes, setFailedProviderIndexes] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeProviderData = providerPool[activeProvider];

  const clearTimer = () => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  };

  const goToProvider = (index: number, fromBalancer = false) => {
    if (index < 0 || index >= providerPool.length) return;
    setActiveProvider(index);
    setLoading(true);
    setAutoBalanced(fromBalancer);
  };

  useEffect(() => {
    if (!loading) {
      clearTimer();
      return;
    }

    clearTimer();

    timeoutRef.current = setTimeout(() => {
      setFailedProviderIndexes((prev) => (prev.includes(activeProvider) ? prev : [...prev, activeProvider]));

      const nextProviderIndex = providerPool.findIndex((_, idx) => idx > activeProvider && !failedProviderIndexes.includes(idx));

      if (nextProviderIndex !== -1) {
        goToProvider(nextProviderIndex, true);
        return;
      }

      setLoading(false);
    }, LOAD_TIMEOUT_MS);

    return clearTimer;
  }, [activeProvider, failedProviderIndexes, loading, providerPool]);

  const onIframeLoad = () => {
    clearTimer();
    setLoading(false);
  };

  const retryFromStart = () => {
    setFailedProviderIndexes([]);
    goToProvider(0, true);
  };

  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-xl">
      <div className="flex flex-wrap gap-2">
        {providerPool.map((provider, index) => {
          const isFailed = failedProviderIndexes.includes(index);

          return (
            <button
              key={`${provider.label}-${index}`}
              type="button"
              onClick={() => goToProvider(index, false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeProvider === index
                  ? 'bg-orange-500 text-white'
                  : 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-orange-500 hover:text-orange-400'
              } ${isFailed ? 'opacity-60' : ''}`}
            >
              {provider.label}
            </button>
          );
        })}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800">
        {loading && (
          <div className="absolute inset-0 z-10 animate-pulse bg-zinc-800/80">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-zinc-300">
              <p>Підключаємо плеєр...</p>
              <p className="text-xs text-zinc-400">Якщо джерело недоступне, балансир автоматично перемкне на наступне.</p>
            </div>
          </div>
        )}

        {activeProviderData ? (
          <iframe
            key={activeProviderData.url}
            src={activeProviderData.url}
            title={`Плеєр для ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
            onLoad={onIframeLoad}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-400">Немає доступних джерел плеєра.</div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span>
          Активне джерело: <span className="text-zinc-200">{activeProviderData?.label ?? '—'}</span>
        </span>
        {autoBalanced && <span className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-orange-300">авто-перемикання</span>}
        {failedProviderIndexes.length >= providerPool.length && (
          <button
            type="button"
            onClick={retryFromStart}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-200 hover:border-orange-500 hover:text-orange-300"
          >
            Спробувати знову
          </button>
        )}
      </div>
    </div>
  );
}
