'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  RotateCw, 
  ShieldCheck, 
  Check, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  Download,
  GitBranch,
  Layers
} from 'lucide-react';

export default function CodeReviewDetailPage() {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            SOCIETY_SYNC / CODE REVIEW
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Code Review
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-agent analysis • Last run today, 12 minutes ago
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/chat/repo-1"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </Link>

          <button
            onClick={() => alert('Re-running analysis on Society_Sync...')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Run review</span>
          </button>
        </div>
      </div>

      {/* Meta Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-300">
          <GitBranch className="w-3 h-3 text-slate-400" />
          <span>main</span>
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-bold">
          Completed
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-400">
          Commit a84c91d
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-400">
          42s runtime
        </span>
      </div>

      {/* Multi-Agent Orchestration Bar (4 Agents in landscape) */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
          Multi-agent orchestration
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Agent 1 */}
          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">01 - INGESTION</div>
            <div className="text-xs font-bold text-white">Repository Agent</div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
              <span>Completed</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">320ms • 124 files</div>
          </div>

          {/* Agent 2 */}
          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">02 - QUALITY</div>
            <div className="text-xs font-bold text-white">Quality Agent</div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
              <span>Completed</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">1.2s • 8 findings</div>
          </div>

          {/* Agent 3 */}
          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">03 - SECURITY</div>
            <div className="text-xs font-bold text-white">Security Agent</div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
              <span>Completed</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">2.4s • 3 findings</div>
          </div>

          {/* Agent 4 */}
          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">04 - DOCUMENTATION</div>
            <div className="text-xs font-bold text-white">Documentation Agent</div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
              <span>Completed</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">600ms • 5 suggestions</div>
          </div>
        </div>
      </div>

      {/* 5 Score Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Overall health</span>
          <div className="text-3xl font-extrabold text-[#3fb950] mt-1 font-mono">92</div>
          <span className="text-[10px] text-slate-500 font-mono">/100</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Code quality</span>
          <div className="text-3xl font-extrabold text-[#58a6ff] mt-1 font-mono">94%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">OWASP security</span>
          <div className="text-3xl font-extrabold text-[#58a6ff] mt-1 font-mono">82%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Reliability</span>
          <div className="text-3xl font-extrabold text-[#58a6ff] mt-1 font-mono">90%</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Documentation</span>
          <div className="text-3xl font-extrabold text-[#3fb950] mt-1 font-mono">96%</div>
        </div>
      </div>

      {/* Findings Section */}
      <div className="space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
          <div className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Findings • 7 open issues
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-[#161f33] border border-[#22304d] text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>

            <Link
              href="/report/rev-1"
              className="px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
            >
              Export report
            </Link>
          </div>
        </div>

        {/* Finding Card 1: SQL Injection (Critical) */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#da3633]/20 border border-[#da3633]/40 text-[#ff7b72] text-[10px] font-mono font-bold">
                Critical
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-300 text-[10px] font-mono">
                Security
              </span>
              <span className="text-[10px] font-mono text-slate-500">CPAI-001</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Confidence 98%</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Potential SQL injection in authentication query
            </h3>
            <div className="text-[11px] font-mono text-[#58a6ff] mt-0.5">
              src/middleware/auth.ts:18-24
            </div>
          </div>

          {/* Diff Box */}
          <div className="rounded-lg bg-[#070a12] border border-[#172033] p-3 text-xs font-mono text-slate-300 space-y-1">
            <div className="text-slate-500">18   const query = &apos;SELECT * FROM users</div>
            <div className="bg-[#da3633]/20 text-[#ff7b72] px-1 rounded">
              19 -   WHERE email = &quot;${`{email}`}&quot;&apos;;
            </div>
            <div className="text-slate-500">20   db.execute(query);</div>
          </div>

          {/* Senior Engineer Explanation */}
          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-[#1c2438] text-xs space-y-1">
            <div className="text-[11px] font-bold text-[#e3b341] font-mono uppercase tracking-wider">
              Senior Engineer Explanation
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              Directly interpolating user-controlled input into a SQL statement can allow an attacker to modify the query. Use parameterized queries to keep data separate from executable SQL.
            </p>
          </div>

          {/* Suggested fix - Parameterized query */}
          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-[#1c2438] text-xs space-y-2">
            <div className="text-[11px] font-bold text-[#3fb950] font-mono uppercase tracking-wider">
              Suggested fix - Parameterized query
            </div>
            <div className="rounded-lg bg-[#070a12] border border-[#172033] p-3 text-xs font-mono space-y-1">
              <div className="bg-[#da3633]/20 text-[#ff7b72] px-1 rounded">
                19 -   WHERE email = &quot;${`{email}`}&quot;&apos;;
              </div>
              <div className="bg-[#238636]/20 text-[#3fb950] px-1 rounded">
                19 +   WHERE email = ?;
              </div>
              <div className="bg-[#238636]/20 text-[#3fb950] px-1 rounded">
                20 +   db.execute(query, [email]);
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-[#172033] flex flex-wrap items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded-full bg-[#f0883e]/15 border border-[#f0883e]/30 text-[#f0883e] text-[10px] font-mono">
              A03:2021 - Injection
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy('c1', 'const query = \'SELECT * FROM users WHERE email = ?\';\ndb.execute(query, [email]);')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
              >
                {copiedId === 'c1' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'c1' ? 'Copied' : 'Copy fix'}</span>
              </button>

              <Link
                href="/chat/repo-1?findingId=CPAI-001"
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
              >
                <span>Ask AI about finding</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Finding Card 2: Ownership Validation (High) */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#f0883e]/20 border border-[#f0883e]/40 text-[#f0883e] text-[10px] font-mono font-bold">
                High
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-300 text-[10px] font-mono">
                Access Control
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Confidence 94%</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Missing ownership validation in resident endpoint
            </h3>
            <div className="text-[11px] font-mono text-[#58a6ff] mt-0.5">
              src/api/residents/[id].ts:42-47
            </div>
          </div>

          <div className="rounded-lg bg-[#070a12] border border-[#172033] p-3 text-xs font-mono space-y-1">
            <div className="bg-[#da3633]/20 text-[#ff7b72] px-1 rounded">
              - const resident = await getResident(req.param.id);
            </div>
            <div className="bg-[#238636]/20 text-[#3fb950] px-1 rounded">
              + const resident = await getResidentForSociety(req.param.id, user.societyId);
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-[#1c2438] text-xs space-y-1">
            <div className="text-[11px] font-bold text-[#e3b341] font-mono uppercase tracking-wider">
              Senior Engineer Explanation
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              Authentication alone does not prove that a user is authorized to access a particular resident record. Enforce tenant and resource ownership checks.
            </p>
          </div>

          <div className="pt-2 border-t border-[#172033] flex flex-wrap items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded-full bg-[#f0883e]/15 border border-[#f0883e]/30 text-[#f0883e] text-[10px] font-mono">
              A01:2021 - Broken Access Control
            </span>

            <Link
              href="/chat/repo-1?findingId=CPAI-002"
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
            >
              <span>Ask AI about finding</span>
            </Link>
          </div>
        </div>

        {/* Finding Card 3: Unbounded Query (Medium) */}
        <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#e3b341]/20 border border-[#e3b341]/40 text-[#e3b341] text-[10px] font-mono font-bold">
                Medium
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Confidence 89%</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              Unbounded database query in activity history
            </h3>
            <div className="text-[11px] font-mono text-[#58a6ff] mt-0.5">
              src/services/activity.ts:61-64
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0b101d] border border-[#1c2438] text-xs space-y-1">
            <div className="text-[11px] font-bold text-[#e3b341] font-mono uppercase tracking-wider">
              Senior Engineer Explanation
            </div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              Loading all historical records can cause performance degradation as the system grows. Introduce pagination and a bounded result size.
            </p>
          </div>

          <div className="pt-2 border-t border-[#172033] flex flex-wrap items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-400 text-[10px] font-mono">
              Performance • Reliability
            </span>

            <Link
              href="/chat/repo-1?findingId=CPAI-003"
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
            >
              <span>Ask AI about finding</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
