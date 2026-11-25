import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';
import { 
  signJwt, 
  setSessionCookie, 
  checkFacultyEmailDomain, 
  UserSessionPayload 
} from '@/lib/auth-server';
import { supabase } from '@/lib/supabase/client';

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
    try {
      const { data: existingUser } = await supabase
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

    // 5. Store user record in Supabase database
    const userRecord = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      role: cleanRole,
      status: initialStatus,
      institution: institution?.trim() || null,
      email_verified: cleanRole === 'STUDENT', // Instant for students, verification flow for faculty
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('users').insert([userRecord]);
    } catch (insertErr) {
      console.warn('Supabase users insert warning:', insertErr);
    }

    // Also register in Supabase Auth if applicable
    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            role: cleanRole,
            status: initialStatus,
          },
        },
      });
    } catch {
      // Supabase auth is optional background sync
    }

    // 6. Build Session Payload
    const sessionPayload: UserSessionPayload = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      role: cleanRole,
      status: initialStatus,
      email_verified: cleanRole === 'STUDENT',
      institution: institution?.trim() || null,
    };

    const token = signJwt(sessionPayload);
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: cleanRole,
        status: initialStatus,
        email_verified: cleanRole === 'STUDENT',
      },
      message: initialStatus === 'PENDING_APPROVAL' 
        ? 'Account created. Pending institutional domain approval by platform administrators.'
        : 'Registration successful.',
    });

    setSessionCookie(response, token);
    return response;
  } catch (err: unknown) {
    console.error('Sign-up error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
