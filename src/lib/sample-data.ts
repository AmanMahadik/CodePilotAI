import { Repository, Review, NotificationItem } from './types';

// Initial repository for Society_Sync (Aman Mahadik)
export const INITIAL_REPOSITORIES: Repository[] = [
  {
    id: 'repo-society-sync',
    name: 'Society_Sync',
    owner: 'amanmahadik',
    source: 'github',
    branch: 'main',
    url: 'https://github.com/amanmahadik/Society_Sync',
    primaryLanguage: 'TypeScript',
    languageDistribution: { TypeScript: 68, JavaScript: 18, CSS: 14 },
    lastReviewedAt: '2026-11-17T14:30:00Z',
    reviewCount: 1,
    latestScore: 80,
    totalFiles: 34,
    totalLOC: 4120,
    exclusionRules: ['node_modules', '.next', 'dist'],
    createdAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'repo-codepilot',
    name: 'CodePilot_AI',
    owner: 'amanmahadik',
    source: 'github',
    branch: 'main',
    url: 'https://github.com/amanmahadik/CodePilot_AI',
    primaryLanguage: 'TypeScript',
    languageDistribution: { TypeScript: 82, Python: 12, CSS: 6 },
    lastReviewedAt: '2026-11-17T15:00:00Z',
    reviewCount: 2,
    latestScore: 92,
    totalFiles: 52,
    totalLOC: 6840,
    exclusionRules: ['node_modules', '.next', 'dist'],
    createdAt: '2026-11-12T08:00:00Z',
  }
];

// Rich initial reviews for immediate inspection in reports and audit pages
export const INITIAL_REVIEWS: Record<string, Review> = {
  'rev-1': {
    id: 'rev-1',
    repositoryId: 'repo-society-sync',
    repositoryName: 'Society_Sync',
    branch: 'main',
    createdAt: '2026-11-17T14:30:00Z',
    status: 'completed',
    skillLevel: 'intermediate',
    scores: {
      overall: 80,
      quality: 84,
      security: 76,
      documentation: 82,
      reliability: 78,
    },
    executiveSummary:
      'Autonomous multi-agent code analysis completed across 34 source files (4,120 LOC) in Society_Sync. Overall architectural integrity scored 80/100 with 1 high-priority OWASP defect detected: an unparameterized database query in the resident authentication route that could permit SQL injection if unmitigated. Code structure exhibits solid modularity with clean component separation.',
    totalFilesAnalyzed: 34,
    totalLinesOfCode: 4120,
    durationSeconds: 14,
    agents: [
      {
        agentType: 'repository',
        name: 'Repository AST Agent',
        description: 'Parses codebase syntax trees and dependencies',
        status: 'completed',
        progressPercent: 100,
        durationMs: 2400,
        findingsCount: 0,
        details: 'Extracted 34 files, indexed module dependencies, zero circular imports.',
      },
      {
        agentType: 'quality',
        name: 'Code Quality & Maintainability Agent',
        description: 'Calculates cyclomatic complexity and code smells',
        status: 'completed',
        progressPercent: 100,
        durationMs: 3800,
        findingsCount: 1,
        details: 'Identified 1 Medium maintainability warning in state management.',
      },
      {
        agentType: 'security',
        name: 'OWASP Security & Vulnerability Agent',
        description: 'Scans for CVEs, injection vectors, and hardcoded secrets',
        status: 'completed',
        progressPercent: 100,
        durationMs: 4200,
        findingsCount: 1,
        details: 'Flagged 1 High security risk: potential SQL injection in query builder.',
      },
      {
        agentType: 'documentation',
        name: 'Documentation & Rubric Agent',
        description: 'Evaluates inline JSDoc and API coverage',
        status: 'completed',
        progressPercent: 100,
        durationMs: 3600,
        findingsCount: 0,
        details: '82% of exported modules and API contracts contain documentation.',
      },
    ],
    findings: [
      {
        id: 'f-sec-01',
        reviewId: 'rev-1',
        agentType: 'security',
        category: 'security',
        severity: 'High',
        title: 'Unparameterized SQL Query in Resident Lookup Handler',
        description:
          'Dynamic string interpolation is utilized directly inside the resident lookup query, creating an injection vector where untrusted user input can alter SQL execution.',
        principleExplanation:
          'Dynamic SQL query concatenation exposes the backend database to arbitrary command injection (OWASP A03:2021). Parameterized queries or prepared statements must always be used.',
        file: 'src/server/routes/residents.ts',
        lineStart: 42,
        lineEnd: 46,
        codeSnippet: 'const resident = await db.query(`SELECT * FROM residents WHERE email = \'${req.body.email}\'`);',
        suggestedFix:
          'const resident = await db.query(\'SELECT * FROM residents WHERE email = $1\', [req.body.email]);',
        owaspCategory: 'A03:2021 - Injection',
      },
      {
        id: 'f-qual-01',
        reviewId: 'rev-1',
        agentType: 'quality',
        category: 'code-quality',
        severity: 'Medium',
        title: 'High Cyclomatic Complexity in Society Notice Dispatcher',
        description:
          'Notice dispatch handler contains 9 nested conditional branches, increasing maintenance overhead and the risk of regression during notifications broadcast.',
        principleExplanation:
          'High cyclomatic complexity reduces testability and readability. Refactor conditional logic using polymorphism or early returns.',
        file: 'src/services/noticeService.ts',
        lineStart: 88,
        lineEnd: 112,
        codeSnippet: 'if (type === "EMERGENCY") { if (hasSms) { ... } else if (hasEmail) { ... } }',
        suggestedFix: 'Extract separate strategy handlers for EMERGENCY, GENERAL, and MAINTENANCE notice channels.',
      },
    ],
    institutionBranding: {
      enabled: true,
      institutionName: 'Department of Computer Science & Engineering',
      department: 'Software Engineering Laboratory',
      batch: 'Active Cohort (2026)',
      studentName: 'Aman Mahadik',
      rollNo: 'DEV-001',
    },
  },
};

// Initial notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Audit Report Generated',
    message: 'Institutional report for Society_Sync (main) is ready with score 80/100.',
    timestamp: '10m ago',
    read: false,
    type: 'review_completed',
    link: '/report/rev-1',
  },
];
