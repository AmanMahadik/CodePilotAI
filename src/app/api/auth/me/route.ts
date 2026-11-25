import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    // Also check Supabase client session if available
    try {
      const { data: supa } = await supabase.auth.getUser();
      if (supa.user) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: supa.user.id,
            email: supa.user.email,
            name: supa.user.user_metadata?.full_name || supa.user.email?.split('@')[0],
            role: supa.user.user_metadata?.role || 'STUDENT',
            status: supa.user.user_metadata?.status || 'ACTIVE',
            email_verified: true,
          },
        });
      }
    } catch {
      // Unauthenticated
    }
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session,
  });
}
