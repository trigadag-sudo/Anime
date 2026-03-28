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
  { label: 'UA #1', url: 'https://ashdi.vip/embed/{id}?voice=uk&lang=uk&translation=uk' },
  { label: 'UA #2', url: 'https://ashdi.me/embed/{id}?voice=uk&lang=uk' },
  { label: 'Fallback', url: 'https://ashdi.vip/embed/{id}' },
];

const LOAD_TIMEOUT_MS = 12000;

export default function AnimePlayer({ shikimoriId, title }: AnimePlayerProps) {
  const providerPool = useMemo(
    () => PROVIDERS.map((provider) => ({ ...provider, url: provider.url.replace('{id}', String(shikimoriId)) })),
    [shikimoriId],
  );

  const [activeProviderIndex, setActiveProviderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<number[]>([]);
  const [autoSwitchCount, setAutoSwitchCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeProvider = providerPool[activeProviderIndex];

  const clearTimer = () => {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const setProvider = (index: number, auto = false) => {
    if (index < 0 || index >= providerPool.length) return;
    setActiveProviderIndex(index);
    setLoading(true);
    if (auto) setAutoSwitchCount((prev) => prev + 1);
  };

  const switchToNextProvider = () => {
    setFailed((prev) => {
      const nextFailed = prev.includes(activeProviderIndex) ? prev : [...prev, activeProviderIndex];
      const nextIndex = providerPool.findIndex((_, idx) => idx > activeProviderIndex && !nextFailed.includes(idx));

      if (nextIndex !== -1) {
        setProvider(nextIndex, true);
      } else {
        setLoading(false);
      }

      return nextFailed;
    });
  };

  useEffect(() => {
    if (!loading) {
      clearTimer();
      return;
    }

    clearTimer();
    timerRef.current = setTimeout(switchToNextProvider, LOAD_TIMEOUT_MS);

    return clearTimer;
  }, [activeProviderIndex, loading]);

  const onIframeLoad = () => {
    clearTimer();
    setLoading(false);
  };

  const retry = () => {
    setFailed([]);
    setAutoSwitchCount(0);
    setProvider(0, false);
  };

  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-xl">
      <div className="flex flex-wrap gap-2">
        {providerPool.map((provider, index) => {
          const isFailed = failed.includes(index);
          const isActive = activeProviderIndex === index;

          return (
            <button
              key={`${provider.label}-${index}`}
              type="button"
              onClick={() => setProvider(index, false)}
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

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800">
        {loading && (
          <div className="absolute inset-0 z-10 animate-pulse bg-zinc-800/80">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-sm text-zinc-300">
              <p>Завантаження плеєра...</p>
              <p className="text-xs text-zinc-400">Якщо джерело не відповідає, буде автоматичний перехід на наступне.</p>
            </div>
          </div>
        )}

        {activeProvider ? (
          <iframe
            key={activeProvider.url}
            src={activeProvider.url}
            title={`Плеєр для ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
            onLoad={onIframeLoad}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-zinc-400">Джерела плеєра тимчасово недоступні.</div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span>
          Активне джерело: <span className="text-zinc-200">{activeProvider?.label ?? '—'}</span>
        </span>
        {autoSwitchCount > 0 && <span className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-orange-300">авто-перемикання: {autoSwitchCount}</span>}
        {failed.length >= providerPool.length && (
          <button
            type="button"
            onClick={retry}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-200 hover:border-orange-500 hover:text-orange-300"
          >
            Спробувати знову
          </button>
        )}
      </div>
    </div>
  );
}
