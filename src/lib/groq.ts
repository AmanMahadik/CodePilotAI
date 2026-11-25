/**
 * Groq AI Multi-Agent Orchestrator Service
 * Leverages ultra-fast Llama/GPT-OSS models via Groq API
 */

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-120b';

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('GROQ_API_KEY environment variable is not configured.');
  }
  return key;
}

/**
 * Execute a completion via Groq API
 */
export async function queryGroq(
  messages: GroqChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  const apiKey = getApiKey();
  const model = options.model || DEFAULT_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens ?? 2048,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content.trim();
}

/**
 * Multi-Agent Orchestrator for Repository Analysis
 */
export async function runGroqMultiAgentScan(
  repoName: string,
  files: Record<string, string>,
  skillLevel: string = 'intermediate'
): Promise<{
  executiveSummary: string;
  scores: { overall: number; quality: number; security: number; documentation: number; reliability: number };
  findings: Array<{
    category: 'code-quality' | 'security' | 'bug' | 'documentation';
    agentType: 'repository' | 'quality' | 'security' | 'documentation';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    principleExplanation: string;
    file: string;
    lineStart: number;
    lineEnd: number;
    codeSnippet: string;
    suggestedFix: string;
    owaspCategory?: string;
  }>;
}> {
  // Sample top files up to 6 files to prevent token limit exceed
  const fileEntries = Object.entries(files).slice(0, 6);
  const codeSummary = fileEntries
    .map(([path, code]) => `File: ${path}\n\`\`\`\n${code.slice(0, 1200)}\n\`\`\``)
    .join('\n\n');

  const systemPrompt = `You are CodePilot AI Multi-Agent Orchestrator, executing a 4-agent code audit pipeline:
1. Repository Architecture Agent (AST parsing, modularity)
2. Code Quality & Clean Code Agent (Cyclomatic complexity, DRY, SOLID)
3. OWASP Security & Secrets Agent (OWASP Top 10: SQLi, Broken Auth, Secret keys, XSS)
4. Documentation & Rubrics Agent (JSDoc, API contracts)

Target repository: ${repoName}
Target skill level calibration: ${skillLevel}

Analyze the provided source files and output ONLY a valid JSON object matching this schema:
{
  "executiveSummary": "A concise, professional 2-3 sentence audit summary",
  "scores": {
    "overall": 85,
    "quality": 88,
    "security": 80,
    "documentation": 84,
    "reliability": 86
  },
  "findings": [
    {
      "category": "security",
      "agentType": "security",
      "severity": "High",
      "title": "Clear concise vulnerability title",
      "description": "Specific finding description",
      "principleExplanation": "Plain-language explanation of why this matters for software engineering",
      "file": "path/to/file.ts",
      "lineStart": 10,
      "lineEnd": 15,
      "codeSnippet": "code snippet",
      "suggestedFix": "Concrete fix snippet or advice",
      "owaspCategory": "A03:2021 - Injection"
    }
  ]
}`;

  const userPrompt = `Here are the source files for ${repoName}:\n\n${codeSummary || 'No files uploaded; analyze standard Next.js / TypeScript patterns.'}`;

  try {
    const rawJson = await queryGroq(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { jsonMode: true, temperature: 0.1 }
    );

    const parsed = JSON.parse(rawJson);
    return parsed;
  } catch (error) {
    console.error('Groq Multi-Agent scan failed, falling back:', error);
    throw error;
  }
}
