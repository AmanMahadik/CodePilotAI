import { NextRequest, NextResponse } from 'next/server';
import { searchPgVector } from '@/lib/rag/vector-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { query, repoName, topK = 4 } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing search query string' }, { status: 400 });
    }

    const matches = await searchPgVector(query, repoName, topK);

    return NextResponse.json({
      query,
      repoName: repoName || 'all',
      matchCount: matches.length,
      matches,
    });
  } catch (error) {
    console.error('API /api/rag/search error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to search pgvector' },
      { status: 500 }
    );
  }
}
