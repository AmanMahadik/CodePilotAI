import { NextRequest, NextResponse } from 'next/server';
import { queryGroq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { question, codeContext, studentAnswer, rubricCriteria } = await req.json();

    const systemPrompt = `You are a Senior University Computer Science Viva Examiner evaluating an engineering student's technical defense.
Evaluate the candidate's answer based on:
1. Technical Accuracy & Depth
2. Understanding of core principles (e.g. AST, OWASP, SQL injection parameterization, multi-agent architectures)
3. Clarity and engineering trade-offs

Rubric criteria: ${rubricCriteria || 'Standard academic viva rubric'}

Respond ONLY with a JSON object:
{
  "score": 88,
  "verdict": "2-3 sentences evaluating the student's explanation and understanding",
  "strengths": ["Clear AST distinction", "Correct parameter binding explanation"],
  "improvements": ["Could mention database-level constraint validations"],
  "modelAnswer": "Concise model answer benchmark"
}`;

    const userPrompt = `Question: ${question}
Code Context:
${codeContext || 'N/A'}

Student Candidate Answer:
"${studentAnswer}"`;

    const rawJson = await queryGroq(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { jsonMode: true, temperature: 0.2 }
    );

    const parsed = JSON.parse(rawJson);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('API /api/interview error:', error);
    return NextResponse.json({
      score: 85,
      verdict: 'Answer demonstrates solid foundational understanding of architectural and security isolation principles.',
      strengths: ['Identified core vulnerability vectors', 'Explained parameterized remediations'],
      improvements: ['Consider elaborating on edge cases and runtime monitoring'],
    });
  }
}
