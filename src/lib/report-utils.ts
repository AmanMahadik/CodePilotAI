import { Finding, Review, Severity } from './types';

export interface ReportConfig {
  includeInstitutionalHeader: boolean;
  institution: string;
  department: string;
  candidateName: string;
  rollNumber: string;
  batch: string;
  referenceId: string;
  logoDataUrl?: string;
  commitHash?: string;
  repositoryUrl?: string;
}

const DISALLOWED_PLACEHOLDERS = new Set([
  'candidate developer',
  'candidate author',
  'engineering candidate',
  'engineering developer',
  'student developer',
  'rev-1',
  'dev-001',
  'stu-001',
  'n/a',
  'unknown',
  'tbd',
]);

export function isPlaceholderValue(val?: string | null): boolean {
  if (!val) return true;
  const normalized = val.trim().toLowerCase();
  if (!normalized) return true;
  return DISALLOWED_PLACEHOLDERS.has(normalized);
}

export interface ValidationIssue {
  field: keyof ReportConfig;
  label: string;
  message: string;
}

export function validateReportConfig(config: ReportConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (isPlaceholderValue(config.candidateName)) {
    issues.push({
      field: 'candidateName',
      label: 'Author / Candidate Name',
      message: 'Enter the real author or candidate full name (no placeholder text).',
    });
  }

  if (isPlaceholderValue(config.referenceId)) {
    issues.push({
      field: 'referenceId',
      label: 'Report / Reference ID',
      message: 'Provide a valid non-placeholder report identifier.',
    });
  }

  if (isPlaceholderValue(config.rollNumber)) {
    issues.push({
      field: 'rollNumber',
      label: 'Roll / PRN Number',
      message: 'Enter the candidate Roll Number, PRN, or Employee ID.',
    });
  }

  if (config.includeInstitutionalHeader) {
    if (isPlaceholderValue(config.institution)) {
      issues.push({
        field: 'institution',
        label: 'Institution Name',
        message: 'Institution name is required when institutional header is enabled.',
      });
    }
    if (isPlaceholderValue(config.department)) {
      issues.push({
        field: 'department',
        label: 'Department',
        message: 'Department name is required when institutional header is enabled.',
      });
    }
  }

  return issues;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Informational: 4,
};

export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );
}

export function getGradeVerdict(overallScore: number, criticalCount: number): {
  grade: string;
  verdict: string;
} {
  if (overallScore >= 90 && criticalCount === 0) {
    return {
      grade: 'A+',
      verdict: 'Production-Ready — High architectural integrity with zero critical vulnerabilities.',
    };
  }
  if (overallScore >= 80 && criticalCount === 0) {
    return {
      grade: 'A',
      verdict: 'Verified Pass — Strong code quality with minor remediations recommended.',
    };
  }
  if (overallScore >= 70) {
    return {
      grade: 'B',
      verdict: 'Conditional Pass — Functional implementation requiring targeted security/quality fixes.',
    };
  }
  if (overallScore >= 55) {
    return {
      grade: 'C',
      verdict: 'Needs Remediation — Significant technical debt or security defects detected.',
    };
  }
  return {
    grade: 'D',
    verdict: 'Remediation Required — Critical security or stability issues block certification.',
  };
}

export function buildPdfFilename(projectName: string, createdAt?: string): string {
  const safeProject = (projectName || 'Project')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Project';
  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const yyyy = dateObj.getUTCFullYear();
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getUTCDate()).padStart(2, '0');
  return `CodePilot_Review_${safeProject}_${yyyy}-${mm}-${dd}.pdf`;
}

export function canonicalReportPayload(review: Review, config: ReportConfig): string {
  return JSON.stringify({
    id: review.id,
    repositoryName: review.repositoryName,
    branch: review.branch,
    createdAt: review.createdAt,
    scores: review.scores,
    findingsCount: review.findings?.length || 0,
    findingsIds: (review.findings || []).map((f) => `${f.id}:${f.severity}:${f.file}:${f.lineStart}`),
    candidateName: config.candidateName.trim(),
    rollNumber: config.rollNumber.trim(),
    referenceId: config.referenceId.trim(),
    institution: config.includeInstitutionalHeader ? config.institution.trim() : '',
    department: config.includeInstitutionalHeader ? config.department.trim() : '',
  });
}

/**
 * Computes a SHA-256 hex digest in both browser (SubtleCrypto) and Node.js.
 */
export async function computeReportSha256(review: Review, config: ReportConfig): Promise<string> {
  const payload = canonicalReportPayload(review, config);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(payload);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Node.js fallback
  const nodeCrypto = await import('crypto');
  return nodeCrypto.createHash('sha256').update(payload).digest('hex');
}
