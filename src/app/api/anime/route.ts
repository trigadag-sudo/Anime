import { NextRequest, NextResponse } from 'next/server';
import { getTopOngoingAnime, searchAnime } from '@/lib/shikimori';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
    const page = parsePositiveInt(request.nextUrl.searchParams.get('page'), 1);
    const limit = Math.min(MAX_LIMIT, parsePositiveInt(request.nextUrl.searchParams.get('limit'), DEFAULT_LIMIT));

    const items = query ? await searchAnime(query, limit, page) : await getTopOngoingAnime(limit, page);

    return NextResponse.json({
      items,
      page,
      limit,
      hasMore: items.length === limit,
    });
  } catch {
    return NextResponse.json(
      {
        items: [],
        page: 1,
        limit: DEFAULT_LIMIT,
        hasMore: false,
        error: 'Failed to load anime data',
      },
      { status: 500 },
    );
  }
}
