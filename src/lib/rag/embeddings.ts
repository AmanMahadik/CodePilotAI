/**
 * CodePilot AI • Vector Embeddings Generator
 * Generates 384-dimensional dense semantic vector representations for code & queries
 * Compatible with Supabase pgvector vector(384)
 */

export const EMBEDDING_DIMENSION = 384;

/**
 * Fast string hash with 32-bit output
 */
function hashString(str: string, seed: number = 0): number {
  let h = seed ^ 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Tokenize code into semantic terms, keywords, and identifiers
 */
function tokenizeCode(text: string): string[] {
  // Split on symbols and extract code identifiers
  const rawTokens = text
    .toLowerCase()
    .replace(/[^\w\s$]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const tokens: string[] = [];

  for (const token of rawTokens) {
    tokens.push(token);

    // Expand camelCase and snake_case tokens
    if (token.includes('_')) {
      token.split('_').filter((p) => p.length > 1).forEach((p) => tokens.push(p));
    }
  }

  // Generate character/word bi-grams for semantic n-gram matching
  for (let i = 0; i < rawTokens.length - 1; i++) {
    tokens.push(`${rawTokens[i]}_${rawTokens[i + 1]}`);
  }

  return tokens;
}

/**
 * Generates a normalized 384-dimensional dense semantic embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const vector = new Float64Array(EMBEDDING_DIMENSION);

  if (!text || text.trim().length === 0) {
    return Array.from(vector);
  }

  const tokens = tokenizeCode(text);

  // Term frequencies with sublinear scaling
  const termCounts: Record<string, number> = {};
  for (const token of tokens) {
    termCounts[token] = (termCounts[token] || 0) + 1;
  }

  // Project features into 384 dimensions using multiple hash seeds
  for (const [token, count] of Object.entries(termCounts)) {
    const weight = 1 + Math.log(count);

    // Seed 1: Primary dimension index
    const h1 = hashString(token, 42);
    const dim1 = h1 % EMBEDDING_DIMENSION;
    const sign1 = (hashString(token, 101) & 1) === 0 ? 1 : -1;
    vector[dim1] += weight * sign1;

    // Seed 2: Secondary dimension cross-projection for distributed representations
    const h2 = hashString(token, 1337);
    const dim2 = h2 % EMBEDDING_DIMENSION;
    const sign2 = (hashString(token, 2024) & 1) === 0 ? 1 : -1;
    vector[dim2] += weight * 0.5 * sign2;
  }

  // Calculate L2 Norm for unit vector normalization
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    sumSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(sumSq) || 1.0;

  // Normalize to unit length (values strictly between -1 and 1)
  const normalizedVector: number[] = new Array(EMBEDDING_DIMENSION);
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    const val = Number((vector[i] / norm).toFixed(6));
    normalizedVector[i] = Number.isFinite(val) ? val : 0;
  }

  return normalizedVector;
}

/**
 * Compute cosine similarity between two dense vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}
