import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnimePlayer from '@/components/AnimePlayer';
import { getAnimeById } from '@/lib/shikimori';

interface WatchPageProps {
  params: {
    id: string;
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const anime = await getAnimeById(params.id);

  if (!anime) {
    notFound();
  }

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: anime.title,
    description: anime.subtitle || anime.title,
    thumbnailUrl: [anime.posterUrl],
    embedUrl: `https://ashdi.vip/embed/${anime.id}`,
    genre: 'Anime',
    inLanguage: 'uk',
    potentialAction: {
      '@type': 'WatchAction',
      target: `https://animehub-ua.vercel.app/watch/${anime.id}`,
    },
  };

  return (
    <section className="relative isolate space-y-4 overflow-hidden rounded-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />

      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat blur-xl"
        style={{ backgroundImage: `url(${anime.posterUrl})`, transform: 'scale(1.15)' }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/85 via-black/75 to-zinc-950" />

      <div className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-white/15 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200 transition hover:border-orange-500 hover:text-orange-300"
        >
          ← Назад до каталогу
        </Link>

        <header className="mt-4 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">{anime.title}</h1>
          <p className="text-sm text-zinc-300">{anime.subtitle}</p>
        </header>
      </div>

      <AnimePlayer shikimoriId={anime.id} title={anime.title} />
    </section>
  );
}
