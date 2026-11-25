import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth-server';
import { decryptToken } from '@/lib/crypto';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    
    // Check Supabase auth as fallback if no custom cookie
    let userId = session?.id;
    if (!userId) {
      const { data: supaAuth } = await supabase.auth.getUser();
      userId = supaAuth.user?.id;
    }

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        githubLinked: false,
        repos: [],
      });
    }

    // Look for linked GitHub OAuth account
    let token: string | null = null;
    try {
      const { data: oauth } = await supabase
        .from('oauth_accounts')
        .select('access_token_encrypted')
        .eq('user_id', userId)
        .eq('provider', 'github')
        .maybeSingle();

      if (oauth?.access_token_encrypted) {
        token = decryptToken(oauth.access_token_encrypted);
      }
    } catch (e) {
      console.warn('OAuth query warning in /api/repositories:', e);
    }

    if (!token) {
      // Check if user has provider_token in Supabase session
      const { data: supaSession } = await supabase.auth.getSession();
      if (supaSession.session?.provider_token) {
        token = supaSession.session.provider_token;
      }
    }

    if (!token) {
      return NextResponse.json({
        authenticated: true,
        githubLinked: false,
        repos: [],
        message: 'No GitHub account linked on server.',
      });
    }

    // Fetch repositories using the decrypted token
    const ghRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&type=all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodePilot-AI',
      },
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      console.warn('GitHub API fetch failed:', ghRes.status, errText);
      return NextResponse.json({
        authenticated: true,
        githubLinked: true,
        tokenValid: false,
        repos: [],
        error: 'GitHub token expired or unauthorized. Please re-link your GitHub account.',
      });
    }

    const reposData = await ghRes.json();
    return NextResponse.json({
      authenticated: true,
      githubLinked: true,
      tokenValid: true,
      repos: reposData,
    });
  } catch (err: unknown) {
    console.error('Error in /api/repositories:', err);
    return NextResponse.json({
      authenticated: false,
      githubLinked: false,
      repos: [],
      error: 'Failed to fetch repositories',
    }, { status: 500 });
  }
}
