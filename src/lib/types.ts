export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type AgentType = 'repository' | 'quality' | 'security' | 'documentation';

export interface Finding {
  id: string;
  reviewId: string;
  agentType: AgentType;
  category: 'code-quality' | 'security' | 'bug' | 'documentation' | 'performance' | 'architecture';
  severity: Severity;
  title: string;
  description: string;
  principleExplanation: string; // Plain-language explanation of why this matters (FR-073)
  file: string;
  lineStart: number;
  lineEnd: number;
  codeSnippet: string;
  suggestedFix?: string; // Example fix or fix direction (FR-172)
  diff?: {
    original: string;
    modified: string;
  };
  owaspCategory?: string; // e.g. "A03:2021 - Injection", "A01:2021 - Broken Access Control" (FR-191)
  cveId?: string; // Dependency vulnerability tag (FR-193)
  secretsPattern?: string; // Credentials/API key flag (FR-192)
}

export interface AgentExecutionStatus {
  agentType: AgentType;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progressPercent: number;
  durationMs: number;
  findingsCount: number;
  details: string;
}

export interface ReviewScoreBreakdown {
  overall: number; // 0 - 100
  quality: number; // 0 - 100
  security: number; // 0 - 100
  documentation: number; // 0 - 100
  reliability: number; // 0 - 100
}

export interface Review {
  id: string;
  repositoryId: string;
  repositoryName: string;
  branch: string;
  createdAt: string;
  status: 'analyzing' | 'completed' | 'failed';
  skillLevel: SkillLevel;
  scores: ReviewScoreBreakdown;
  executiveSummary: string;
  totalFilesAnalyzed: number;
  totalLinesOfCode: number;
  durationSeconds: number;
  agents: AgentExecutionStatus[];
  findings: Finding[];
  readmeDraft?: string; // Auto-drafted README (FR-151)
  inlineDocSuggestions?: Array<{
    file: string;
    functionName: string;
    line: number;
    suggestedDoc: string;
  }>;
  shareToken?: string;
  institutionBranding?: {
    enabled: boolean;
    institutionName: string;
    department?: string;
    batch?: string;
    studentName?: string;
    rollNo?: string;
  };
  files?: Record<string, string>; // Path -> Content map for RAG indexing
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  source: 'github' | 'upload_zip' | 'sample';
  branch: string;
  url?: string;
  primaryLanguage: string;
  languageDistribution: Record<string, number>; // e.g. { TypeScript: 64, Python: 22, HTML: 14 }
  lastReviewedAt?: string;
  reviewCount: number;
  latestScore?: number;
  totalFiles: number;
  totalLOC: number;
  exclusionRules: string[];
  createdAt: string;
  files?: Record<string, string>; // Path -> Content map
}

export interface ChatCitation {
  file: string;
  lineRange: string;
  codeSnippet?: string;
}

export interface ChatMessage {
  id: string;
  repositoryId: string;
  reviewId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  anchoredFindingId?: string; // FR-122 Finding Follow-up
  citations?: ChatCitation[]; // FR-124 Source citation
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'review_completed' | 'security_alert' | 'system';
  link?: string;
}
