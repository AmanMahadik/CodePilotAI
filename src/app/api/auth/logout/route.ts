import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase/client';

export async function POST() {
  try {
    await supabase.auth.signOut().catch(() => {});
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    clearSessionCookie(response);
    return response;
  } catch (err: unknown) {
    console.error('Logout error:', err);
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  }
}
