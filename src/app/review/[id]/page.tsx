'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Download, 
  Terminal, 
  Share2, 
  RotateCw, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronRight,
  Filter,
  Layers,
  GraduationCap
} from 'lucide-react';
import { getReviewById, getStoredReviews } from '@/lib/store';
import { Review, Finding, Severity } from '@/lib/types';
import MultiAgentPipeline from '@/components/MultiAgentPipeline';
import FindingCard from '@/components/FindingCard';
import PdfExportModal from '@/components/PdfExportModal';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params?.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [activeTab, setActiveTab] = useState<'findings' | 'docs' | 'security' | 'summary'>('findings');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);

  useEffect(() => {
    if (reviewId) {
      const found = getReviewById(reviewId);
      if (found) {
        setReview(found);
      } else {
        const all = getStoredReviews();
        const first = Object.values(all)[0];
        if (first) setReview(first);
      }
    }
  }, [reviewId]);

  if (!review) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <div className="text-center space-y-2">
          <p className="text-sm">Review session not found or loading...</p>
          <Link href="/dashboard" className="text-xs text-brand-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredFindings = review.findings.filter((f) => {
    if (selectedSeverity === 'all') return true;
    return f.severity.toLowerCase() === selectedSeverity.toLowerCase();
  });

  const securityFindings = review.findings.filter((f) => f.category === 'security');

  const handleCopyReadme = () => {
    if (review.readmeDraft) {
      navigator.clipboard.writeText(review.readmeDraft);
      setCopiedReadme(true);
      setTimeout(() => setCopiedReadme(false), 2000);
    }
  };

  const handleDownloadReadme = () => {
    if (!review.readmeDraft) return;
    const blob = new Blob([review.readmeDraft], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `README-${review.repositoryName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Academic & Review Meta Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300 font-mono border border-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
              <span>MIT AOE • Roll 68 (Aman Mahadik)</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
              CPA-SRS-001 Verified
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Completed in {review.durationSeconds}s (P95 SLA)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{review.repositoryName}</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              branch: {review.branch}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Skill-Level Calibrated: <span className="text-brand-300 font-semibold capitalize">{review.skillLevel}</span> (FR-075) • Analyzed {review.totalFilesAnalyzed} files ({review.totalLinesOfCode} LOC)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/chat/${review.repositoryId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Terminal className="w-4 h-4 text-brand-400" />
            <span>Repo AI Chat (FR-121)</span>
          </Link>

          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export Certified PDF (FR-211)</span>
          </button>
        </div>
      </div>

      {/* Score Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-brand-500/40 text-center flex flex-col justify-center items-center bg-brand-950/20">
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Overall Health Score</span>
          <div className="text-4xl font-black text-brand-400 mt-2">{review.scores.overall}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-1">/ 100 Index</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400">Code Quality & Style</span>
          <div className="text-2xl font-bold text-white mt-1">{review.scores.quality}%</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">SOLID & Maintainability</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400">Security & Secrets</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{review.scores.security}%</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">OWASP Top 10 Mapped</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400">Reliability & Runtime</span>
          <div className="text-2xl font-bold text-white mt-1">{review.scores.reliability}%</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Async & Bug Patterns</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400">Documentation Coverage</span>
          <div className="text-2xl font-bold text-white mt-1">{review.scores.documentation}%</div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">README & JSDoc Health</p>
        </div>
      </div>

      {/* Multi-Agent Orchestration Pipeline (FR-071) */}
      <MultiAgentPipeline agents={review.agents} />

      {/* Section Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('findings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'findings'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>All Findings ({review.findings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>OWASP & Secrets ({securityFindings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'docs'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Documentation Agent (FR-151, FR-152)</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Executive Summary</span>
        </button>
      </div>

      {/* Tab 1: Findings List */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Severity Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-brand-400" />
              <span>Filter by Severity:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    selectedSeverity === sev
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                repositoryId={review.repositoryId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: OWASP & Security Scan (FR-191, FR-192, FR-193) */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                OWASP Top 10 Security Audit & Secrets Detection (FR-191, FR-192)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every flagged security vulnerability maps to canonical OWASP classes so students and engineering teams learn standard threat models rather than superficial symptoms.
            </p>
          </div>

          <div className="space-y-4">
            {securityFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                repositoryId={review.repositoryId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Documentation Agent (FR-151, FR-152) */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* README Draft Section (FR-151) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  <span>Auto-Drafted Production README (FR-151)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated from repository AST structure, routes, and dependency manifest.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReadme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  {copiedReadme ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedReadme ? 'Copied Markdown' : 'Copy Markdown'}
                </button>
                <button
                  onClick={handleDownloadReadme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download README.md</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {review.readmeDraft || '# README Generated'}
            </pre>
          </div>

          {/* Inline Comment Suggestions (FR-152) */}
          {review.inlineDocSuggestions && review.inlineDocSuggestions.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Suggested Inline JSDoc / Docstrings (FR-152)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-complexity public functions and interfaces lacking descriptive contract comments.
                </p>
              </div>

              <div className="space-y-3">
                {review.inlineDocSuggestions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-brand-300 font-bold">{item.functionName}()</span>
                      <span className="text-slate-500">{item.file}:L{item.line}</span>
                    </div>
                    <pre className="text-slate-300 text-[11px] bg-slate-950 p-3 rounded-lg overflow-x-auto">
                      {item.suggestedDoc}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Executive Summary */}
      {activeTab === 'summary' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white">Staff Engineer Executive Summary</h3>
          <p className="text-xs leading-relaxed text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {review.executiveSummary}
          </p>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive Summary to Certified PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* PDF Export & Share Modal (FR-211, FR-212, FR-213) */}
      <PdfExportModal
        review={review}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
}
