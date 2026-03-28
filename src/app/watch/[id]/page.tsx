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

  return (
    <section className="space-y-4">
      <Link
        href="/"
        className="inline-flex rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-orange-500 hover:text-orange-400"
      >
        ← Назад до каталогу
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-zinc-100">{anime.title}</h1>
        <p className="text-sm text-zinc-400">{anime.subtitle}</p>
      </header>

      <AnimePlayer shikimoriId={anime.id} title={anime.title} />

      <p className="text-xs text-zinc-500">Плеєр автоматично пробує резервні джерела, якщо перше не відповідає.</p>
    </section>
  );
}
