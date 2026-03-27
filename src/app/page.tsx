import AnimeCatalog from '@/components/AnimeCatalog';
import { getTopOngoingAnime } from '@/lib/shikimori';

export default async function HomePage() {
  const topOngoing = await getTopOngoingAnime(20);

  if (!topOngoing.length) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-center">
        <h1 className="text-xl font-semibold text-zinc-100">Тимчасово недоступно</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Не вдалося завантажити список аніме з Shikimori. Спробуй оновити сторінку через кілька хвилин.
        </p>
      </section>
    );
  }

  return <AnimeCatalog initialItems={topOngoing} />;
}
