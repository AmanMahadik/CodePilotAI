'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  FileCode2, 
  Github, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileText, 
  BookOpen, 
  Cpu,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

export default function HomePage() {
  const { user, enableDemoUser } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-28 overflow-hidden flex flex-col items-center text-center px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* PRD & Academic Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 shadow-inner">
            <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-semibold text-white">MIT Academy of Engineering, Pune</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-brand-300">Aman Mahadik (Roll 68, Batch B3)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The AI Mentor That Reviews Code Like a{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Staff Software Engineer
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CodePilot AI provides multi-agent repository reviews, OWASP Top 10 security audits, bug pattern remediation, repository-grounded AI chat, and certified institutional PDF reports in under 60 seconds.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/review/rev-1"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/25 transition-all group"
            >
              <span>Explore Interactive Review (MVP)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/review/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
            >
              <Github className="w-4 h-4 text-white" />
              <span>Upload ZIP or GitHub Repo</span>
            </Link>

            {!user && (
              <button
                onClick={enableDemoUser}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-semibold text-sm border border-amber-500/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>One-Click Student Demo</span>
              </button>
            )}
          </div>

          {/* SLA metrics badge */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>&lt; 60s Review SLA (P95)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>OWASP Top 10 Mapped</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Supabase Auth & OAuth 2.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Incremental Process Model Visualization (SRS Supplementary Page) */}
      <section className="w-full max-w-6xl px-4 py-12 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            Process Model: Incremental Process Model (CPA-PRD-001)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Progressively Complete Engineering Architecture
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2">
            Self-contained builds each passing through Communication, Planning, Modeling, Construction, and Deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Increment 1 (MVP) */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-b from-brand-950/40 to-slate-900/60 border-2 border-brand-500/50 shadow-xl shadow-brand-500/10">
            <div className="inline-block px-2.5 py-1 rounded bg-brand-500 text-white text-[11px] font-bold uppercase tracking-wider mb-4">
              Increment 1 (MVP) — Current Live
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Core Multi-Agent Mentorship</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ships complete usable slice: Supabase OAuth, ZIP & GitHub repository ingestion, multi-agent review pipeline, OWASP bug scanning, repo-grounded chat, and PDF reporting.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> FR-001 to FR-020: Supabase OAuth</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> FR-041 to FR-070: Ingestion Engine</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> FR-071 to FR-120: Multi-Agent AI Review</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> FR-121 to FR-150: Repository AI Chat</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> FR-211 to FR-230: Academic PDF Report</li>
            </ul>
          </div>

          {/* Increment 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="inline-block px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-4 border border-slate-700">
              Increment 2 (Phase 2)
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Advanced Dev & Interview</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              AI unit test generation for uncovered paths, containerization deploy assistant, mock technical interviews grounded in code, and resume skill alignment.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-231: Test Generation</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-261: Deployment Assistant</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-331: Mock Technical Interview</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-351: Resume Skill Review</li>
            </ul>
          </div>

          {/* Increment 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="inline-block px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-4 border border-slate-700">
              Increment 3 (Phase 3)
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ecosystem & Faculty Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              VS Code extension for in-editor review, GitHub App PR integration, bootcamp org dashboards, and college faculty grading portals.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-371: VS Code Extension</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-385: GitHub PR App</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-400: Faculty Portal Roster</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> FR-420: Organization Dashboards</li>
            </ul>
          </div>
        </div>
      </section>

      {/* The 7 Student Developer Problem Areas from PRD */}
      <section className="w-full max-w-6xl px-4 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            PRD Section 2: Problem Statement
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Closing the 7 Industry Readiness Gaps
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2">
            Education optimizes for code that passes an assignment; industry requires code a team can maintain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: 'Code Quality',
              desc: 'Idiomatic style, cognitive complexity, SOLID design principles, and maintainable abstractions.',
              icon: Sparkles,
            },
            {
              title: 'Documentation',
              desc: 'Auto-drafted production READMEs and inline JSDoc/docstring comments for exported interfaces.',
              icon: BookOpen,
            },
            {
              title: 'Security (OWASP)',
              desc: 'Detection of SQL injection, broken access control, CORS misconfigurations, and committed secrets.',
              icon: ShieldCheck,
            },
            {
              title: 'Debugging & Bug Detection',
              desc: 'Flagging async forEach race conditions, null dereferences, and silent error catch swallowing with code diffs.',
              icon: FileCode2,
            },
            {
              title: 'Grounded AI Chat',
              desc: 'Ask follow-up questions anchored to specific findings with source citations referencing exact lines.',
              icon: Terminal,
            },
            {
              title: 'Academic & Industry PDF Reports',
              desc: 'Download certified PDF reviews with college branding toggles (MIT AOE) and shareable public links.',
              icon: FileText,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="w-9 h-9 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
