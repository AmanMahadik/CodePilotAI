-- ==============================================================================
-- CodePilot AI • Supabase pgvector RAG Architecture Migration
-- Enables pgvector extension, code chunk storage, and cosine similarity search
-- ==============================================================================

-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the code_embeddings table for storing vector-indexed repository code
CREATE TABLE IF NOT EXISTS public.code_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(384) NOT NULL, -- 384-dimensional dense semantic embedding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create an index for fast cosine distance vector search (<=>)
-- Uses IVFFlat indexing for high-performance sub-second nearest-neighbor queries
CREATE INDEX IF NOT EXISTS code_embeddings_vector_idx 
ON public.code_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create secondary index for instant repository filtering
CREATE INDEX IF NOT EXISTS code_embeddings_repo_idx 
ON public.code_embeddings (repository_name);

-- 4. Create Postgres RPC function for semantic similarity retrieval (RAG)
CREATE OR REPLACE FUNCTION match_code_chunks (
  query_embedding vector(384),
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 5,
  filter_repo text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  repository_name TEXT,
  file_path TEXT,
  chunk_index INT,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.repository_name,
    ce.file_path,
    ce.chunk_index,
    ce.content,
    ce.metadata,
    (1 - (ce.embedding <=> query_embedding))::float AS similarity
  FROM public.code_embeddings ce
  WHERE (filter_repo IS NULL OR ce.repository_name ILIKE filter_repo)
    AND (1 - (ce.embedding <=> query_embedding)) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Set up Security, RLS and Permissions
ALTER TABLE public.code_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated read and write access for repository analysis
DROP POLICY IF EXISTS "Allow select on code_embeddings" ON public.code_embeddings;
CREATE POLICY "Allow select on code_embeddings" 
ON public.code_embeddings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert on code_embeddings" ON public.code_embeddings;
CREATE POLICY "Allow insert on code_embeddings" 
ON public.code_embeddings FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete on code_embeddings" ON public.code_embeddings;
CREATE POLICY "Allow delete on code_embeddings" 
ON public.code_embeddings FOR DELETE 
USING (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON public.code_embeddings TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION match_code_chunks TO anon, authenticated, service_role;
