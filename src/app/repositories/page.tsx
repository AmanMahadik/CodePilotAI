'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, GitBranch, ArrowRight, ExternalLink } from 'lucide-react';

export default function RepositoriesPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'connected' | 'languages'>('all');

  const repos = [
    {
      id: 'repo-1',
      name: 'Society_Sync',
      owner: 'amanmahadik',
      repoName: 'Society_Sync',
      language: 'TypeScript',
      langColor: '#58a6ff',
      branch: 'main',
      score: '92 / 100',
      scoreColor: 'text-[#3fb950] bg-[#238636]/15 border-[#238636]/30',
      findings: '4 open',
      lastReview: '12 min ago',
    },
    {
      id: 'repo-2',
      name: 'Hyperlocal-Civic',
      owner: 'amanmahadik',
      repoName: 'civic-reporter',
      language: 'JavaScript',
      langColor: '#f0883e',
      branch: 'main',
      score: '78 / 100',
      scoreColor: 'text-[#f0883e] bg-[#bb8009]/15 border-[#bb8009]/30',
      findings: '12 open',
      lastReview: 'Yesterday',
    },
    {
      id: 'repo-3',
      name: 'Campus-Connect',
      owner: 'amanmahadik',
      repoName: 'campus-connect',
      language: 'Java',
      langColor: '#d29922',
      branch: 'develop',
      score: '88 / 100',
      scoreColor: 'text-[#3fb950] bg-[#238636]/15 border-[#238636]/30',
      findings: '7 open',
      lastReview: '2 days ago',
    },
    {
      id: 'repo-4',
      name: 'Energy-Saver',
      owner: 'amanmahadik',
      repoName: 'energy-saver',
      language: 'TypeScript',
      langColor: '#58a6ff',
      branch: 'main',
      score: '85 / 100',
      scoreColor: 'text-[#e3b341] bg-[#bb8009]/15 border-[#bb8009]/30',
      findings: '5 open',
      lastReview: '4 days ago',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            WORKSPACE / REPOSITORIES
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Repositories
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage projects connected to CodePilot AI.
          </p>
        </div>

        <Link
          href="/review/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Import repository</span>
        </Link>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
            activeFilter === 'all'
              ? 'bg-[#18233c] text-white border border-[#26375c]'
              : 'bg-[#101625] text-slate-400 hover:text-slate-200 border border-[#1c2438]'
          }`}
        >
          4 total
        </button>
        <button
          onClick={() => setActiveFilter('connected')}
          className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
            activeFilter === 'connected'
              ? 'bg-[#18233c] text-white border border-[#26375c]'
              : 'bg-[#101625] text-slate-400 hover:text-slate-200 border border-[#1c2438]'
          }`}
        >
          4 connected
        </button>
        <button
          onClick={() => setActiveFilter('languages')}
          className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
            activeFilter === 'languages'
              ? 'bg-[#18233c] text-white border border-[#26375c]'
              : 'bg-[#101625] text-slate-400 hover:text-slate-200 border border-[#1c2438]'
          }`}
        >
          3 languages
        </button>
      </div>

      {/* Repositories Main Table */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-mono text-slate-400 border-b border-[#1c2438]">
                <th className="pb-3 font-semibold">REPOSITORY</th>
                <th className="pb-3 font-semibold">LANGUAGE</th>
                <th className="pb-3 font-semibold">BRANCH</th>
                <th className="pb-3 font-semibold">HEALTH SCORE</th>
                <th className="pb-3 font-semibold">FINDINGS</th>
                <th className="pb-3 font-semibold text-right">LAST REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033]">
              {repos.map((repo) => (
                <tr key={repo.id} className="hover:bg-[#131b2e] transition-colors group">
                  <td className="py-3.5">
                    <Link href={`/review/rev-1`} className="flex items-start gap-2.5">
                      <span className="w-3.5 h-3.5 mt-0.5 rounded border border-slate-600 inline-block shrink-0"></span>
                      <div>
                        <div className="font-semibold text-white group-hover:text-[#58a6ff] transition-colors text-xs">
                          {repo.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {repo.owner} / {repo.repoName}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.langColor }}></span>
                      <span>{repo.language}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-[10px] font-mono text-slate-300">
                      <GitBranch className="w-2.5 h-2.5 text-slate-400" />
                      <span>{repo.branch}</span>
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${repo.scoreColor}`}>
                      {repo.score}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-slate-300 font-mono font-medium">
                    {repo.findings}
                  </td>
                  <td className="py-3.5 text-right text-[11px] text-slate-400 font-mono">
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
          <div className="w-64 h-1.5 rounded-full bg-[#1c2438] overflow-hidden">
            <div className="w-24 h-full bg-slate-400 rounded-full"></div>
          </div>
          <button className="text-slate-500 hover:text-slate-300 text-xs">▶</button>
        </div>
      </div>

      {/* Repository Health Distribution Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Repository health distribution
        </h4>

        {/* Segmented bar */}
        <div className="w-full h-3 rounded-md bg-[#161f33] flex overflow-hidden">
          <div className="w-3/4 bg-[#238636] h-full" title="3 healthy"></div>
          <div className="w-1/4 bg-[#d29922] h-full" title="1 needs attention"></div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-[#3fb950] font-semibold">3 healthy</span>
          <span className="text-[#f0883e] font-semibold">1 needs attention</span>
        </div>
      </div>
    </div>
  );
}
