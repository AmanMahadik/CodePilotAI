import { NextRequest, NextResponse } from 'next/server';
import { indexRepositoryWithPgVector } from '@/lib/rag/vector-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { repoName, files } = await req.json();

    if (!repoName || !files || typeof files !== 'object') {
      return NextResponse.json(
        { error: 'Missing required parameters: repoName and files object' },
        { status: 400 }
      );
    }

    const result = await indexRepositoryWithPgVector(repoName, files);

    return NextResponse.json({
      message: `Successfully processed ${result.totalChunks} code chunks for repository "${repoName}".`,
      ...result,
    });
  } catch (error) {
    console.error('API /api/rag/index error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to index repository in pgvector' },
      { status: 500 }
    );
  }
}
