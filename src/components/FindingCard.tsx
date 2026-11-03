'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Finding, Severity } from '@/lib/types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  FileCode, 
  Lightbulb, 
  Wrench, 
  MessageSquare, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface FindingCardProps {
  finding: Finding;
  repositoryId?: string;
}

export default function FindingCard({ finding, repositoryId = 'repo-1' }: FindingCardProps) {
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const handleCopyFix = () => {
    if (finding.suggestedFix) {
      navigator.clipboard.writeText(finding.suggestedFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all shadow-lg">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Badge (FR-072) */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(finding.severity)}`}>
            {finding.severity}
          </span>

          {/* Finding ID */}
          <span className="text-[11px] font-mono text-slate-500">
            #{finding.id}
          </span>

          {/* OWASP Category Tag (FR-191) */}
          {finding.owaspCategory && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-mono flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              {finding.owaspCategory}
            </span>
          )}

          {/* Secrets Detection Tag (FR-192) */}
          {finding.secretsPattern && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-mono flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Secrets Detected: {finding.secretsPattern}
            </span>
          )}

          {/* CVE tag (FR-193) */}
          {finding.cveId && (
            <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[11px] font-mono">
              {finding.cveId}
            </span>
          )}
        </div>

        {/* Location (FR-074) */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
          <FileCode className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-slate-300 font-medium">{finding.file}</span>
          <span className="text-slate-500">:L{finding.lineStart}-L{finding.lineEnd}</span>
        </div>
      </div>

      {/* Title & Description */}
      <h4 className="text-base font-semibold text-white mb-2 leading-snug">
        {finding.title}
      </h4>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {finding.description}
      </p>

      {/* Code Snippet (FR-074) */}
      <div className="mb-4 rounded-lg overflow-hidden border border-slate-800 bg-dark-900 text-xs font-mono">
        <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Source Snippet ({finding.file} lines {finding.lineStart}–{finding.lineEnd})</span>
          <span className="text-slate-500">Read-only context</span>
        </div>
        <pre className="p-3.5 text-slate-200 overflow-x-auto leading-relaxed text-[11.5px] bg-[#0c101b]">
          <code>{finding.codeSnippet}</code>
        </pre>
      </div>

      {/* Plain-Language Principle Explanation (FR-073) */}
      <div className="mb-4 p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200 flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block mb-0.5">Why this matters (Senior Engineer's Note):</span>
          <p className="leading-relaxed text-slate-300">{finding.principleExplanation}</p>
        </div>
      </div>

      {/* Suggested Fix (FR-172) & Diff */}
      {finding.suggestedFix && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Wrench className="w-3.5 h-3.5" />
              <span>Recommended Fix (FR-172)</span>
            </div>
            <button
              onClick={handleCopyFix}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-[10px] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Fix'}
            </button>
          </div>
          <p className="text-slate-300 text-[11.5px] leading-relaxed mb-2">
            {finding.suggestedFix}
          </p>

          {finding.diff && (
            <div>
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-medium"
              >
                {showDiff ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showDiff ? 'Hide Code Diff' : 'View Code Diff (Before / After)'}
              </button>

              {showDiff && (
                <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/40">
                    <div className="text-[10px] text-rose-400 font-bold mb-1">- Before (Vulnerable/Defect)</div>
                    <pre className="text-rose-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {finding.diff.original}
                    </pre>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/40">
                    <div className="text-[10px] text-emerald-400 font-bold mb-1">+ After (Remediated)</div>
                    <pre className="text-emerald-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {finding.diff.modified}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions footer: Anchor to AI Chat (FR-122) */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <Link
          href={`/chat/${repositoryId}?findingId=${finding.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-medium transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask AI about #{finding.id} (FR-122)</span>
        </Link>
        <span className="text-[11px] text-slate-500 font-mono">Agent: {finding.agentType}</span>
      </div>
    </div>
  );
}
