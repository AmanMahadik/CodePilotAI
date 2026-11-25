/**
 * CodePilot AI • Intelligent Code Chunker
 * Decomposes source code files into semantically contiguous chunks with boundary overlap
 */

export interface CodeChunk {
  filePath: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  content: string;
  tokenCount: number;
  metadata: {
    language: string;
    lineCount: number;
    hasImports: boolean;
    hasExports: boolean;
  };
}

const CHUNK_LINE_SIZE = 40;
const CHUNK_LINE_OVERLAP = 10;

/**
 * Split source files into overlapping code chunks
 */
export function chunkRepositoryFiles(files: Record<string, string>): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!content || content.trim().length === 0) continue;

    const lines = content.split('\n');
    const totalLines = lines.length;
    const ext = filePath.split('.').pop()?.toLowerCase() || 'text';

    if (totalLines <= CHUNK_LINE_SIZE) {
      // Small file: Single complete chunk
      chunks.push({
        filePath,
        chunkIndex: 0,
        startLine: 1,
        endLine: totalLines,
        content: content.trim(),
        tokenCount: Math.round(content.length / 4),
        metadata: {
          language: ext,
          lineCount: totalLines,
          hasImports: /import\s+|require\(/.test(content),
          hasExports: /export\s+|module\.exports/.test(content),
        },
      });
      continue;
    }

    // Sliding window chunking with overlap
    let chunkIdx = 0;
    for (let i = 0; i < totalLines; i += CHUNK_LINE_SIZE - CHUNK_LINE_OVERLAP) {
      const slice = lines.slice(i, i + CHUNK_LINE_SIZE);
      const chunkText = slice.join('\n').trim();

      if (chunkText.length < 20) continue;

      chunks.push({
        filePath,
        chunkIndex: chunkIdx++,
        startLine: i + 1,
        endLine: Math.min(i + CHUNK_LINE_SIZE, totalLines),
        content: chunkText,
        tokenCount: Math.round(chunkText.length / 4),
        metadata: {
          language: ext,
          lineCount: slice.length,
          hasImports: /import\s+|require\(/.test(chunkText),
          hasExports: /export\s+|module\.exports/.test(chunkText),
        },
      });

      if (i + CHUNK_LINE_SIZE >= totalLines) {
        break;
      }
    }
  }

  return chunks;
}
