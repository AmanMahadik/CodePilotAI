'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  FileCode, 
  Terminal, 
  FileText, 
  GitBranch,
  Search
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

export default function OverviewDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Developer';
  const repoOwner = user?.user_metadata?.user_name || user?.email?.split('@')[0] || 'workspace';

  const repositories = [
    {
      name: 'Society_Sync',
      owner: repoOwner,
      repo: 'Society_Sync',
      branch: 'main',
      score: '92 / 100',
      scoreColor: 'text-[#3fb950] bg-[#238636]/15 border-[#238636]/30',
      lastReview: '12 min ago',
      link: '/review/rev-1',
    },
    {
      name: 'Hyperlocal-Civic',
      owner: repoOwner,
      repo: 'civic-reporter',
      branch: 'main',
      score: '78 / 100',
      scoreColor: 'text-[#f0883e] bg-[#bb8009]/15 border-[#bb8009]/30',
      lastReview: 'Yesterday',
      link: '/review/rev-1',
    },
    {
      name: 'Campus-Connect',
      owner: repoOwner,
      repo: 'campus-connect',
      branch: 'develop',
      score: '88 / 100',
      scoreColor: 'text-[#3fb950] bg-[#238636]/15 border-[#238636]/30',
      lastReview: '2 days ago',
      link: '/review/rev-1',
    },
    {
      name: 'Energy-Saver',
      owner: repoOwner,
      repo: 'energy-saver',
      branch: 'main',
      score: '85 / 100',
      scoreColor: 'text-[#e3b341] bg-[#bb8009]/15 border-[#bb8009]/30',
      lastReview: '4 days ago',
      link: '/review/rev-1',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            WORKSPACE / OVERVIEW
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Good evening, {firstName}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {user ? 'Your engineering workspace at a glance.' : 'Connect your repositories to begin automated code review.'}
          </p>
        </div>

        <Link
          href="/review/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add repository</span>
        </Link>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Repositories</span>
          <div className="text-3xl font-bold text-white mt-1">04</div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Connected projects</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Reviews completed</span>
          <div className="text-3xl font-bold text-white mt-1">28</div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5 font-semibold">↑ 6 this week</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Open findings</span>
          <div className="text-3xl font-bold text-[#f0883e] mt-1">42</div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">7 critical / high</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[11px] font-mono text-slate-400">Average health score</span>
          <div className="text-3xl font-bold text-[#3fb950] mt-1">
            86<span className="text-base font-normal text-slate-500">/100</span>
          </div>
          <span className="text-[10px] text-[#3fb950] font-mono block mt-0.5 font-semibold">↑ 4.2% improvement</span>
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
                  Your repositories
                </h3>
                <p className="text-[11px] text-slate-400">Recently reviewed projects</p>
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
                    <th className="pb-2 font-semibold text-right">LAST REVIEW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172033]">
                  {repositories.map((repo, i) => (
                    <tr key={i} className="hover:bg-[#131b2e] transition-colors group">
                      <td className="py-3">
                        <Link href={repo.link} className="flex items-start gap-2">
                          <span className="w-3.5 h-3.5 mt-0.5 rounded border border-slate-600 inline-block shrink-0"></span>
                          <div>
                            <div className="font-semibold text-white group-hover:text-[#58a6ff] transition-colors">
                              {repo.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {repo.owner} / {repo.repo}
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
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${repo.scoreColor}`}>
                          {repo.score}
                        </span>
                      </td>
                      <td className="py-3 text-right text-[11px] text-slate-400 font-mono">
                        {repo.lastReview}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Slider bar */}
            <div className="mt-4 pt-3 border-t border-[#1c2438] flex items-center justify-center gap-2">
              <button className="text-slate-500 hover:text-slate-300 text-xs">◀</button>
              <div className="w-48 h-1.5 rounded-full bg-[#1c2438] overflow-hidden">
                <div className="w-16 h-full bg-slate-400 rounded-full"></div>
              </div>
              <button className="text-slate-500 hover:text-slate-300 text-xs">▶</button>
            </div>
          </div>

          {/* Finding Trends Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Finding trends
                </h3>
                <p className="text-[11px] text-slate-400">Defects across the last 10 reviews</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#161f33] border border-[#22304d]">
                Last 10 reviews
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 mb-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#da3633]"></span> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f0883e]"></span> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#e3b341]"></span> Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span> Low</span>
            </div>

            {/* Segmented Stacked Bars */}
            <div className="grid grid-cols-10 gap-2 h-28 items-end bg-[#0a0f1d] p-3 rounded-lg border border-[#172033]">
              {[
                { c: 2, h: 3, m: 4, l: 2 },
                { c: 2, h: 3, m: 3, l: 2 },
                { c: 2, h: 2, m: 4, l: 3 },
                { c: 1, h: 2, m: 3, l: 2 },
                { c: 2, h: 2, m: 2, l: 3 },
                { c: 1, h: 2, m: 3, l: 4 },
                { c: 2, h: 2, m: 3, l: 4 },
                { c: 1, h: 3, m: 2, l: 3 },
                { c: 0, h: 2, m: 3, l: 4 },
                { c: 0, h: 1, m: 2, l: 4 },
              ].map((stack, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 w-full h-full justify-end">
                  <div className="w-full bg-[#58a6ff] rounded-xs" style={{ height: `${stack.l * 5}px` }}></div>
                  <div className="w-full bg-[#e3b341] rounded-xs" style={{ height: `${stack.m * 6}px` }}></div>
                  <div className="w-full bg-[#f0883e] rounded-xs" style={{ height: `${stack.h * 6}px` }}></div>
                  <div className="w-full bg-[#da3633] rounded-xs" style={{ height: `${stack.c * 8}px` }}></div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
              <span>Review 01</span>
              <span>Review 05</span>
              <span>Review 10</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Review SLA, Agent Availability, Recent Activity */}
        <div className="lg:col-span-5 space-y-4">
          {/* Review SLA Card */}
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Review SLA</span>
            <div className="text-[11px] text-slate-500">Performance target</div>
            <div className="text-3xl font-extrabold text-[#3fb950] mt-1.5 font-mono">42s</div>
            <div className="text-[10px] text-slate-400 font-mono">P95 review time</div>

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
                { name: 'Security Agent', status: 'Online' },
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
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                  <span>Review completed</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-3 font-mono">
                  Society_Sync • 12 minutes ago
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f0883e]"></span>
                  <span>3 findings need attention</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-3 font-mono">
                  Hyperlocal-Civic • Yesterday
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]"></span>
                  <span>Documentation generated</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-3 font-mono">
                  Campus-Connect • 2 days ago
                </div>
              </div>
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
            href="/review/rev-1"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Run code review</span>
          </Link>

          <Link
            href="/chat/repo-1"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Ask CodePilot</span>
          </Link>

          <Link
            href="/report/rev-1"
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
