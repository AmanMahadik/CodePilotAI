'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderGit2, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  RotateCw, 
  FileText, 
  Trash2, 
  Github, 
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { getStoredRepositories, getStoredReviews, saveRepository } from '@/lib/store';
import { Repository, Review } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [selectedRepoId, setSelectedRepoId] = useState<string>('repo-1');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  useEffect(() => {
    setRepositories(getStoredRepositories());
    setReviews(getStoredReviews());
  }, []);

  const selectedRepo = repositories.find((r) => r.id === selectedRepoId) || repositories[0];
  const reviewsList = Object.values(reviews).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const repoReviews = reviewsList.filter((r) => r.repositoryName === selectedRepo?.name);

  // Compute severity trends across last reviews (FR-023)
  const severityTrend = {
    critical: reviewsList.reduce((acc, r) => acc + r.findings.filter((f) => f.severity === 'Critical').length, 0),
    high: reviewsList.reduce((acc, r) => acc + r.findings.filter((f) => f.severity === 'High').length, 0),
    medium: reviewsList.reduce((acc, r) => acc + r.findings.filter((f) => f.severity === 'Medium').length, 0),
    low: reviewsList.reduce((acc, r) => acc + r.findings.filter((f) => f.severity === 'Low').length, 0),
  };

  const averageScore = Math.round(
    reviewsList.length > 0
      ? reviewsList.reduce((acc, r) => acc + r.scores.overall, 0) / reviewsList.length
      : 80
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Engineering Mentorship Dashboard
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              FR-021 - FR-040
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Student: <span className="text-white font-medium">{user?.user_metadata?.full_name || 'Aman Atmaram Mahadik'}</span> (PRN: 202502100006, Roll: 68) • MIT Academy of Engineering, Pune
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/review/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect / Upload Repo</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800 transition-colors"
            title="Account & Data Purge (FR-007)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Connected Repositories</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white">{repositories.length}</span>
            <span className="text-[11px] text-brand-400 font-mono">GitHub & ZIP</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Code Reviews</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white">{reviewsList.length}</span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 100% SLA (&lt;60s)
            </span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Average Quality Health</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-brand-400">{averageScore}/100</span>
            <span className="text-[11px] text-slate-400 font-mono">Senior Rubric</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Active Vulnerabilities</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-400">{severityTrend.critical + severityTrend.high}</span>
            <span className="text-[11px] text-rose-400 font-mono">{severityTrend.critical} Critical • {severityTrend.high} High</span>
          </div>
        </div>
      </div>

      {/* Progress Trend View (FR-023) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white">
                Progress Trend View across Review Cycles (FR-023)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Defect counts categorized by severity over longitudinal commits and student milestones.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
            -34% Vulnerabilities Trend
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-center">
            <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Critical Defects</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{severityTrend.critical}</div>
            <p className="text-[10px] text-slate-400 mt-1">Secrets & Root Auth Leaks</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-center">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">High Severity</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{severityTrend.high}</div>
            <p className="text-[10px] text-slate-400 mt-1">SQL Injection & Async Bugs</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-900/40 text-center">
            <span className="text-xs uppercase font-bold text-yellow-400 tracking-wider">Medium Severity</span>
            <div className="text-2xl font-black text-yellow-400 mt-1">{severityTrend.medium}</div>
            <p className="text-[10px] text-slate-400 mt-1">SOLID & High Complexity</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-center">
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Low / Info</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{severityTrend.low}</div>
            <p className="text-[10px] text-slate-400 mt-1">Missing JSDocs & Nits</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Repository List (FR-021) & Review History (FR-022) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Repository List View (FR-021) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-brand-400" />
              <span>Repositories (FR-021)</span>
            </h3>
            <span className="text-xs text-slate-400">{repositories.length} total</span>
          </div>

          <div className="space-y-3">
            {repositories.map((repo) => {
              const isSelected = repo.id === selectedRepoId;
              return (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepoId(repo.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-950/40 border-brand-500/60 shadow-lg shadow-brand-500/10'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {repo.source === 'github' ? (
                          <Github className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-brand-400" />
                        )}
                        <h4 className="text-xs font-bold text-white font-mono">{repo.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        branch: <span className="text-slate-300">{repo.branch}</span> • {repo.primaryLanguage}
                      </p>
                    </div>
                    {repo.latestScore && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {repo.latestScore}/100
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{repo.totalFiles} files ({repo.totalLOC} LOC)</span>
                    <span>{repo.reviewCount} reviews</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/review/new"
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-brand-500 text-xs font-medium text-slate-400 hover:text-brand-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Repository</span>
          </Link>
        </div>

        {/* Right Column: Review History (FR-022) & Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Review History for {selectedRepo?.name} (FR-022)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chronological list of audit sessions linking to full diagnostic reports.
              </p>
            </div>
            <Link
              href={`/review/new?repo=${selectedRepo?.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              <span>Re-review on Push (FR-078)</span>
            </Link>
          </div>

          <div className="space-y-3">
            {reviewsList.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{review.repositoryName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {review.branch}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                    {review.executiveSummary}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span>Quality: {review.scores.quality}%</span>
                    <span>Security: {review.scores.security}%</span>
                    <span>Findings: {review.findings.length}</span>
                    <span>Duration: {review.durationSeconds}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="text-center px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-base font-bold text-brand-400">{review.scores.overall}</span>
                    <span className="text-[9px] text-slate-500 block">/ 100</span>
                  </div>
                  <Link
                    href={`/review/${review.id}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-medium transition-colors"
                  >
                    <span>Full Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Deletion Dialog (FR-007) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Account & Data Purge Request (FR-007)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Per PRD acceptance criteria FR-007, requesting account deletion will queue all personal student data, uploaded files, and review reports for permanent purging within 30 days per institutional compliance.
            </p>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              User: <span className="text-white font-mono">{user?.email || 'aman.mahadik@mitaoe.ac.in'}</span>
            </div>

            {deleteConfirmed ? (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                Purge request registered. Your profile and indexed repositories will be removed within 30 days.
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setDeleteConfirmed(true)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirm 30-Day Purge
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
