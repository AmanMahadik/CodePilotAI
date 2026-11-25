import crypto from 'crypto';
import { Review } from './types';
import { ReportConfig } from './report-utils';

export interface StoredReportSnapshot {
  review: Review;
  config: ReportConfig;
  sha256Hash: string;
  generatedAtUtc: string;
  revoked?: boolean;
  expiresAt?: string | null;
}

// Server memory cache for current runtime + stateless HMAC verification tokens
const snapshotCache = new Map<string, StoredReportSnapshot>();

function getSigningKey(): string {
  return process.env.JWT_SECRET || process.env.TOKEN_ENCRYPTION_KEY || 'codepilot-report-signing-dev-key';
}

export function saveReportSnapshot(id: string, snapshot: StoredReportSnapshot): void {
  snapshotCache.set(id, snapshot);
}

export function getReportSnapshot(id: string): StoredReportSnapshot | undefined {
  return snapshotCache.get(id);
}

export function revokeReportSnapshot(id: string): void {
  const existing = snapshotCache.get(id);
  if (existing) {
    existing.revoked = true;
    snapshotCache.set(id, existing);
  }
}

export interface SignedVerificationClaims {
  id: string;
  repo: string;
  branch: string;
  score: number;
  findingsCount: number;
  candidateName: string;
  referenceId: string;
  sha256: string;
  generatedAt: string;
  exp?: number | null;
}

export function signVerificationToken(claims: SignedVerificationClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSigningKey()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyVerificationToken(token: string): {
  valid: boolean;
  expired?: boolean;
  claims?: SignedVerificationClaims;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    const [payload, sig] = parts;
    const expected = crypto.createHmac('sha256', getSigningKey()).update(payload).digest('base64url');
    if (sig !== expected) return { valid: false };

    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SignedVerificationClaims;
    if (claims.exp && Date.now() > claims.exp) {
      return { valid: false, expired: true, claims };
    }
    return { valid: true, claims };
  } catch {
    return { valid: false };
  }
}
