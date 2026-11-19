'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  Layers,
  AlertTriangle,
  FolderGit2,
  FileCode,
  Info
} from 'lucide-react';
import { getReviewById, getLatestReview } from '@/lib/store';
import { Review, Finding } from '@/lib/types';

export default function CodeReviewDetailPage() {
  const params = useParams();
  const reviewId = (params?.id as string) || '';

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const found = getReviewById(reviewId);
      setReview(found || null);
      setLoading(false);
    }
  }, [reviewId]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono">Loading review analysis...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <FolderGit2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Review Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          There is no review available for review ID &quot;{reviewId}&quot;. Ingest a repository to trigger an automated multi-agent code analysis.
        </p>
        <Link
          href="/review/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          <span>Start new review</span>
        </Link>
      </div>
    );
  }

  const filteredFindings = (review.findings || []).filter((f) => {
    if (selectedSeverity === 'all') return true;
    return f.severity.toLowerCase() === selectedSeverity.toLowerCase();
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-[#da3633]/20 border-[#da3633]/40 text-[#ff7b72]';
      case 'high':
        return 'bg-[#f0883e]/20 border-[#f0883e]/40 text-[#f0883e]';
      case 'medium':
        return 'bg-[#e3b341]/20 border-[#e3b341]/40 text-[#e3b341]';
      default:
        return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#3fb950]';
    if (score >= 70) return 'text-[#58a6ff]';
    if (score >= 50) return 'text-[#e3b341]';
    return 'text-[#ff7b72]';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            {review.repositoryName.toUpperCase()} / CODE REVIEW
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Code Review
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-agent analysis • Analyzed {new Date(review.createdAt).toLocaleDateString()} at{' '}
            {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/chat/${review.repositoryId || review.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </Link>

          <Link
            href="/review/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Run review</span>
          </Link>
        </div>
      </div>

      {/* Meta Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-300">
          <GitBranch className="w-3 h-3 text-slate-400" />
          <span>{review.branch}</span>
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-bold capitalize">
          {review.status}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-400">
          {review.totalFilesAnalyzed} files • {review.totalLinesOfCode} LOC
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-400">
          {review.durationSeconds}s runtime
        </span>
      </div>

      {/* Multi-Agent Orchestration Bar (4 Agents in landscape) */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-4">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
          Multi-agent orchestration
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(review.agents && review.agents.length > 0) ? (
            review.agents.map((agent, idx) => (
              <div key={agent.agentType || idx} className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  0{idx + 1} - {agent.agentType.toUpperCase()}
                </div>
                <div className="text-xs font-bold text-white truncate">{agent.name}</div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                  <span className="capitalize">{agent.status}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {agent.durationMs ? `${(agent.durationMs / 1000).toFixed(1)}s` : '0.8s'} • {agent.findingsCount} findings
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">01 - INGESTION</div>
                <div className="text-xs font-bold text-white">Repository Agent</div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                  <span>Completed</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">1.2s • {review.totalFilesAnalyzed} files</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">02 - QUALITY</div>
                <div className="text-xs font-bold text-white">Quality Agent</div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                  <span>Completed</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">2.1s • {review.findings.filter(f => f.agentType === 'quality').length} findings</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">03 - SECURITY</div>
                <div className="text-xs font-bold text-white">Security Agent</div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                  <span>Completed</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">2.4s • {review.findings.filter(f => f.agentType === 'security').length} findings</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">04 - DOCUMENTATION</div>
                <div className="text-xs font-bold text-white">Documentation Agent</div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#3fb950] pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
                  <span>Completed</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">0.6s • Verified</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5 Score Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Overall health</span>
          <div className={`text-3xl font-extrabold ${getScoreColor(review.scores.overall)} mt-1 font-mono`}>
            {review.scores.overall}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">/100</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Code quality</span>
          <div className={`text-3xl font-extrabold ${getScoreColor(review.scores.quality)} mt-1 font-mono`}>
            {review.scores.quality}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">OWASP security</span>
          <div className={`text-3xl font-extrabold ${getScoreColor(review.scores.security)} mt-1 font-mono`}>
            {review.scores.security}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Reliability</span>
          <div className={`text-3xl font-extrabold ${getScoreColor(review.scores.reliability)} mt-1 font-mono`}>
            {review.scores.reliability}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1424] border border-[#1c2438]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Documentation</span>
          <div className={`text-3xl font-extrabold ${getScoreColor(review.scores.documentation)} mt-1 font-mono`}>
            {review.scores.documentation}%
          </div>
        </div>
      </div>

      {/* Findings Section */}
      <div className="space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-3">
          <div className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Findings • {filteredFindings.length} {filteredFindings.length === 1 ? 'issue' : 'issues'}
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
              <option value="low">Low</option>
            </select>

            <Link
              href={`/report/${review.id}`}
              className="px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
            >
              Export report
            </Link>
          </div>
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-8 text-center">
            <Check className="w-8 h-8 text-[#3fb950] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No findings in this category</h4>
            <p className="text-xs text-slate-400 mt-1">
              Your codebase passed checks for the selected filter.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div key={finding.id} className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${getSeverityBadge(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-300 text-[10px] font-mono capitalize">
                    {finding.category || finding.agentType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{finding.id}</span>
                </div>
                {finding.owaspCategory && (
                  <span className="text-[10px] font-mono text-slate-400">{finding.owaspCategory}</span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">
                  {finding.title}
                </h3>
                <div className="text-[11px] font-mono text-[#58a6ff] mt-0.5">
                  {finding.file}:{finding.lineStart}-{finding.lineEnd}
                </div>
              </div>

              {/* Code Snippet / Diff Box */}
              {finding.diff ? (
                <div className="rounded-lg bg-[#070a12] border border-[#172033] p-3 text-xs font-mono space-y-1">
                  <div className="bg-[#da3633]/20 text-[#ff7b72] px-2 py-1 rounded">
                    - {finding.diff.original}
                  </div>
                  <div className="bg-[#238636]/20 text-[#3fb950] px-2 py-1 rounded">
                    + {finding.diff.modified}
                  </div>
                </div>
              ) : finding.codeSnippet ? (
                <div className="rounded-lg bg-[#070a12] border border-[#172033] p-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
                  {finding.codeSnippet}
                </div>
              ) : null}

              {/* Senior Engineer Explanation */}
              {(finding.principleExplanation || finding.description) && (
                <div className="p-3.5 rounded-lg bg-[#0b101d] border border-[#1c2438] text-xs space-y-1">
                  <div className="text-[11px] font-bold text-[#e3b341] font-mono uppercase tracking-wider">
                    Senior Engineer Explanation
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11.5px]">
                    {finding.principleExplanation || finding.description}
                  </p>
                </div>
              )}

              {/* Suggested fix */}
              {finding.suggestedFix && (
                <div className="p-3.5 rounded-lg bg-[#0b101d] border border-[#1c2438] text-xs space-y-2">
                  <div className="text-[11px] font-bold text-[#3fb950] font-mono uppercase tracking-wider">
                    Suggested Remediation
                  </div>
                  <p className="text-slate-300 text-xs">
                    {finding.suggestedFix}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-[#172033] flex flex-wrap items-center justify-between gap-3">
                <span className="px-2 py-0.5 rounded-full bg-[#161f33] border border-[#22304d] text-slate-400 text-[10px] font-mono">
                  {finding.owaspCategory || `${finding.severity} Severity issue`}
                </span>

                <div className="flex items-center gap-2">
                  {finding.suggestedFix && (
                    <button
                      onClick={() => handleCopy(finding.id, finding.suggestedFix || '')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
                    >
                      {copiedId === finding.id ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === finding.id ? 'Copied' : 'Copy fix'}</span>
                    </button>
                  )}

                  <Link
                    href={`/chat/${review.repositoryId || review.id}?findingId=${finding.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>Ask AI about finding</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
