import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/documentation',
  '/terms',
  '/privacy',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next internals, static files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // e.g., /logo.png, /favicon.ico, fonts
  ) {
    return NextResponse.next();
  }

  // Allow public auth/docs routes and read-only report verify/print routes
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    /^\/report\/[^/]+\/(verify|print)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for active session cookies (custom JWT or Supabase SSR auth cookie)
  const hasSession = req.cookies.getAll().some(
    (c) =>
      c.name === 'codepilot_session' ||
      c.name.startsWith('codepilot-auth-token') ||
      (c.name.startsWith('sb-') && c.name.includes('-auth-token'))
  );

  // Enforce login-first workflow for root and all protected app pages
  if (!hasSession) {
    const loginUrl = new URL('/auth/login', req.url);
    if (pathname !== '/' && pathname !== '/dashboard') {
      loginUrl.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
