import { Repository, Review, NotificationItem } from './types';

export const INITIAL_REPOSITORIES: Repository[] = [
  {
    id: 'repo-1',
    name: 'ecommerce-microservices',
    owner: 'developer',
    source: 'github',
    branch: 'main',
    url: 'https://github.com/developer/ecommerce-microservices',
    primaryLanguage: 'TypeScript',
    languageDistribution: {
      TypeScript: 68,
      JavaScript: 18,
      SQL: 10,
      CSS: 4,
    },
    lastReviewedAt: '2026-11-02T16:45:00Z',
    reviewCount: 3,
    latestScore: 82,
    totalFiles: 38,
    totalLOC: 4280,
    exclusionRules: ['node_modules', '.next', 'dist', '*.log'],
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'repo-2',
    name: 'secure-vault-api',
    owner: 'developer',
    source: 'github',
    branch: 'develop',
    url: 'https://github.com/developer/secure-vault-api',
    primaryLanguage: 'TypeScript',
    languageDistribution: {
      TypeScript: 84,
      JSON: 12,
      Docker: 4,
    },
    lastReviewedAt: '2026-11-01T09:15:00Z',
    reviewCount: 2,
    latestScore: 68,
    totalFiles: 24,
    totalLOC: 2750,
    exclusionRules: ['node_modules', 'coverage', '.env'],
    createdAt: '2026-10-22T14:30:00Z',
  },
  {
    id: 'repo-3',
    name: 'student-algorithms-py',
    owner: 'developer',
    source: 'upload_zip',
    branch: 'main',
    primaryLanguage: 'Python',
    languageDistribution: {
      Python: 92,
      Markdown: 8,
    },
    lastReviewedAt: '2026-10-28T18:20:00Z',
    reviewCount: 1,
    latestScore: 94,
    totalFiles: 15,
    totalLOC: 1420,
    exclusionRules: ['__pycache__', '.pytest_cache', '*.pyc'],
    createdAt: '2026-10-28T18:00:00Z',
  },
];

