'use client';

import { useMemo, useState } from 'react';

interface AnimePlayerProps {
  shikimoriId: number;
  title: string;
}

interface Provider {
  label: string;
  url: string;
}

export default function AnimePlayer({ shikimoriId, title }: AnimePlayerProps) {
  const providers = useMemo<Provider[]>(
    () => [
      {
        label: 'Ashdi UA (авто)',
        url: `https://ashdi.vip/embed/${shikimoriId}?voice=uk&lang=uk&translation=uk`,
      },
      {
        label: 'Ashdi Default',
        url: `https://ashdi.vip/embed/${shikimoriId}`,
      },
    ],
    [shikimoriId],
  );

  const [activeProvider, setActiveProvider] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full space-y-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 shadow-xl">
      <div className="flex flex-wrap items-center gap-2">
        {providers.map((provider, index) => (
          <button
            key={provider.label}
            type="button"
            onClick={() => {
              setActiveProvider(index);
              setIsLoading(true);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeProvider === index
                ? 'bg-orange-500 text-white'
                : 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-orange-500 hover:text-orange-400'
            }`}
          >
            {provider.label}
          </button>
        ))}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800">
        {isLoading && (
          <div className="absolute inset-0 z-10 animate-pulse bg-zinc-800/80">
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
              Завантаження плеєра з українською озвучкою...
            </div>
          </div>
        )}

        <iframe
          key={providers[activeProvider].url}
          src={providers[activeProvider].url}
          title={`Плеєр для ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <p className="text-xs text-zinc-400">
        За замовчуванням активовано UA-профіль. Якщо джерело недоступне — перемкни плеєр кнопками вище.
      </p>
    </div>
  );
}
