'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { fetchStudentGithubRepositories } from '@/lib/github';
import Logo from '@/components/Logo';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying your GitHub credentials...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/dashboard';

        if (code) {
          setStatusMessage('Exchanging authorization code for secure session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange failed:', error);
            if (isMounted) setErrorMessage(error.message);
            return;
          }

          if (data.session) {
            if (data.session.provider_token) {
              localStorage.setItem('codepilot_gh_token', data.session.provider_token);
            }

            setStatusMessage('Syncing your GitHub repositories into workspace...');
            await fetchStudentGithubRepositories(data.session.user, data.session);

            if (isMounted) {
              router.push(next);
            }
            return;
          }
        }

        // Check if session is already established (e.g. hash fragment or existing session)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Get session error:', sessionError);
          if (isMounted) setErrorMessage(sessionError.message);
          return;
        }

        if (session) {
          if (session.provider_token) {
            localStorage.setItem('codepilot_gh_token', session.provider_token);
          }

          setStatusMessage('Syncing your GitHub repositories into workspace...');
          await fetchStudentGithubRepositories(session.user, session);

          if (isMounted) {
            router.push(next);
          }
          return;
        }

        // If no code and no session found after small delay, redirect to login
        setTimeout(() => {
          if (isMounted) {
            router.push('/dashboard');
          }
        }, 1500);
      } catch (err: unknown) {
        console.error('Callback error:', err);
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

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#090d16] text-[#e6edf3] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0c101b] border border-[#da3633]/40 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#da3633]/15 text-[#ff7b72] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">GitHub Authentication Issue</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">{errorMessage}</p>
          </div>
          <div className="p-3 bg-[#070a12] border border-[#172033] rounded-lg text-left text-[11px] text-slate-400 font-mono space-y-1">
            <div className="text-slate-300 font-semibold">Troubleshooting:</div>
            <div>• Ensure GitHub provider is toggled ON in Supabase Dashboard.</div>
            <div>• Verify GitHub Client ID &amp; Secret match Supabase configuration.</div>
            <div>• Authorization callback URL must be set to:</div>
            <div className="text-[#58a6ff] break-all">https://fdidwqlutymbyrdjjptx.supabase.co/auth/v1/callback</div>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-colors"
          >
            <span>Return to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e6edf3] flex flex-col items-center justify-center p-6">
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
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#58a6ff]" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
