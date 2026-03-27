import { NextRequest, NextResponse } from 'next/server';
import { getTopOngoingAnime, searchAnime } from '@/lib/shikimori';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  try {
    const data = query ? await searchAnime(query, 20) : await getTopOngoingAnime(20);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to fetch anime' }, { status: 500 });
  }
}
