import { NextRequest, NextResponse } from 'next/server';
import { getTopOngoingAnime, searchAnime } from '@/lib/shikimori';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? '1') || 1);
  const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? '20') || 20));

  try {
    const data = query
      ? await searchAnime(query, limit, page)
      : await getTopOngoingAnime(limit, page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to fetch anime' }, { status: 500 });
  }
}
