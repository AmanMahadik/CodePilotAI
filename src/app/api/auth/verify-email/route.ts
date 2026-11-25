import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const appUrl =
    req.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=invalid_verification_token`);
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ email_verified: true, verification_token: null })
      .eq('verification_token', token)
      .select('email')
      .maybeSingle();

    if (error || !user) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=verification_token_expired`);
    }

    return NextResponse.redirect(`${appUrl}/auth/login?verified=true&email=${encodeURIComponent(user.email)}`);
  } catch {
    return NextResponse.redirect(`${appUrl}/auth/login?error=verification_failed`);
  }
}
