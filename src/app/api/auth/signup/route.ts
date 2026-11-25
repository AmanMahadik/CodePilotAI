import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';
import { 
  signJwt, 
  setSessionCookie, 
  checkFacultyEmailDomain, 
  getServerSupabaseClient,
  UserSessionPayload 
} from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'STUDENT', institution } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Full name must be at least 2 characters long' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole: 'STUDENT' | 'FACULTY' = role === 'FACULTY' ? 'FACULTY' : 'STUDENT';

    // 2. Faculty email validation
    let initialStatus: 'ACTIVE' | 'PENDING_APPROVAL' = 'ACTIVE';
    if (cleanRole === 'FACULTY') {
      const { isInstitutional } = checkFacultyEmailDomain(cleanEmail);
      if (!isInstitutional) {
        // Non-institutional faculty emails require administrative approval
        initialStatus = 'PENDING_APPROVAL';
      }
    }

    // 3. Hash Password securely
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // 4. Check if user already exists in DB
    const serverSupabase = getServerSupabaseClient();
    try {
      const { data: existingUser } = await serverSupabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in.' },
          { status: 409 }
        );
      }
    } catch (dbErr) {
      console.warn('DB check warning (proceeding):', dbErr);
    }

    // 5. Store user record in Supabase public.users database
    const userRecord = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      role: cleanRole,
      status: initialStatus,
      institution: institution?.trim() || null,
      email_verified: cleanRole === 'STUDENT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let dbInsertError: string | null = null;
    try {
      const { error: insertError } = await serverSupabase.from('users').insert([userRecord]);
      if (insertError) {
        dbInsertError = insertError.message;
        console.warn('Supabase public.users insert warning:', insertError.message);
      }
    } catch (insertErr) {
      dbInsertError = (insertErr as Error).message;
      console.warn('Supabase users insert warning:', insertErr);
    }

    // 6. Also register in Supabase Auth (appears in Supabase Authentication -> Users)
    let authUserId = userId;
    let authSignupError: string | null = null;
    let emailConfirmationRequired = false;
    try {
      const { data: signUpData, error: supaSignUpErr } = await serverSupabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            role: cleanRole,
            status: initialStatus,
            institution: institution?.trim() || null,
          },
        },
      });
      if (supaSignUpErr) {
        authSignupError = supaSignUpErr.message;
        console.warn('Supabase auth.signUp warning:', supaSignUpErr.message);
      } else if (signUpData?.user) {
        authUserId = signUpData.user.id;
        // If DB insert failed AND Supabase Auth requires email confirmation, inform the client
        if (dbInsertError && !signUpData.session) {
          emailConfirmationRequired = true;
        }
      }
    } catch (authErr) {
      authSignupError = (authErr as Error).message;
    }

    if (authSignupError?.toLowerCase().includes('already registered')) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Never pretend registration succeeded if BOTH public.users and Supabase Auth failed
    if (dbInsertError && authSignupError) {
      return NextResponse.json(
        { error: `Could not create account: ${authSignupError}` },
        { status: 400 }
      );
    }

    // 7. Build Session Payload
    const sessionPayload: UserSessionPayload = {
      id: authUserId,
      email: cleanEmail,
      name: name.trim(),
      role: cleanRole,
      status: initialStatus,
      email_verified: !emailConfirmationRequired,
      institution: institution?.trim() || null,
    };

    const token = signJwt(sessionPayload);
    const response = NextResponse.json({
      success: true,
      emailConfirmationRequired,
      user: {
        id: authUserId,
        email: cleanEmail,
        name: name.trim(),
        role: cleanRole,
        status: initialStatus,
        email_verified: !emailConfirmationRequired,
      },
      message: initialStatus === 'PENDING_APPROVAL' 
        ? 'Account created. Pending institutional domain approval by platform administrators.'
        : emailConfirmationRequired
        ? 'Account created! Please check your email inbox to confirm your address before signing in.'
        : 'Registration successful.',
    });

    if (!emailConfirmationRequired) {
      setSessionCookie(response, token);
    }
    return response;
  } catch (err: unknown) {
    console.error('Sign-up error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
