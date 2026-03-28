const SHIKIMORI_API = 'https://shikimori.one/api';
const SHIKIMORI_CDN = 'https://shikimori.one';

export interface ShikimoriImage {
  original?: string;
  preview?: string;
  x96?: string;
  x48?: string;
}

export interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string | null;
  score: string;
  episodes_aired: number;
  image: ShikimoriImage;
}

export interface AnimeCardData {
  id: number;
  title: string;
  subtitle: string;
  score: number;
  posterUrl: string;
  episodesAired: number;
}

const FALLBACK_POSTER = 'https://shikimori.one/assets/globals/missing_original.jpg';

function withCdn(path?: string): string {
  if (!path) return FALLBACK_POSTER;
  return path.startsWith('http') ? path : `${SHIKIMORI_CDN}${path}`;
}

function normalizeAnime(anime: ShikimoriAnime): AnimeCardData {
  return {
    id: anime.id,
    title: anime.russian || anime.name,
    subtitle: anime.name,
    score: Number(anime.score || 0),
    posterUrl: withCdn(anime.image?.original || anime.image?.preview),
    episodesAired: anime.episodes_aired || 0,
  };
}

async function requestShikimori<T>(path: string): Promise<T> {
  const response = await fetch(`${SHIKIMORI_API}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'AnimeHub-UA/1.0',
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Shikimori API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getTopOngoingAnime(limit = 20, page = 1): Promise<AnimeCardData[]> {
  try {
    const params = new URLSearchParams({
      order: 'popularity',
      status: 'ongoing',
      page: String(page),
      limit: String(limit),
    });

    const data = await requestShikimori<ShikimoriAnime[]>(`/animes?${params.toString()}`);
    return data.map(normalizeAnime);
  } catch {
    return [];
  }
}

export async function searchAnime(query: string, limit = 20, page = 1): Promise<AnimeCardData[]> {
  try {
    const params = new URLSearchParams({
      search: query,
      order: 'popularity',
      page: String(page),
      limit: String(limit),
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
    if (!anime?.id) return null;
    return normalizeAnime(anime);
  } catch {
    return null;
  }
}
