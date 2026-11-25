import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/crypto';
import { 
  signJwt, 
  setSessionCookie, 
  checkLoginLockout, 
  recordFailedAttempt, 
  clearFailedAttempts,
  UserSessionPayload 
} from '@/lib/auth-server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    const rateLimitKey = `${cleanEmail}_${ip}`;

    // 1. Check rate limit & lockout
    const lockout = checkLoginLockout(rateLimitKey);
    if (lockout.locked) {
      return NextResponse.json(
        { 
          error: `Too many failed attempts. Account temporarily locked for security. Try again in ${Math.ceil((lockout.waitSeconds || 60) / 60)} minute(s).` 
        },
        { status: 429 }
      );
    }

    // 2. Query user from DB
    let userRecord: {
      id: string;
      name: string;
      email: string;
      password_hash: string | null;
      role: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'FRESH_GRADUATE';
      status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
      email_verified: boolean;
      institution?: string | null;
    } | null = null;

    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      userRecord = data;
    } catch (dbErr) {
      console.warn('DB lookup warning:', dbErr);
    }

    // 3. Fallback to Supabase auth client if user record wasn't found in public.users
    if (!userRecord || !userRecord.password_hash) {
      try {
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!supaErr && supaAuth.user) {
          clearFailedAttempts(rateLimitKey);
          const role = (supaAuth.user.user_metadata?.role || 'STUDENT') as UserSessionPayload['role'];
          const status = (supaAuth.user.user_metadata?.status || 'ACTIVE') as UserSessionPayload['status'];

          const sessionPayload: UserSessionPayload = {
            id: supaAuth.user.id,
            email: supaAuth.user.email || cleanEmail,
            name: supaAuth.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role,
            status,
            email_verified: true,
          };

          const token = signJwt(sessionPayload);
          const response = NextResponse.json({
            success: true,
            user: sessionPayload,
          });
          setSessionCookie(response, token);
          return response;
        }
      } catch {
        // Fall through to generic error
      }

      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4. Verify password hash
    const isValid = await verifyPassword(password, userRecord.password_hash);
    if (!isValid) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 5. Check if suspended
    if (userRecord.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // 6. Login successful -> Clear failure counter and issue JWT
    clearFailedAttempts(rateLimitKey);

    const sessionPayload: UserSessionPayload = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      status: userRecord.status,
      email_verified: userRecord.email_verified,
      institution: userRecord.institution,
    };

    const token = signJwt(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    setSessionCookie(response, token);
    return response;
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
