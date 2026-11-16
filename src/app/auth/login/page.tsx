'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Command, 
  Github, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/supabase/auth-context';

export default function AuthAccountPage() {
  const router = useRouter();
  const { signInWithGithub, signInWithGoogle, signInWithEmail, signUpWithEmail, enableDemoUser } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await signInWithEmail(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to terms and privacy policy.');
      return;
    }
    setRegLoading(true);
    setRegError(null);
    const { error } = await signUpWithEmail(regEmail, regPassword);
    setRegLoading(false);
    if (error) {
      setRegError(error.message);
    } else {
      setRegSuccess(true);
    }
  };

  const handleDemoLogin = () => {
    enableDemoUser();
    router.push('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
          AUTHENTICATION &amp; ACCOUNT
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Secure access to your engineering workspace
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Sign in or create an account with GitHub OAuth, Google, or student credentials.
        </p>
      </div>

      {/* Side-by-side Landscape Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Card: Sign In to CodePilot */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Logo size={48} rounded="rounded-xl" className="shadow-lg shadow-blue-500/10" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sign in to CodePilot
            </h2>
            <p className="text-xs text-slate-400">
              Your AI-powered engineering workspace.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-[#da3633]/20 border border-[#da3633]/40 text-xs text-[#ff7b72] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => signInWithGithub()}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Sign in with GitHub</span>
            </button>

            <button
              onClick={() => signInWithGoogle()}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#1c2438] w-full" />
            <span className="bg-[#0e1424] px-3 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              or continue with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="text-[11px] text-[#58a6ff] hover:underline font-mono"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 mt-1"
            >
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Student Demo Blue Card */}
          <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1d2b48] space-y-1.5 text-xs">
            <div className="font-bold text-[#58a6ff] font-mono uppercase tracking-wider text-[11px]">
              MIT AOE Student Demo
            </div>
            <div className="text-slate-300 font-mono text-[11px]">
              Aman Atmaram Mahadik • Roll 68 • Batch B3
            </div>
            <button
              onClick={handleDemoLogin}
              className="text-[#58a6ff] hover:underline font-mono text-xs inline-flex items-center gap-1 font-semibold pt-1"
            >
              <span>Continue as demo student →</span>
            </button>
          </div>
        </div>

        {/* Right Card: Create Your Account */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Join CodePilot AI and start reviewing repositories.
            </p>
          </div>

          {regSuccess && (
            <div className="p-3.5 rounded-lg bg-[#238636]/20 border border-[#238636]/40 text-xs text-[#3fb950] font-mono">
              Account created successfully! Verification link simulated.
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Full name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
              />

              {/* Password strength indicators */}
              <div className="mt-2 space-y-1">
                <div className="flex gap-1.5 h-1">
                  <div className={`flex-1 rounded-full ${regPassword ? 'bg-[#3fb950]' : 'bg-[#1c2438]'}`} />
                  <div className={`flex-1 rounded-full ${regPassword.length > 5 ? 'bg-[#3fb950]' : 'bg-[#1c2438]'}`} />
                  <div className={`flex-1 rounded-full ${regPassword.length > 8 ? 'bg-[#3fb950]' : 'bg-[#1c2438]'}`} />
                  <div className={`flex-1 rounded-full ${regPassword.length > 11 ? 'bg-[#3fb950]' : 'bg-[#1c2438]'}`} />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Password strength: {regPassword ? (regPassword.length > 8 ? 'Strong' : 'Moderate') : 'Not entered'}
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="flex items-start gap-2 pt-1 text-xs text-slate-400 cursor-pointer select-none"
            >
              <div
                className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                  agreeTerms
                    ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                    : 'border-slate-600 bg-transparent'
                }`}
              >
                {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="leading-snug">
                I agree to the terms and privacy policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 mt-2"
            >
              {regLoading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <div className="text-[11px] text-slate-500 font-mono leading-relaxed pt-2">
            Email verification is simulated. A production application should send a one-time verification link.
          </div>
        </div>
      </div>
    </div>
  );
}
