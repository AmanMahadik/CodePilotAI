import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/crypto';
import { 
  signJwt, 
  setSessionCookie, 
  checkLoginLockout, 
  recordFailedAttempt, 
  clearFailedAttempts,
  getServerSupabaseClient,
  UserSessionPayload 
} from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

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
    const serverSupabase = getServerSupabaseClient();
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
      const { data, error: lookupError } = await serverSupabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (lookupError) {
        console.warn('DB users lookup notice:', lookupError.message);
      }
      userRecord = data;
    } catch (dbErr) {
      console.warn('DB lookup warning:', dbErr);
    }

    // 3. Fallback to Supabase Auth if user record wasn't found in public.users
    if (!userRecord || !userRecord.password_hash) {
      let supaErrorMessage = '';
      try {
        const { data: supaAuth, error: supaErr } = await serverSupabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (supaErr) {
          supaErrorMessage = supaErr.message || '';
        }

        if (!supaErr && supaAuth.user) {
          clearFailedAttempts(rateLimitKey);
          const rawRole = String(supaAuth.user.user_metadata?.role || 'STUDENT').toUpperCase();
          const role = (rawRole === 'FACULTY' || rawRole === 'ADMIN' ? rawRole : 'STUDENT') as UserSessionPayload['role'];
          const status = (String(supaAuth.user.user_metadata?.status || 'ACTIVE').toUpperCase()) as UserSessionPayload['status'];

          const sessionPayload: UserSessionPayload = {
            id: supaAuth.user.id,
            email: supaAuth.user.email || cleanEmail,
            name: supaAuth.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role,
            status,
            email_verified: Boolean(supaAuth.user.email_confirmed_at),
            institution: supaAuth.user.user_metadata?.institution || null,
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
        // Fall through to structured error
      }

      if (supaErrorMessage.toLowerCase().includes('email not confirmed')) {
        return NextResponse.json(
          { error: 'Email not confirmed yet. Please check your inbox for the verification email before signing in.' },
          { status: 401 }
        );
      }

      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password. New faculty evaluators must register via "Register as Faculty" first.' },
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
