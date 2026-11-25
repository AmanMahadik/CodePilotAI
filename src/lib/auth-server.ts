import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'FRESH_GRADUATE';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  email_verified: boolean;
  institution?: string | null;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'codepilot-jwt-super-secret-key-2026';
const SESSION_COOKIE_NAME = 'codepilot_session';

/**
 * Creates a signed JWT using standard crypto HMAC-SHA256
 */
export function signJwt(payload: UserSessionPayload, expiresInSeconds = 7 * 24 * 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: UserSessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies a JWT token signature and expiration
 */
export function verifyJwt(token: string): UserSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: UserSessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Attaches the session cookie to a NextResponse
 */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600, // 7 days
  });
}

/**
 * Clears the session cookie
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Reads user session from incoming NextRequest
 */
export function getSessionFromRequest(req: NextRequest): UserSessionPayload | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifyJwt(cookie.value);
}

// In-Memory Rate Limiting & Account Lockout
interface AttemptRecord {
  attempts: number;
  lockedUntil: number;
}
const loginAttemptsMap = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkLoginLockout(key: string): { locked: boolean; waitSeconds?: number } {
  const record = loginAttemptsMap.get(key);
  if (!record) return { locked: false };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { locked: true, waitSeconds };
  }

  return { locked: false };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = loginAttemptsMap.get(key) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    record.attempts = 0; // Reset after lockout triggers
  }

  loginAttemptsMap.set(key, record);
}

export function clearFailedAttempts(key: string): void {
  loginAttemptsMap.delete(key);
}

/**
 * Evaluates faculty email institutional validity.
 * Allowed educational domains or user-configured ALLOWED_FACULTY_DOMAINS.
 */
export function checkFacultyEmailDomain(email: string): { isInstitutional: boolean; domain: string } {
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return { isInstitutional: false, domain: '' };

  const domain = parts[1];

  // Explicit non-institutional public providers
  const publicMailProviders = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
    'icloud.com', 'proton.me', 'protonmail.com', 'aol.com', 'mail.com'
  ];
  if (publicMailProviders.includes(domain)) {
    return { isInstitutional: false, domain };
  }

  // Configured allowed domains from env
  const envDomains = (process.env.ALLOWED_FACULTY_DOMAINS || '')
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean);

  if (envDomains.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`))) {
    return { isInstitutional: true, domain };
  }

  // Academic TLDs / suffixes
  const academicSuffixes = ['.edu', '.ac.in', '.edu.in', '.ac.uk', '.edu.au', '.ac.jp', '.edu.sg'];
  const hasAcademicSuffix = academicSuffixes.some(suffix => domain.endsWith(suffix));

  return { isInstitutional: hasAcademicSuffix, domain };
}