export const INITIAL_REVIEWS: Record<string, Review> = {
  'rev-1': {
    id: 'rev-1',
    repositoryId: 'repo-1',
    repositoryName: 'ecommerce-microservices',
    branch: 'main',
    createdAt: '2026-11-02T16:45:00Z',
    status: 'completed',
    skillLevel: 'intermediate',
    durationSeconds: 44,
    totalFilesAnalyzed: 38,
    totalLinesOfCode: 4280,
    shareToken: 'cp-share-8f2a1b9c',
    institutionBranding: {
      enabled: true,
      institutionName: 'University Department of Computer Engineering',
      department: 'School of Computer Science',
      batch: 'Batch 2026',
      studentName: 'Candidate Developer',
      rollNo: 'DEV-2026-001',
    },
    scores: {
      overall: 82,
      quality: 85,
      security: 74,
      documentation: 80,
      reliability: 89,
    },
    executiveSummary:
      'CodePilot AI completed an end-to-end review of ecommerce-microservices across 38 files. The codebase demonstrates clear modular architecture with TypeScript and strong database abstraction. However, the Security Agent detected a high-risk unescaped raw SQL query susceptible to injection, along with hardcoded fallback JWT secrets in the auth handler. Code quality is generally idiomatic with good separation of concerns, and documentation coverage is moderate (README drafted below).',
    agents: [
      {
        agentType: 'repository',
        name: 'Repository Agent',
        description: 'AST parsing, language breakdown, dependencies graph, and directory hygiene',
        status: 'completed',
        progressPercent: 100,
        durationMs: 8200,
        findingsCount: 1,
        details: 'Analyzed 38 files. Detected TypeScript/Node.js stack with Prisma ORM and Express router.',
      },
      {
        agentType: 'quality',
        name: 'Review & Quality Agent',
        description: 'Linting patterns, SOLID principles, cyclomatic complexity, DRY violations, idiomatic style',
        status: 'completed',
        progressPercent: 100,
        durationMs: 14600,
        findingsCount: 3,
        details: 'Identified unhandled promise rejections and deep parameter coupling in checkout controller.',
      },
      {
        agentType: 'security',
        name: 'Security Agent',
        description: 'OWASP Top 10 vulnerability mapping, secret leakage detection, and dependency audit',
        status: 'completed',
        progressPercent: 100,
        durationMs: 12400,
        findingsCount: 3,
        details: 'Flagged 1 Critical credential leak risk and 1 High OWASP A03 SQL Injection pattern.',
      },
      {
        agentType: 'documentation',
        name: 'Documentation Agent',
        description: 'README health audit, API surface documentation, and JSDoc/docstring generation',
        status: 'completed',
        progressPercent: 100,
        durationMs: 8800,
        findingsCount: 2,
        details: 'Generated complete production README draft and 4 inline doc suggestions for exported routes.',
      },
    ],
    findings: [
      {
        id: 'find-101',
        reviewId: 'rev-1',
        agentType: 'security',
        category: 'security',
        severity: 'Critical',
        title: 'Hardcoded Fallback JWT Secret in Authentication Middleware',
        description:
          'A default fallback secret string is hardcoded in production token verification when process.env.JWT_SECRET is undefined.',
        principleExplanation:
          'Hardcoded secrets in source control allow anyone with read access to forge valid administrative JWT signatures and impersonate any user. In educational and enterprise environments, production code must fail fast if required secrets are absent rather than falling back to known constants.',
        file: 'src/middleware/auth.ts',
        lineStart: 18,
        lineEnd: 24,
        codeSnippet: `const secret = process.env.JWT_SECRET || "SUPER_SECRET_DEFAULT_KEY_12345";
const decoded = jwt.verify(token, secret);
req.user = decoded;`,
        suggestedFix:
          'Enforce strict environment variable validation at startup and throw an explicit configuration error if JWT_SECRET is unset.',
        diff: {
          original: `const secret = process.env.JWT_SECRET || "SUPER_SECRET_DEFAULT_KEY_12345";\nconst decoded = jwt.verify(token, secret);`,
          modified: `if (!process.env.JWT_SECRET) {\n  throw new Error("FATAL: JWT_SECRET environment variable is missing.");\n}\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);`,
        },
        owaspCategory: 'A02:2021 - Cryptographic Failures',
        secretsPattern: 'Hardcoded Fallback Secret',
      },
      {
        id: 'find-102',
        reviewId: 'rev-1',
        agentType: 'security',
        category: 'security',
        severity: 'High',
        title: 'Unsanitized Raw SQL Query (OWASP A03 SQL Injection)',
        description:
          'User-controlled request query parameter `category` is directly concatenated into a Prisma raw query string.',
        principleExplanation:
          'String concatenation in database queries bypasses query compiler protections, enabling attackers to inject arbitrary SQL statements (e.g., bypassing authentication, extracting entire tables, or executing database procedures). Always use parameterized query placeholders or native ORM finders.',
        file: 'src/controllers/product.controller.ts',
        lineStart: 42,
        lineEnd: 48,
        codeSnippet: `const { category } = req.query;
const products = await prisma.$queryRawUnsafe(
  \`SELECT * FROM products WHERE category = '\${category}' AND is_active = true\`
);`,
        suggestedFix:
          'Replace $queryRawUnsafe with Prisma parameterized query template `$queryRaw` or use the Prisma type-safe query builder `prisma.products.findMany()`.',
        diff: {
          original: `const products = await prisma.$queryRawUnsafe(\n  \`SELECT * FROM products WHERE category = '\${category}' AND is_active = true\`\n);`,
          modified: `const products = await prisma.products.findMany({\n  where: {\n    category: String(category),\n    isActive: true,\n  },\n});`,
        },
        owaspCategory: 'A03:2021 - Injection',
      },
      {
        id: 'find-103',
        reviewId: 'rev-1',
        agentType: 'quality',
        category: 'bug',
        severity: 'High',
        title: 'Unhandled Async Promise Rejection in Order Processing Loop',
        description:
          'Iterating with Array.prototype.forEach() over an async function does not await the asynchronous operations, causing race conditions and unhandled error silences.',
        principleExplanation:
          'Array.prototype.forEach is not promise-aware. When async callbacks are passed into forEach, execution immediately continues to the response without waiting for inventory reservations or payment verification to complete. In Node.js, uncaught rejections can cause silent failures or process crashes.',
        file: 'src/services/order.service.ts',
        lineStart: 89,
        lineEnd: 97,
        codeSnippet: `items.forEach(async (item) => {
  await inventoryService.reserveStock(item.id, item.quantity);
  await auditLogService.recordReservation(orderId, item.id);
});
return { success: true, orderId };`,
        suggestedFix:
          'Use `for (const item of items)` or `await Promise.all(items.map(...))` to guarantee sequential or concurrent resolution before returning.',
        diff: {
          original: `items.forEach(async (item) => {\n  await inventoryService.reserveStock(item.id, item.quantity);\n  await auditLogService.recordReservation(orderId, item.id);\n});\nreturn { success: true, orderId };`,
          modified: `await Promise.all(\n  items.map(async (item) => {\n    await inventoryService.reserveStock(item.id, item.quantity);\n    await auditLogService.recordReservation(orderId, item.id);\n  })\n);\nreturn { success: true, orderId };`,
        },
      },
      {
        id: 'find-104',
        reviewId: 'rev-1',
        agentType: 'quality',
        category: 'code-quality',
        severity: 'Medium',
        title: 'Single Responsibility Principle Violation in UserController',
        description:
          'UserController handles HTTP routing, hashing passwords, generating Stripe payment customer IDs, and formatting welcome email HTML directly.',
        principleExplanation:
          'The Single Responsibility Principle (SRP) states that a class or module should have only one reason to change. Tightly coupling billing and email composition inside an HTTP controller makes unit testing brittle and prevents reusing email templates elsewhere in the project.',
        file: 'src/controllers/user.controller.ts',
        lineStart: 112,
        lineEnd: 135,
        codeSnippet: `// Inside UserController.create
const stripeCustomer = await stripe.customers.create({ email });
const emailHtml = "<html><body>Welcome to Store!</body></html>";
await mailer.sendMail({ to: email, html: emailHtml });`,
        suggestedFix:
          'Extract billing logic into a dedicated BillingService and notification logic into an EmailNotificationService.',
      },
      {
        id: 'find-105',
        reviewId: 'rev-1',
        agentType: 'security',
        category: 'security',
        severity: 'Medium',
        title: 'Known Outdated Dependency with Medium Severity Advisory',
        description:
          'Package `jsonwebtoken@8.5.1` has known validation vulnerability CVE-2022-23529 relating to key verification mishandling.',
        principleExplanation:
          'Third-party libraries are common attack vectors. Regular software composition audits prevent shipping well-documented vulnerabilities that automated scanners can exploit.',
        file: 'package.json',
        lineStart: 28,
        lineEnd: 29,
        codeSnippet: `"jsonwebtoken": "^8.5.1"`,
        suggestedFix: 'Upgrade `jsonwebtoken` to version `^9.0.2` or migrate to standard Web Crypto API with `@jose`.',
        cveId: 'CVE-2022-23529',
        owaspCategory: 'A06:2021 - Vulnerable and Outdated Components',
      },
      {
        id: 'find-106',
        reviewId: 'rev-1',
        agentType: 'documentation',
        category: 'documentation',
        severity: 'Low',
        title: 'Missing JSDoc on Public Payment Gateway Adapter Interface',
        description:
          'The exported `PaymentGatewayAdapter` interface has no documentation on expected exception behaviors or currency normalization contracts.',
        principleExplanation:
          'Public interfaces consumed across team boundaries require explicit docstrings defining input preconditions, idempotency guarantees, and thrown errors so team members integrate without guesswork.',
        file: 'src/adapters/payment.adapter.ts',
        lineStart: 5,
        lineEnd: 15,
        codeSnippet: `export interface PaymentGatewayAdapter {
  processCharge(amount: number, token: string): Promise<ChargeResult>;
  refundCharge(chargeId: string): Promise<boolean>;
}`,
        suggestedFix:
          'Add JSDoc with @param and @throws specifying currency units (cents vs dollars) and error types.',
      },
    ],
    readmeDraft: `# E-Commerce Microservices Engine

An autonomous, modular e-commerce backend built with TypeScript, Node.js, Express, and Prisma ORM.

## Architecture Overview
- **Controllers Layer**: Request routing, schema validation, and HTTP response serialization.
- **Service Domain**: Business rules, inventory reservation, order state machine, and ledger accounting.
- **Data Access**: Prisma ORM with PostgreSQL relational schemas.
- **Security & Middleware**: Role-based access control, JWT verification, and rate limiting.

## Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14
- Docker (optional for local database container)

## Setup & Local Installation
\`\`\`bash
# 1. Clone repository
git clone https://github.com/developer/ecommerce-microservices.git
cd ecommerce-microservices

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT_SECRET

# 4. Run database migrations
npx prisma migrate dev

# 5. Start development server
npm run dev
\`\`\`

## Testing & Quality Audits
\`\`\`bash
npm run test
npm run lint
\`\`\`

---
*Generated automatically by CodePilot AI Documentation Agent.*`,
    inlineDocSuggestions: [
      {
        file: 'src/adapters/payment.adapter.ts',
        functionName: 'processCharge',
        line: 6,
        suggestedDoc: `/**
 * Dispatches an idempotent charge transaction to the configured payment provider.
 * 
 * @param amount - Charge amount represented in lowest currency denominator (e.g. integer cents for USD).
 * @param token - Payment authorization nonce or Stripe customer token.
 * @returns {Promise<ChargeResult>} Result object including provider reference and settlement status.
 * @throws {PaymentDeclinedError} When bank or gateway rejects authorization.
 */`,
      },
      {
        file: 'src/services/order.service.ts',
        functionName: 'reserveStock',
        line: 91,
        suggestedDoc: `/**
 * Atomically decrements available product SKU quantity within an active database transaction.
 * 
 * @param skuId - Unique product SKU identifier.
 * @param quantity - Positive integer count of items to reserve.
 * @throws {InsufficientInventoryError} If current available stock is less than requested quantity.
 */`,
      },
    ],
  },
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Review Completed',
    message: 'Review for ecommerce-microservices (main branch) completed in 44 seconds. Score: 82/100.',
    timestamp: '10 minutes ago',
    read: false,
    type: 'review_completed',
    link: '/review/rev-1',
  },
  {
    id: 'notif-2',
    title: 'Security Alert: Critical Secret',
    message: 'Hardcoded fallback secret identified in src/middleware/auth.ts.',
    timestamp: '15 minutes ago',
    read: false,
    type: 'security_alert',
    link: '/review/rev-1',
  },
  {
    id: 'notif-3',
    title: 'CodePilot AI Ready',
    message: 'Supabase OAuth and multi-agent code analysis pipeline initialized for user session.',
    timestamp: '1 hour ago',
    read: true,
    type: 'system',
  },
];
