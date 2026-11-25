'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Github, 
  Check, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Code2,
  Users2,
  Lock,
  ArrowRight
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/supabase/auth-context';

function AuthAccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGithub } = useAuth();

  // Active Role Tab: 'student' | 'faculty'
  const [activePortal, setActivePortal] = useState<'student' | 'faculty'>('student');

  // Student portal sub-state: whether student prefers ID/Password instead of GitHub
  const [studentAuthMode, setStudentAuthMode] = useState<'github' | 'password'>('github');
  const [studentPasswordTab, setStudentPasswordTab] = useState<'signin' | 'signup'>('signin');

  // Faculty portal sub-state: 'signin' | 'signup'
  const [facultyTab, setFacultyTab] = useState<'signin' | 'signup'>('signin');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institution, setInstitution] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [scopesExpanded, setScopesExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [verifiedNotice, setVerifiedNotice] = useState<string | null>(null);

  // Read URL query params on mount (e.g. error redirects or verification notices)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'csrf_state_mismatch') {
        setErrorMessage('Session expired or state mismatch during OAuth verification. Please try again.');
      } else if (error === 'account_exists_link_required') {
        setErrorMessage('An account with this email exists with a password. Please sign in below, then link GitHub in Settings.');
        setStudentAuthMode('password');
      } else {
        setErrorMessage(decodeURIComponent(error));
      }
    }

    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setVerifiedNotice('Your email has been verified successfully. You can now sign in.');
    }

    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, [searchParams]);

  // Caps lock detection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Live password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, text: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, text: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, text: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 10, text: 'Too short', color: 'bg-red-500' };
    }
  };

  const strength = getPasswordStrength(password);

  // GitHub OAuth Handler
  const handleGitHubAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithGithub();
      if (error) {
        console.error('GitHub sign in error:', error);
        setErrorMessage(error.message || 'GitHub sign-in could not be initiated.');
        setLoading(false);
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to initiate GitHub authorization');
      setLoading(false);
    }
  };

  // Sign In Handler (Student ID or Faculty)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Check status
      if (data.user?.status === 'PENDING_APPROVAL') {
        setPendingApproval(true);
        setLoading(false);
        return;
      }

      // Redirect to appropriate landing page
      if (data.user?.role === 'FACULTY') {
        router.push('/faculty');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  // Sign Up Handler (Student or Faculty)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    const targetRole = activePortal === 'faculty' ? 'FACULTY' : 'STUDENT';

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role: targetRole,
          institution: institution.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to complete registration');
        setLoading(false);
        return;
      }

      if (data.user?.status === 'PENDING_APPROVAL') {
        setPendingApproval(true);
        setLoading(false);
        return;
      }

      // Successful registration
      if (targetRole === 'FACULTY') {
        router.push('/faculty');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setErrorMessage('Network error during registration. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-6 px-4">
      <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: Brand & Trust Panel */}
        <div className="lg:col-span-6 space-y-6 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18233c]/80 border border-[#23314f] text-[11px] font-medium text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Engineering Security</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Secure access to your engineering workspace
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              CodePilot AI connects to repository sources to perform automated AST reviews, vulnerability audits, and technical viva simulations.
            </p>
          </div>

          {/* 3 Core Value Props */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Code2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">AI Code &amp; Architecture Review</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Multi-agent static analysis detecting OWASP Top 10 vulnerabilities with sub-minute turnaround.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Repository Insights &amp; Health</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Automated defect metrics, benchmark baselines, and suggested 1-click senior engineer remediations.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Users2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Role-Based Cohort Management</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Tailored portals for students, university faculty evaluators, and institutional administrators.
                </div>
              </div>
            </div>
          </div>

          {/* Security Assurance */}
          <div className="p-3.5 rounded-xl bg-[#0e1424] border border-[#1c2438] text-xs text-slate-400 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-300">Privacy Guarantee:</strong> We never see or store your GitHub password. All authorization occurs directly on GitHub.com via OAuth 2.0.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[440px] rounded-2xl bg-[#0e1424] border border-[#1c2438] p-6 sm:p-8 shadow-xl shadow-black/40 space-y-5">
            
            {/* Segmented Control (Student vs Faculty) */}
            <div 
              role="tablist" 
              className="p-1 rounded-xl bg-[#070a12] border border-[#172033] grid grid-cols-2 gap-1"
            >
              <button
                role="tab"
                aria-selected={activePortal === 'student'}
                onClick={() => {
                  setActivePortal('student');
                  setErrorMessage(null);
                  setPendingApproval(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activePortal === 'student'
                    ? 'bg-[#18233c] text-white shadow-sm border border-[#2b3a5c]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Portal
              </button>

              <button
                role="tab"
                aria-selected={activePortal === 'faculty'}
                onClick={() => {
                  setActivePortal('faculty');
                  setErrorMessage(null);
                  setPendingApproval(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activePortal === 'faculty'
                    ? 'bg-[#18233c] text-white shadow-sm border border-[#2b3a5c]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faculty Portal
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div 
                role="alert" 
                className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Email Verified Banner */}
            {verifiedNotice && (
              <div 
                role="status" 
                className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{verifiedNotice}</span>
              </div>
            )}

            {/* PENDING APPROVAL SCREEN (For non-institutional faculty or pending reviews) */}
            {pendingApproval ? (
              <div className="py-4 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Registration Pending Approval</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Thank you for registering. Non-institutional email domains require approval from the academic administration team before faculty grading tools can be accessed.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#070a12] border border-[#172033] text-[11px] text-slate-400">
                  We will send a confirmation email once your credentials have been verified.
                </div>
                <button
                  type="button"
                  onClick={() => setPendingApproval(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#18233c] hover:bg-[#202f50] text-xs font-semibold text-white transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            ) : activePortal === 'student' ? (
              /* ============================================================ */
              /* STUDENT PORTAL */
              /* ============================================================ */
              studentAuthMode === 'github' ? (
                /* 1. Primary GitHub OAuth Flow */
                <div className="space-y-4 pt-1">
                  <div className="space-y-1 text-center">
                    <h2 className="text-lg font-bold text-white">Student Sign-In &amp; Sign-Up</h2>
                    <p className="text-xs text-slate-400">
                      Connect your GitHub account to import repositories and run automated AI code audits.
                    </p>
                  </div>

                  {/* Standard Neutral GitHub Button */}
                  <button
                    type="button"
                    onClick={handleGitHubAuth}
                    disabled={loading}
                    className="w-full h-11 flex items-center justify-center gap-3 rounded-xl bg-[#24292f] hover:bg-[#2c323a] text-white text-xs font-semibold shadow-md transition-colors border border-slate-700/60 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        <span>Authorizing with GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4" />
                        <span>Continue with GitHub</span>
                      </>
                    )}
                  </button>

                  {/* Collapsible Scopes Info */}
                  <div className="rounded-xl bg-[#070a12] border border-[#172033] overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setScopesExpanded(!scopesExpanded)}
                      className="w-full py-2.5 px-3.5 flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <span>What access are we requesting?</span>
                      {scopesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {scopesExpanded && (
                      <div className="px-3.5 pb-3 pt-1 border-t border-[#172033] text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                        <div className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Read your profile:</strong> Display your GitHub name and avatar.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Read verified email:</strong> Link your academic records securely.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong>Read selected repositories:</strong> Pull repository code only when you request an analysis.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#1c2438]"></div>
                    </div>
                    <span className="relative bg-[#0e1424] px-2 text-[11px] text-slate-500 uppercase tracking-wider">or</span>
                  </div>

                  {/* Secondary Toggle: ID & Password */}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentAuthMode('password');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#222c42] bg-transparent hover:bg-[#141b2e] text-xs font-medium text-slate-300 transition-colors"
                  >
                    Use Student ID &amp; password instead
                  </button>
                </div>
              ) : (
                /* 2. Secondary Student ID & Password Form */
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Student Account</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentAuthMode('github');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      ← Back to GitHub
                    </button>
                  </div>

                  {/* Sign In / Sign Up Sub-tabs */}
                  <div className="flex border-b border-[#1c2438] text-xs">
                    <button
                      type="button"
                      onClick={() => setStudentPasswordTab('signin')}
                      className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                        studentPasswordTab === 'signin'
                          ? 'border-blue-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentPasswordTab('signup')}
                      className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                        studentPasswordTab === 'signup'
                          ? 'border-blue-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form 
                    onSubmit={studentPasswordTab === 'signin' ? handleSignIn : handleSignUp} 
                    className="space-y-3.5"
                  >
                    {studentPasswordTab === 'signup' && (
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Mercer"
                          className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Student Email or ID</label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs text-slate-300">Password</label>
                        {capsLockActive && (
                          <span className="text-[10px] text-amber-400 font-mono">CAPS LOCK ON</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete={studentPasswordTab === 'signin' ? 'current-password' : 'new-password'}
                          value={password}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 pr-9 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {studentPasswordTab === 'signup' && (
                      <>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">Confirm Password</label>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Live Password Strength Meter */}
                        {password && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Password strength</span>
                              <span className="font-semibold text-slate-200">{strength.text}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${strength.color} transition-all`} style={{ width: `${strength.score}%` }}></div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{studentPasswordTab === 'signin' ? 'Sign In' : 'Create Student Account'}</span>
                      )}
                    </button>
                  </form>
                </div>
              )
            ) : (
              /* ============================================================ */
              /* FACULTY PORTAL */
              /* ============================================================ */
              <div className="space-y-4 pt-1">
                <div className="space-y-1 text-center">
                  <h2 className="text-lg font-bold text-white">Faculty &amp; Evaluator Access</h2>
                  <p className="text-xs text-slate-400">
                    Oversee cohort submissions, automated viva scores, and repository audits.
                  </p>
                </div>

                {/* Sub-tabs: Sign In vs Sign Up */}
                <div className="flex border-b border-[#1c2438] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyTab('signin');
                      setErrorMessage(null);
                    }}
                    className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                      facultyTab === 'signin'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Faculty Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyTab('signup');
                      setErrorMessage(null);
                    }}
                    className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                      facultyTab === 'signup'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Register as Faculty
                  </button>
                </div>

                <form onSubmit={facultyTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
                  {facultyTab === 'signup' && (
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Full Name &amp; Title</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Katherine Johnson"
                        className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Institutional Email Address
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kjohnson@university.edu"
                      className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {facultyTab === 'signup' && (
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Use your official .edu or institutional domain for immediate activation.
                      </span>
                    )}
                  </div>

                  {facultyTab === 'signup' && (
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Institution &amp; Department</label>
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="MIT Department of Computer Science"
                        className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-slate-300">Password</label>
                      {capsLockActive && (
                        <span className="text-[10px] text-amber-400 font-mono">CAPS LOCK ON</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete={facultyTab === 'signin' ? 'current-password' : 'new-password'}
                        value={password}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 px-3 pr-9 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {facultyTab === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Confirm Password</label>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-3 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Live Password Strength Meter */}
                      {password && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Password complexity</span>
                            <span className="font-semibold text-slate-200">{strength.text}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${strength.color} transition-all`} style={{ width: `${strength.score}%` }}></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{facultyTab === 'signin' ? 'Sign In to Faculty Portal' : 'Register Faculty Account'}</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Footer Under Card */}
            <div className="pt-2 text-center text-xs text-slate-500 space-x-3">
              <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <span>•</span>
              <Link href="/documentation" className="hover:text-slate-400 transition-colors">Need help?</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AuthAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <AuthAccountPageContent />
    </Suspense>
  );
}
