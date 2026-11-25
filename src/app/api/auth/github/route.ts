import { NextRequest, NextResponse } from 'next/server';
import { generateRandomState } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const linkMode = searchParams.get('link') === 'true';
  const next = searchParams.get('next') || '/dashboard';

  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl =
    req.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${appUrl}/api/auth/github/callback`;

  // If GITHUB_CLIENT_ID is not configured directly on the server, redirect to client login
  if (!clientId) {
    return NextResponse.redirect(`${appUrl}/auth/login`);
  }

  // Generate random state for CSRF protection
  const state = generateRandomState(32);
  const statePayload = JSON.stringify({ state, linkMode, next });
  const encodedState = Buffer.from(statePayload).toString('base64url');

  // Scopes requested: read:user, user:email, and repo for code review
  // prompt=select_account ensures GitHub always displays the account chooser instead of auto-signing in
  const scopes = encodeURIComponent('read:user user:email repo');
  const loginHint = searchParams.get('login')?.trim().replace(/^@/, '');
  const loginParam = loginHint ? `&login=${encodeURIComponent(loginHint)}` : '';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${encodedState}&prompt=select_account${loginParam}`;

  const response = NextResponse.redirect(githubAuthUrl);
  response.cookies.set({
    name: 'codepilot_oauth_state',
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return response;
}
