import { NextRequest, NextResponse } from 'next/server';
import { runGroqMultiAgentScan } from '@/lib/groq';
import { runMultiAgentReview } from '@/lib/analysis-engine';
import { indexRepositoryWithPgVector } from '@/lib/rag/vector-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoName = 'Workspace', branch = 'main', skillLevel = 'intermediate', files = {}, brandingInfo } = body;

    const fileEntries = Object.entries(files);
    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: `Invalid Code Repository: No source code files found in "${repoName}". CodePilot AI requires source code files (.ts, .js, .py, .java, etc.) to perform engineering analysis.` },
        { status: 400 }
      );
    }

    // Trigger Supabase pgvector embedding indexing in parallel
    indexRepositoryWithPgVector(repoName, files as Record<string, string>).catch((err) => {
      console.warn('Asynchronous pgvector indexing notice:', err);
    });

    let aiScanResult: Awaited<ReturnType<typeof runGroqMultiAgentScan>> | null = null;
    
    // Attempt Groq Multi-Agent Orchestration
    try {
      if (Object.keys(files).length > 0) {
        aiScanResult = await runGroqMultiAgentScan(repoName, files, skillLevel);
      }
    } catch (aiErr) {
      console.warn('Groq AI scan fallback to rule-based engine:', aiErr);
    }

    // Baseline review from analysis engine
    const baselineReview = await runMultiAgentReview(repoName, branch, skillLevel, files, brandingInfo);

    if (aiScanResult && aiScanResult.findings && aiScanResult.findings.length > 0) {
      const reviewId = baselineReview.id;
      const mergedFindings = [
        ...aiScanResult.findings.map((f, i) => ({
          id: `find-groq-${i + 1}`,
          reviewId,
          agentType: f.agentType || 'security',
          category: f.category || 'security',
          severity: f.severity || 'High',
          title: f.title,
          description: f.description,
          principleExplanation: f.principleExplanation,
          file: f.file || 'src/index.ts',
          lineStart: f.lineStart || 1,
          lineEnd: f.lineEnd || 10,
          codeSnippet: f.codeSnippet || '',
          suggestedFix: f.suggestedFix || '',
          owaspCategory: f.owaspCategory || 'OWASP Top 10 Security',
        })),
        ...baselineReview.findings,
      ].slice(0, 8);

      return NextResponse.json({
        ...baselineReview,
        scores: aiScanResult.scores || baselineReview.scores,
        executiveSummary: aiScanResult.executiveSummary || baselineReview.executiveSummary,
        findings: mergedFindings,
      });
    }

    return NextResponse.json(baselineReview);
  } catch (error) {
    console.error('API /api/analyze error:', error);
    return NextResponse.json({ error: 'Failed to complete code analysis' }, { status: 500 });
  }
}
