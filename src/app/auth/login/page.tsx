'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Github, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  GraduationCap,
  School,
  Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/supabase/auth-context';

export default function AuthAccountPage() {
  const router = useRouter();
  const { 
    signInWithGithub, 
    signInWithEmail, 
    signUpWithEmail, 
    enableStudentDemo, 
    enableFacultyDemo 
  } = useAuth();

  // Active role tab: student (GitHub) vs faculty (Email)
  const [activePortal, setActivePortal] = useState<'student' | 'faculty'>('student');

  // Login form state (Faculty)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state (Faculty signup)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleFacultySignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await signInWithEmail(loginEmail, loginPassword, 'faculty');
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
    } else {
      router.push('/faculty');
    }
  };

  const handleFacultyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the platform policy.');
      return;
    }
    setRegLoading(true);
    setRegError(null);
    const { error } = await signUpWithEmail(regEmail, regPassword, regName, 'faculty');
    setRegLoading(false);
    if (error) {
      setRegError(error.message);
    } else {
      setRegSuccess(true);
    }
  };

  const handleStudentDemo = () => {
    enableStudentDemo();
    router.push('/dashboard');
  };

  const handleFacultyDemo = () => {
    enableFacultyDemo();
    router.push('/faculty');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
          AUTHENTICATION &amp; ACCOUNT
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Secure Access to Engineering Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Students sign in via GitHub OAuth • Faculty members sign in via Institutional Email &amp; Password.
        </p>
      </div>

      {/* Role Portal Switcher Banner */}
      <div className="p-1.5 rounded-xl bg-[#0e1424] border border-[#1c2438] flex max-w-md">
        <button
          onClick={() => setActivePortal('student')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activePortal === 'student'
              ? 'bg-[#18233c] text-white border border-[#388bfd] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#58a6ff]" />
          <span>Student Portal (GitHub)</span>
        </button>

        <button
          onClick={() => setActivePortal('faculty')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activePortal === 'faculty'
              ? 'bg-[#18233c] text-white border border-[#388bfd] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <School className="w-4 h-4 text-[#3fb950]" />
          <span>Faculty Portal (Email)</span>
        </button>
      </div>

      {/* Side-by-side Landscape Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Card: Primary Portal Login */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Logo size={48} rounded="rounded-xl" className="shadow-lg shadow-blue-500/10" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {activePortal === 'student' ? 'Student Sign-In' : 'Faculty Sign-In'}
            </h2>
            <p className="text-xs text-slate-400">
              {activePortal === 'student'
                ? 'Authorized access to your repositories and AI review agents via GitHub.'
                : 'Staff portal for batch audits, grade submissions, and roster management.'}
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-[#da3633]/20 border border-[#da3633]/40 text-xs text-[#ff7b72] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {activePortal === 'student' ? (
            /* STUDENT LOGIN: GITHUB OAUTH */
            <div className="space-y-4 pt-2">
              <button
                onClick={() => signInWithGithub()}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold shadow-md transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>Sign in with GitHub (Student Auth)</span>
              </button>

              <div className="p-3.5 rounded-lg bg-[#070a12] border border-[#172033] text-slate-400 font-mono text-[11px] space-y-1">
                <div className="text-slate-300 font-semibold">GitHub OAuth Scopes:</div>
                <div>• read:user (Student profile &amp; avatar)</div>
                <div>• user:email (Verified university email)</div>
                <div>• repo (Public &amp; assigned classroom code)</div>
              </div>

              {/* Student Demo Blue Card */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1d2b48] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#58a6ff] font-mono uppercase tracking-wider text-[11px]">
                    Quick Demo Access
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800">
                    Preview Mode
                  </span>
                </div>
                <div className="text-slate-300 text-[11.5px]">
                  Explore the complete student experience with sample repositories and multi-agent review data.
                </div>
                <button
                  onClick={handleStudentDemo}
                  className="text-[#58a6ff] hover:underline font-mono text-xs inline-flex items-center gap-1 font-semibold pt-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Student Workspace →</span>
                </button>
              </div>
            </div>
          ) : (
            /* FACULTY LOGIN: EMAIL & PASSWORD */
            <form onSubmit={handleFacultySignIn} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Institutional faculty email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="faculty@university.edu"
                  className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your faculty email address.')}
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
                {loginLoading ? 'Signing in...' : 'Sign in to Faculty Portal'}
              </button>

              {/* Faculty Demo Card */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1d2b48] space-y-1.5 text-xs mt-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#3fb950] font-mono uppercase tracking-wider text-[11px]">
                    Quick Faculty Access
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800">
                    Staff Pass
                  </span>
                </div>
                <div className="text-slate-300 text-[11.5px]">
                  Explore the class-wide defect analytics dashboard, cohort rosters, and submission grading.
                </div>
                <button
                  type="button"
                  onClick={handleFacultyDemo}
                  className="text-[#3fb950] hover:underline font-mono text-xs inline-flex items-center gap-1 font-semibold pt-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Faculty Grading Portal →</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Card: Account Registration & Role Information */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Create Faculty or Staff Account
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Faculty members register with an institutional email to oversee student cohorts.
            </p>
          </div>

          {regSuccess && (
            <div className="p-3.5 rounded-lg bg-[#238636]/20 border border-[#238636]/40 text-xs text-[#3fb950] font-mono">
              Faculty registration dispatched! Check your institutional inbox.
            </div>
          )}

          <form onSubmit={handleFacultyRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Full name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Dr. Full Name"
                className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-[#388bfd]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Institutional email address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="faculty@university.edu"
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
                I verify that I am an authorized academic or organizational evaluator.
              </span>
            </label>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 mt-2"
            >
              {regLoading ? 'Registering...' : 'Register as Faculty Member'}
            </button>
          </form>

          <div className="p-3.5 rounded-lg bg-[#070a12] border border-[#172033] text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-white font-semibold">Student Sign-Up Note:</div>
            <div>Students do not need a password — simply select the Student tab and click &quot;Sign in with GitHub&quot; to authorize using your GitHub profile.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
