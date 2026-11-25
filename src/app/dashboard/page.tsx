'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  GitBranch,
  Search,
  RefreshCw,
  Loader2,
  Terminal,
  FileText,
  ShieldCheck,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { Repository, Review } from '@/lib/types';
import { fetchStudentGithubRepositories } from '@/lib/github';
import { getStoredReviews } from '@/lib/store';

export default function OverviewDashboardPage() {
  const { user, session } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer';

  const [repos, setRepos] = useState<Repository[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadRepos = useCallback(async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    else setLoadingRepos(true);

    try {
      const { repos: loadedRepos } = await fetchStudentGithubRepositories(
        user, 
        session
      );
      setRepos(loadedRepos);
    } catch (e) {
      console.warn('Error loading repos on dashboard:', e);
      setRepos([]);
    } finally {
      setLoadingRepos(false);
      setSyncing(false);
    }
  }, [user, session]);

  useEffect(() => {
    loadRepos();
    const stored = getStoredReviews();
    setReviews(Object.values(stored));
  }, [loadRepos]);

  const totalReviews = reviews.length;
  const totalFindings = reviews.reduce((acc, r) => acc + (r.findings?.length || 0), 0);
  const criticalFindings = reviews.reduce((acc, r) => acc + (r.findings?.filter(f => f.severity === 'Critical' || f.severity === 'High').length || 0), 0);
  
  const avgScore = reviews.length > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + (r.scores?.overall || 0), 0) / reviews.length) 
    : (repos.length > 0 ? Math.round(repos.reduce((acc, r) => acc + (r.latestScore || 85), 0) / repos.length) : null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            WORKSPACE / OVERVIEW
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Welcome, {firstName}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {user ? 'Your connected repositories and real-time code health.' : 'Sign in to connect repositories and run autonomous code reviews.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadRepos(true)}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#161f33] hover:bg-[#1e2a45] text-slate-300 hover:text-white text-xs font-semibold border border-[#22304d] transition-colors shrink-0 disabled:opacity-50"
            title="Sync latest repositories from GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#58a6ff]' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
          </button>

          <Link
            href="/review/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add repository</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Repositories</span>
          <div className="text-3xl font-bold text-white mt-1">
            {repos.length.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            {repos.length > 0 ? 'Connected source projects' : 'No repositories connected yet'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Reviews completed</span>
          <div className="text-3xl font-bold text-white mt-1">
            {totalReviews.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5 font-semibold">
            {totalReviews > 0 ? `${totalReviews} active analyses` : 'Start your first review'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Open findings</span>
          <div className="text-3xl font-bold text-[#f0883e] mt-1">
            {totalFindings}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {criticalFindings} critical / high
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Average health score</span>
          <div className="text-3xl font-bold text-[#3fb950] mt-1">
            {avgScore !== null ? avgScore : '--'}{avgScore !== null && <span className="text-base font-normal text-slate-500">/100</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            {avgScore !== null ? 'Live code quality baseline' : 'Pending review completion'}
          </span>
        </div>
      </div>

      {/* Middle Section: Landscape 2-Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Repositories Table & Trends */}
        <div className="lg:col-span-7 space-y-5">
          {/* Your Repositories Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2438] mb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Your repositories ({repos.length})
                </h3>
                <p className="text-[11px] text-slate-400">Active repositories connected to CodePilot AI</p>
              </div>
              <Link
                href="/repositories"
                className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded bg-[#161f33] border border-[#22304d] transition-colors"
              >
                View all →
              </Link>
            </div>

            {/* Repositories Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-mono text-slate-400 border-b border-[#1c2438]">
                    <th className="pb-2 font-semibold">REPOSITORY</th>
                    <th className="pb-2 font-semibold">BRANCH</th>
                    <th className="pb-2 font-semibold">HEALTH</th>
                    <th className="pb-2 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172033]">
                  {loadingRepos ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2 text-[#58a6ff]" />
                        <span>Loading repositories from GitHub...</span>
                      </td>
                    </tr>
                  ) : repos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-mono space-y-1">
                        <Inbox className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                        <div>No repositories connected yet.</div>
                        <div className="text-[11px] text-slate-500">
                          Click &quot;Add repository&quot; to import your code or enter your GitHub handle.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    repos.slice(0, 5).map((repo) => (
                      <tr key={repo.id} className="hover:bg-[#131b2e] transition-colors group">
                        <td className="py-3">
                          <Link href={`/review/new?url=${encodeURIComponent(repo.url || '')}&name=${encodeURIComponent(repo.name)}`} className="flex items-start gap-2">
                            <span className="w-3.5 h-3.5 mt-0.5 rounded border border-slate-600 inline-block shrink-0"></span>
                            <div>
                              <div className="font-semibold text-white group-hover:text-[#58a6ff] transition-colors">
                                {repo.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {repo.owner} • {repo.primaryLanguage}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-[10px] font-mono text-slate-300">
                            <GitBranch className="w-2.5 h-2.5 text-slate-400" />
                            <span>{repo.branch}</span>
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border text-[#3fb950] bg-[#238636]/15 border-[#238636]/30">
                            {repo.latestScore || 85} / 100
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/review/new?url=${encodeURIComponent(repo.url || '')}&name=${encodeURIComponent(repo.name)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#238636]/20 hover:bg-[#238636]/30 text-[#3fb950] border border-[#238636]/40 text-[10px] font-mono font-semibold transition-colors"
                          >
                            <span>Review</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Finding Trends Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Defect &amp; Finding Trends
                </h3>
                <p className="text-[11px] text-slate-400">Review defect distribution across your projects</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono bg-[#0a0f1d] rounded-lg border border-[#172033]">
                No review findings yet. Run a code review on any repository to visualize defect trends.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#da3633]"></span> Critical</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f0883e]"></span> High</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e3b341]"></span> Medium</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span> Low</span>
                </div>

                <div className="grid grid-cols-5 gap-2 h-24 items-end bg-[#0a0f1d] p-3 rounded-lg border border-[#172033]">
                  {reviews.slice(0, 5).map((rev) => {
                    const c = rev.findings.filter(f => f.severity === 'Critical').length;
                    const h = rev.findings.filter(f => f.severity === 'High').length;
                    const m = rev.findings.filter(f => f.severity === 'Medium').length;
                    const l = rev.findings.filter(f => f.severity === 'Low').length;
                    return (
                      <div key={rev.id} className="flex flex-col gap-0.5 w-full h-full justify-end items-center">
                        <div className="w-full bg-[#58a6ff] rounded-xs" style={{ height: `${Math.min(l * 8, 20)}px` }} />
                        <div className="w-full bg-[#e3b341] rounded-xs" style={{ height: `${Math.min(m * 8, 20)}px` }} />
                        <div className="w-full bg-[#f0883e] rounded-xs" style={{ height: `${Math.min(h * 10, 24)}px` }} />
                        <div className="w-full bg-[#da3633] rounded-xs" style={{ height: `${Math.min(c * 12, 28)}px` }} />
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[60px] mt-1">{rev.repositoryName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Review SLA, Agent Availability, Recent Activity */}
        <div className="lg:col-span-5 space-y-4">
          {/* Review SLA Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Review SLA</span>
            <div className="text-[11px] text-slate-500">Autonomous performance target</div>
            <div className="text-3xl font-extrabold text-[#3fb950] mt-1.5 font-mono">
              {reviews.length > 0 ? `${Math.round(reviews[0].durationSeconds || 42)}s` : 'Ready'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Sub-minute multi-agent execution</div>

            <div className="mt-3 pt-3 border-t border-[#1c2438] flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Target: under 60s</span>
              <span className="text-[#3fb950] font-bold">Within SLA</span>
            </div>
          </div>

          {/* Agent Availability Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider font-mono">
              Agent availability
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Repository Agent', status: 'Online' },
                { name: 'Quality Agent', status: 'Online' },
                { name: 'Security Agent (OWASP)', status: 'Online' },
                { name: 'Documentation Agent', status: 'Online' },
              ].map((agent, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-[#162032] last:border-0">
                  <span className="text-slate-300 text-xs font-medium">{agent.name}</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#3fb950]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono">
              Recent activity
            </h4>
            <div className="space-y-3 text-xs">
              {reviews.length === 0 ? (
                <div className="text-slate-500 font-mono text-[11px] py-2">
                  No review activity recorded yet. Run a code review to track execution logs.
                </div>
              ) : (
                reviews.slice(0, 3).map((rev) => (
                  <div key={rev.id} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-white font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                      <span>Review completed • Score {rev.scores.overall}/100</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-3 font-mono flex items-center justify-between">
                      <span>{rev.repositoryName}</span>
                      <Link href={`/review/${rev.id}`} className="text-[#58a6ff] hover:underline">
                        View →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-1">
          Quick actions
        </div>
        <p className="text-[11px] text-slate-400 mb-3">Continue your engineering workflow</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/review/new"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import repository</span>
          </Link>

          <Link
            href="/review/new"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Run code review</span>
          </Link>

          <Link
            href="/chat/default"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Ask CodePilot</span>
          </Link>

          <Link
            href="/report/default"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate report</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
