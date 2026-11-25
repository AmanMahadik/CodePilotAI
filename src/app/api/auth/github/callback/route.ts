import { NextRequest, NextResponse } from 'next/server';
import { encryptToken } from '@/lib/crypto';
import { signJwt, setSessionCookie, getSessionFromRequest, UserSessionPayload } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const appUrl =
    req.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const code = searchParams.get('code');
  const encodedState = searchParams.get('state');
  const errorParam = searchParams.get('error');

  // Handle user denied access or GitHub error
  if (errorParam) {
    const errorDesc = searchParams.get('error_description') || 'GitHub authorization was denied.';
    return NextResponse.redirect(`${appUrl}/auth/login?error=${encodeURIComponent(errorDesc)}`);
  }

  if (!code || !encodedState) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=missing_oauth_parameters`);
  }

  // 1. Verify CSRF State
  let stateObj: { state: string; linkMode?: boolean; next?: string } | null = null;
  try {
    stateObj = JSON.parse(Buffer.from(encodedState, 'base64url').toString('utf8'));
  } catch {
    return NextResponse.redirect(`${appUrl}/auth/login?error=invalid_state`);
  }

  const storedState = req.cookies.get('codepilot_oauth_state')?.value;
  if (!storedState || storedState !== stateObj?.state) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=csrf_state_mismatch`);
  }

  const linkMode = Boolean(stateObj?.linkMode);
  const nextUrl = stateObj?.next || '/dashboard';

  // 2. Exchange code for access token server-side
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${appUrl}/api/auth/github/callback`;

  if (!clientId || !clientSecret) {
    // If server env secrets are missing, forward to the standard Supabase callback
    return NextResponse.redirect(`${appUrl}/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(nextUrl)}`);
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return NextResponse.redirect(`${appUrl}/auth/login?error=${encodeURIComponent(tokenData.error_description || 'Failed to exchange token with GitHub')}`);
    }

    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope ? tokenData.scope.split(',') : ['read:user', 'user:email'];

    // 3. Fetch GitHub Profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'CodePilot-AI',
      },
    });
    const githubUser = await userRes.json();

    if (!githubUser.id) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=failed_fetching_github_profile`);
    }

    const providerUserId = String(githubUser.id);
    const githubUsername = githubUser.login;
    const githubName = githubUser.name || githubUsername;

    // 4. Fetch Verified Primary Email
    let primaryEmail = githubUser.email;
    let isEmailVerified = false;

    if (!primaryEmail) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'CodePilot-AI',
        },
      });
      const emails = await emailsRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e: { primary: boolean; verified: boolean; email: string }) => e.primary && e.verified) ||
                        emails.find((e: { verified: boolean; email: string }) => e.verified) ||
                        emails[0];
        if (primary) {
          primaryEmail = primary.email;
          isEmailVerified = Boolean(primary.verified);
        }
      }
    } else {
      isEmailVerified = true;
    }

    if (!primaryEmail) {
      primaryEmail = `${githubUsername}@users.noreply.github.com`;
    }

    // 5. Encrypt GitHub Access Token with AES-256-GCM
    const encryptedToken = encryptToken(accessToken);

    // 6. Handle Linking Mode (already logged in with password, linking GitHub from settings)
    const existingSession = getSessionFromRequest(req);
    if (linkMode && existingSession) {
      try {
        await supabase.from('oauth_accounts').upsert({
          user_id: existingSession.id,
          provider: 'github',
          provider_user_id: providerUserId,
          access_token_encrypted: encryptedToken,
          scopes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'provider,provider_user_id' });
      } catch (upsertErr) {
        console.warn('OAuth link upsert warning:', upsertErr);
      }
      return NextResponse.redirect(`${appUrl}/repositories?linked=true`);
    }

    // 7. Check if an oauth_account with this GitHub ID exists
    let existingOAuth: { id: string; user_id: string } | null = null;
    try {
      const { data } = await supabase
        .from('oauth_accounts')
        .select('id, user_id')
        .eq('provider', 'github')
        .eq('provider_user_id', providerUserId)
        .maybeSingle();
      existingOAuth = data;
    } catch (e) {
      console.warn('OAuth query warning:', e);
    }

    let finalUserId: string;
    let userRole: UserSessionPayload['role'] = 'STUDENT';
    let userStatus: UserSessionPayload['status'] = 'ACTIVE';

    if (existingOAuth) {
      // User has logged in with this GitHub account before -> LOG IN
      finalUserId = existingOAuth.user_id;

      // Update encrypted token
      try {
        await supabase.from('oauth_accounts').update({
          access_token_encrypted: encryptedToken,
          scopes,
          updated_at: new Date().toISOString(),
        }).eq('id', existingOAuth.id);

        const { data: userProfile } = await supabase
          .from('users')
          .select('role, status, name')
          .eq('id', finalUserId)
          .maybeSingle();

        if (userProfile) {
          userRole = userProfile.role;
          userStatus = userProfile.status;
        }
      } catch (updateErr) {
        console.warn('OAuth token update warning:', updateErr);
      }
    } else {
      // 8. No OAuth account with this GitHub ID -> Check if email belongs to an existing password user
      let emailUser: { id: string; password_hash: string | null; role: UserSessionPayload['role'] } | null = null;
      try {
        const { data } = await supabase
          .from('users')
          .select('id, password_hash, role')
          .eq('email', primaryEmail.toLowerCase())
          .maybeSingle();
        emailUser = data;
      } catch (e) {
        console.warn('User email query warning:', e);
      }

      if (emailUser && emailUser.password_hash) {
        // Do NOT auto-merge! Require user to log in with their password first, then link from settings
        return NextResponse.redirect(
          `${appUrl}/auth/login?error=${encodeURIComponent(
            'An account with this email already exists with a password. Please sign in with your password, then link your GitHub account in Settings.'
          )}&email=${encodeURIComponent(primaryEmail)}`
        );
      }

      if (emailUser) {
        finalUserId = emailUser.id;
        userRole = emailUser.role;
      } else {
        // Create brand new user
        finalUserId = crypto.randomUUID();
        try {
          await supabase.from('users').insert([{
            id: finalUserId,
            name: githubName,
            email: primaryEmail.toLowerCase(),
            password_hash: null, // OAuth-only user
            role: 'STUDENT',
            status: 'ACTIVE',
            email_verified: isEmailVerified,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
        } catch (insertErr) {
          console.warn('New user insert warning:', insertErr);
        }
      }

      // Create oauth_accounts record
      try {
        await supabase.from('oauth_accounts').insert([{
          user_id: finalUserId,
          provider: 'github',
          provider_user_id: providerUserId,
          access_token_encrypted: encryptedToken,
          scopes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      } catch (oauthInsertErr) {
        console.warn('OAuth account insert warning:', oauthInsertErr);
      }
    }

    // 9. Issue Session JWT and redirect
    const sessionPayload: UserSessionPayload = {
      id: finalUserId,
      email: primaryEmail.toLowerCase(),
      name: githubName,
      role: userRole,
      status: userStatus,
      email_verified: isEmailVerified,
    };

    const sessionJwt = signJwt(sessionPayload);
    const response = NextResponse.redirect(`${appUrl}${nextUrl}`);
    setSessionCookie(response, sessionJwt);

    // Clear state cookie
    response.cookies.delete('codepilot_oauth_state');

    return response;
  } catch (err: unknown) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_processing_failed`);
  }
}
