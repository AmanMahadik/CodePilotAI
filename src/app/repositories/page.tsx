'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, GitBranch, ArrowRight, ExternalLink, RefreshCw, Loader2, Github } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { Repository } from '@/lib/types';
import { fetchStudentGithubRepositories, getCachedRepositories } from '@/lib/github';

export default function RepositoriesPage() {
  const { user, session, signInWithGithub } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'connected' | 'languages'>('all');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [githubLinked, setGithubLinked] = useState<boolean>(true);

  const loadRepos = useCallback(async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    else setLoading(true);

    try {
      const { repos: loadedRepos, githubLinked: isLinked } = await fetchStudentGithubRepositories(
        user, 
        session
      );
      setRepos(loadedRepos);
      if (typeof isLinked === 'boolean') {
        setGithubLinked(isLinked);
      }
    } catch (e) {
      console.warn('Error loading repos:', e);
      setRepos(getCachedRepositories());
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [user, session]);

  useEffect(() => {
    loadRepos();
  }, [user, session]);

  const uniqueLanguages = Array.from(new Set(repos.map((r) => r.primaryLanguage || 'TypeScript')));

  const filteredRepos = repos.filter((r) => {
    if (activeFilter === 'languages') return Boolean(r.primaryLanguage);
    return true;
  });

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'typescript': return '#58a6ff';
      case 'javascript': return '#f0883e';
      case 'python': return '#3572A5';
      case 'java': return '#b07219';
      case 'c++':
      case 'cpp': return '#f34b7d';
      case 'go': return '#00ADD8';
      case 'html': return '#e34c26';
      default: return '#58a6ff';
    }
  };

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadRepos(true)}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#161f33] hover:bg-[#1e2a45] text-slate-300 hover:text-white text-xs font-semibold border border-[#22304d] transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#58a6ff]' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
          </button>

          <Link
            href="/review/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Import repository</span>
          </Link>
        </div>
      </div>

      {/* GitHub Account Link CTA (For password-only users) */}
      {!githubLinked && (
        <div className="p-4 rounded-xl bg-[#0e172a] border border-[#1e2e4f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Github className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Connect your GitHub Account</div>
              <div className="text-xs text-slate-400">
                Link your GitHub profile to unlock private repository reviews and automated multi-agent code analysis.
              </div>
            </div>
          </div>
          <button
            onClick={() => signInWithGithub()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
          >
            <Github className="w-4 h-4" />
            <span>Link GitHub Account</span>
          </button>
        </div>
      )}

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
          {repos.length} total
        </button>
        <button
          onClick={() => setActiveFilter('connected')}
          className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
            activeFilter === 'connected'
              ? 'bg-[#18233c] text-white border border-[#26375c]'
              : 'bg-[#101625] text-slate-400 hover:text-slate-200 border border-[#1c2438]'
          }`}
        >
          {repos.length} connected
        </button>
        <button
          onClick={() => setActiveFilter('languages')}
          className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
            activeFilter === 'languages'
              ? 'bg-[#18233c] text-white border border-[#26375c]'
              : 'bg-[#101625] text-slate-400 hover:text-slate-200 border border-[#1c2438]'
          }`}
        >
          {uniqueLanguages.length} languages
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
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172033]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2 text-[#58a6ff]" />
                    <span>Loading repositories from GitHub...</span>
                  </td>
                </tr>
              ) : filteredRepos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-mono">
                    No repositories found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredRepos.map((repo) => (
                  <tr key={repo.id} className="hover:bg-[#131b2e] transition-colors group">
                    <td className="py-3.5">
                      <Link href={`/review/new?url=${encodeURIComponent(repo.url || '')}&name=${encodeURIComponent(repo.name)}`} className="flex items-start gap-2.5">
                        <span className="w-3.5 h-3.5 mt-0.5 rounded border border-slate-600 inline-block shrink-0"></span>
                        <div>
                          <div className="font-semibold text-white group-hover:text-[#58a6ff] transition-colors text-xs flex items-center gap-2">
                            <span>{repo.name}</span>
                            {repo.url && (
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-500 hover:text-slate-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {repo.owner} / {repo.name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getLanguageColor(repo.primaryLanguage || 'TypeScript') }}
                        ></span>
                        <span>{repo.primaryLanguage || 'TypeScript'}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-[10px] font-mono text-slate-300">
                        <GitBranch className="w-2.5 h-2.5 text-slate-400" />
                        <span>{repo.branch}</span>
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border text-[#3fb950] bg-[#238636]/15 border-[#238636]/30">
                        {repo.latestScore || 88} / 100
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-400 font-mono">
                      {repo.lastReviewedAt || 'Connected'}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/review/new?url=${encodeURIComponent(repo.url || '')}&name=${encodeURIComponent(repo.name)}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#238636]/20 hover:bg-[#238636]/30 text-[#3fb950] border border-[#238636]/40 text-[11px] font-mono font-semibold transition-colors"
                      >
                        <span>Start Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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
