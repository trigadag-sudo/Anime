const SHIKIMORI_API = 'https://shikimori.one/api';
const SHIKIMORI_CDN = 'https://shikimori.one';

export interface ShikimoriImage {
  original: string;
  preview: string;
  x96: string;
  x48: string;
}

export interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string | null;
  score: string;
  status: string;
  kind: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string | null;
  image: ShikimoriImage;
  url: string;
}

export interface AnimeCardData {
  id: number;
  title: string;
  subtitle: string;
  score: number;
  posterUrl: string;
  episodesAired: number;
}

const withCdn = (path: string) => `${SHIKIMORI_CDN}${path}`;

const normalizeAnime = (anime: ShikimoriAnime): AnimeCardData => ({
  id: anime.id,
  title: anime.russian || anime.name,
  subtitle: anime.name,
  score: Number(anime.score || 0),
  posterUrl: withCdn(anime.image.original || anime.image.preview),
  episodesAired: anime.episodes_aired,
});

async function requestShikimori<T>(path: string): Promise<T> {
  const response = await fetch(`${SHIKIMORI_API}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AnimeHub-UA/1.0 (+https://vercel.app)',
    },
    next: { revalidate: 60 * 10 },
  });

  if (!response.ok) {
    throw new Error(`Shikimori API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getTopOngoingAnime(limit = 20): Promise<AnimeCardData[]> {
  try {
    const params = new URLSearchParams({
      order: 'popularity',
      status: 'ongoing',
      limit: String(limit),
    });

    const data = await requestShikimori<ShikimoriAnime[]>(`/animes?${params.toString()}`);
    return data.map(normalizeAnime);
  } catch {
    return [];
  }
}

export async function searchAnime(query: string, limit = 20): Promise<AnimeCardData[]> {
  try {
    const params = new URLSearchParams({
      search: query,
      limit: String(limit),
      order: 'popularity',
    });

    const data = await requestShikimori<ShikimoriAnime[]>(`/animes?${params.toString()}`);
    return data.map(normalizeAnime);
  } catch {
    return [];
  }
}

export async function getAnimeById(id: string): Promise<AnimeCardData | null> {
  try {
    const anime = await requestShikimori<ShikimoriAnime>(`/animes/${id}`);

    if (!anime?.id) {
      return null;
    }

    return normalizeAnime(anime);
  } catch {
    return null;
  }
}
