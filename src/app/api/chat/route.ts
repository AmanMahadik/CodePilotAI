import { NextRequest, NextResponse } from 'next/server';
import { queryGroq, GroqChatMessage } from '@/lib/groq';
import { searchPgVector, CodeChunkMatch } from '@/lib/rag/vector-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages = [], repoName = 'Workspace', branch = 'main', findings = [] } = await req.json();

    // 1. RAG Retrieval via Supabase pgvector
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';
    let ragChunks: CodeChunkMatch[] = [];

    if (lastUserMessage.trim()) {
      try {
        ragChunks = await searchPgVector(lastUserMessage, repoName, 3);
      } catch (ragErr) {
        console.warn('pgvector retrieval notice in /api/chat:', ragErr);
      }
    }

    const ragContext = ragChunks.length > 0
      ? `\n\n--- Retrieved Codebase Chunks via Supabase pgvector ---\n` +
        ragChunks.map((c, i) => 
          `[Chunk ${i + 1}] File: ${c.filePath} (Similarity: ${(c.similarity * 100).toFixed(1)}%)\n\`\`\`\n${c.content}\n\`\`\``
        ).join('\n\n')
      : '';

    const findingsContext = findings.length > 0
      ? `Active code review findings for ${repoName} (${branch}):\n` +
        findings.slice(0, 5).map((f: { id: string; title: string; file: string; severity: string; owaspCategory?: string }) => 
          `- [${f.id}] (${f.severity}) ${f.title} in ${f.file} (${f.owaspCategory || 'Code Smells'})`
        ).join('\n')
      : `Repository ${repoName} has 0 critical blocking findings.`;

    const systemPrompt: GroqChatMessage = {
      role: 'system',
      content: `You are CodePilot AI Terminal Assistant — a senior staff software engineering AI mentor equipped with Supabase pgvector RAG code retrieval.
Repository: ${repoName} (branch: ${branch})
${findingsContext}
${ragContext}

Instructions:
1. Provide concise, expert, senior-level code analysis and plain-language engineering explanations.
2. Refer to the retrieved code chunks and findings above when answering questions about specific files or functions.
3. When the user asks about security or findings, cite the exact finding ID, OWASP Top 10 guidelines (e.g. A01, A03), and supply concrete code diffs or parameterized fixes.
4. Keep responses structured with Markdown headings, bullet points, and code blocks. Be helpful, constructive, and precise.`
    };

    const formattedMessages: GroqChatMessage[] = [
      systemPrompt,
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const reply = await queryGroq(formattedMessages, { temperature: 0.3, max_tokens: 1024 });

    return NextResponse.json({ 
      reply,
      rag: {
        source: 'supabase_pgvector',
        retrievedCount: ragChunks.length,
        chunks: ragChunks.map((c) => ({
          filePath: c.filePath,
          similarity: c.similarity,
        })),
      }
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      { reply: 'I am currently operating in offline mode. Make sure your network connection or Groq API key is valid.' },
      { status: 200 }
    );
  }
}
