/**
 * CodePilot AI • Supabase pgvector Store & Semantic Retrieval Engine
 * Manages vector embedding ingestion, pgvector storage, and cosine similarity RAG retrieval
 */

import { supabase } from '@/lib/supabase/client';
import { chunkRepositoryFiles, CodeChunk } from './chunker';
import { generateEmbedding, cosineSimilarity } from './embeddings';

export interface CodeChunkMatch {
  id?: string;
  repositoryName: string;
  filePath: string;
  chunkIndex: number;
  content: string;
  metadata?: Record<string, unknown>;
  similarity: number;
}

interface MemoryVectorRecord {
  id: string;
  repositoryName: string;
  filePath: string;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

declare global {
  // eslint-disable-next-line no-var
  var __codePilotVectorStore: MemoryVectorRecord[] | undefined;
}

// In-memory / browser fallback cache shared across Next.js route chunks
const getMemoryVectorStore = (): MemoryVectorRecord[] => {
  if (!globalThis.__codePilotVectorStore) {
    globalThis.__codePilotVectorStore = [];
  }
  return globalThis.__codePilotVectorStore;
};

/**
 * Ingests and indexes an entire repository into Supabase pgvector
 */
export async function indexRepositoryWithPgVector(
  repoName: string,
  files: Record<string, string>
): Promise<{
  success: boolean;
  totalChunks: number;
  indexedInSupabase: boolean;
  error?: string | null;
}> {
  try {
    const chunks = chunkRepositoryFiles(files);
    if (chunks.length === 0) {
      return { success: true, totalChunks: 0, indexedInSupabase: false };
    }

    const recordsToInsert = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      const record = {
        repository_name: repoName,
        file_path: chunk.filePath,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        token_count: chunk.tokenCount,
        metadata: {
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          ...chunk.metadata,
        },
        embedding,
      };

      recordsToInsert.push(record);

      // Keep in local memory fallback
      getMemoryVectorStore().push({
        id: `chunk-${repoName}-${chunk.filePath}-${chunk.chunkIndex}`.replace(/[^\w-]/g, '_'),
        repositoryName: repoName,
        filePath: chunk.filePath,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        metadata: record.metadata,
        embedding,
      });
    }

    // Attempt insert into Supabase pgvector table
    let indexedInSupabase = false;
    let supabaseError: string | null = null;

    try {
      // Clean up previous chunks for this repo to prevent duplicate bloat
      await supabase.from('code_embeddings').delete().eq('repository_name', repoName);

      // Batch insert in groups of 25 to respect payload sizes
      const batchSize = 25;
      for (let i = 0; i < recordsToInsert.length; i += batchSize) {
        const batch = recordsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('code_embeddings').insert(batch);
        if (error) {
          supabaseError = error.message;
          console.warn('Supabase pgvector insert batch notice:', error.message);
          break;
        }
      }

      if (!supabaseError) {
        indexedInSupabase = true;
      }
    } catch (dbErr) {
      supabaseError = (dbErr as Error).message;
    }

    return {
      success: true,
      totalChunks: recordsToInsert.length,
      indexedInSupabase,
      error: supabaseError,
    };
  } catch (err) {
    console.error('Failed to index repository in pgvector:', err);
    return {
      success: false,
      totalChunks: 0,
      indexedInSupabase: false,
      error: (err as Error).message,
    };
  }
}

/**
 * Semantic Vector Search (RAG): Queries Supabase pgvector using cosine distance
 */
export async function searchPgVector(
  query: string,
  repoName?: string,
  topK: number = 4
): Promise<CodeChunkMatch[]> {
  try {
    const queryVector = await generateEmbedding(query);

    // 1. Attempt Supabase RPC match_code_chunks
    try {
      const { data, error } = await supabase.rpc('match_code_chunks', {
        query_embedding: queryVector,
        match_threshold: 0.15,
        match_count: topK,
        filter_repo: repoName || null,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          repositoryName: item.repository_name,
          filePath: item.file_path,
          chunkIndex: item.chunk_index,
          content: item.content,
          metadata: item.metadata,
          similarity: Number(item.similarity.toFixed(4)),
        }));
      }
    } catch (rpcErr) {
      console.warn('Supabase pgvector RPC fallback to local cosine store:', rpcErr);
    }

    // 2. Memory / Local fallback cosine similarity search
    const candidates = getMemoryVectorStore().filter(
      (item) => !repoName || item.repositoryName.toLowerCase() === repoName.toLowerCase()
    );

    const scored = candidates.map((item) => {
      const sim = cosineSimilarity(queryVector, item.embedding);
      return {
        id: item.id,
        repositoryName: item.repositoryName,
        filePath: item.filePath,
        chunkIndex: item.chunkIndex,
        content: item.content,
        metadata: item.metadata,
        similarity: Number(sim.toFixed(4)),
      };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  } catch (err) {
    console.error('Vector search error:', err);
    return [];
  }
}

/**
 * Returns statistics of indexed embeddings
 */
export function getLocalVectorStoreCount(): number {
  return getMemoryVectorStore().length;
}
