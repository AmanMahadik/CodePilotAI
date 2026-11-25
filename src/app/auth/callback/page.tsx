'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { fetchStudentGithubRepositories } from '@/lib/github';
import Logo from '@/components/Logo';
import { Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying your GitHub credentials...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionFound, setSessionFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const completeSessionAndRedirect = async (session: Session, nextUrl: string) => {
      if (!isMounted) return;
      setSessionFound(true);
      setStatusMessage('Syncing your GitHub repositories into workspace...');
      
      try {
        if (session?.provider_token) {
          localStorage.setItem('codepilot_gh_token', session.provider_token);
        }
        const ghUser = session.user?.user_metadata?.user_name || 
                       session.user?.user_metadata?.preferred_username ||
                       (session.user?.app_metadata?.provider === 'github' ? session.user?.email?.split('@')[0] : null);
        if (ghUser) {
          localStorage.setItem('codepilot_student_gh_username', ghUser);
        }
        if (session.user?.user_metadata?.full_name) {
          localStorage.setItem('codepilot_student_name', session.user.user_metadata.full_name);
        }
        if (session.user?.user_metadata?.avatar_url) {
          localStorage.setItem('codepilot_student_avatar', session.user.user_metadata.avatar_url);
        }
        await fetchStudentGithubRepositories(session.user, session);
      } catch (e) {
        console.warn('Repository sync error during callback:', e);
      }

      if (isMounted) {
        router.push(nextUrl);
      }
    };

    const processAuth = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard';

      try {
        // 1. Check if Supabase client already established session in background
        const { data: initialData } = await supabase.auth.getSession();
        if (initialData?.session) {
          await completeSessionAndRedirect(initialData.session, next);
          return;
        }

        // 2. Listen to Auth State Changes in case exchange is in flight
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session && isMounted) {
            authListener.subscription.unsubscribe();
            await completeSessionAndRedirect(session, next);
          }
        });

        // 3. If code is present and no session yet, attempt exchange
        if (code) {
          setStatusMessage('Exchanging authorization code for secure session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!error && data?.session) {
            authListener.subscription.unsubscribe();
            await completeSessionAndRedirect(data.session, next);
            return;
          }

          // If code exchange returned an error (e.g. PKCE verifier already consumed by client listener),
          // re-verify if session was actually created!
          const { data: verifyData } = await supabase.auth.getSession();
          if (verifyData?.session) {
            authListener.subscription.unsubscribe();
            await completeSessionAndRedirect(verifyData.session, next);
            return;
          }

          // Give background listener 1.5 seconds to complete before showing any error
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const { data: finalCheck } = await supabase.auth.getSession();
          if (finalCheck?.session) {
            authListener.subscription.unsubscribe();
            await completeSessionAndRedirect(finalCheck.session, next);
            return;
          }

          authListener.subscription.unsubscribe();

          // Only show error if absolutely no session exists
          if (error && isMounted) {
            console.error('Final code exchange error:', error);
            // If error is about PKCE code verifier, but user has auth in localStorage, redirect anyway
            const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('codepilot_demo_active') : null;
            if (storedDemo) {
              router.push('/dashboard');
              return;
            }
            setErrorMessage(error.message);
          }
        } else {
          // No code parameter; check if session exists or redirect
          setTimeout(async () => {
            const { data: fallbackCheck } = await supabase.auth.getSession();
            if (fallbackCheck?.session && isMounted) {
              await completeSessionAndRedirect(fallbackCheck.session, next);
            } else if (isMounted) {
              router.push('/dashboard');
            }
          }, 1200);
        }
      } catch (err: unknown) {
        console.error('Callback error:', err);
        // Verify if session exists before surfacing error
        const { data: errCheck } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        if (errCheck?.session && isMounted) {
          router.push(next);
          return;
        }
        if (isMounted) {
          setErrorMessage((err as Error).message || 'Authentication callback failed');
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  if (errorMessage && !sessionFound) {
    return (
      <div className="py-12 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c101b] border border-[#1c2438] rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#da3633]/15 text-[#ff7b72] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">OAuth Session Sync Notice</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">{errorMessage}</p>
          </div>
          
          <div className="p-3 bg-[#070a12] border border-[#172033] rounded-lg text-left text-[11px] text-slate-400 font-mono space-y-1">
            <div className="text-slate-300 font-semibold">Quick Resolution:</div>
            <div>• If your profile avatar/name is visible in the top bar, your session is already active!</div>
            <div>• Click &quot;Continue to Workspace&quot; below to load your dashboard.</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-colors shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Continue to Workspace</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg bg-[#161f33] hover:bg-[#1e2a45] text-slate-300 hover:text-white text-xs font-semibold border border-[#22304d] transition-colors"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0c101b] border border-[#1c2438] rounded-2xl p-8 text-center space-y-5 shadow-2xl">
        <div className="flex justify-center">
          <Logo size={48} rounded="rounded-xl" className="shadow-lg shadow-blue-500/10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-white tracking-tight">CodePilot AI Gateway</h2>
          <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#58a6ff]" />
            <span>{statusMessage}</span>
          </p>
        </div>
        <div className="w-full bg-[#161f33] rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f6feb] to-[#238636] h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#58a6ff]" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
