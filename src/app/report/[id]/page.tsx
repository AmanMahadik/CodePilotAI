'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, 
  ShieldCheck, 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  School, 
  GraduationCap,
  ExternalLink 
} from 'lucide-react';
import { getReviewById, getStoredReviews } from '@/lib/store';
import { Review } from '@/lib/types';

export default function PublicReportPage() {
  const params = useParams();
  const id = params?.id as string;
  const [review, setReview] = useState<Review | null>(null);
  const [includeBranding, setIncludeBranding] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getReviewById(id);
      if (found) {
        setReview(found);
      } else {
        const all = getStoredReviews();
        setReview(Object.values(all)[0] || null);
      }
    }
  }, [id]);

  if (!review) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <p>Loading certified report...</p>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      {/* Top Banner controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="publicBrandingToggle"
            checked={includeBranding}
            onChange={(e) => setIncludeBranding(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-600"
          />
          <label htmlFor="publicBrandingToggle" className="text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-brand-400" />
            Toggle College / Bootcamp Branding Header (FR-213)
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-brand-400" />}
            <span>{copied ? 'Link Copied!' : 'Copy Share Link (FR-212)'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF (FR-211)</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Sheet */}
      <div className="p-8 sm:p-12 rounded-2xl bg-[#090d16] border border-slate-800 shadow-2xl text-slate-200 space-y-8 print:border-none print:p-0">
        {/* Institutional Branding Header (FR-213) */}
        {includeBranding && (
          <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-brand-400 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Code Review Certificate</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">
                {review.institutionBranding?.institutionName || 'MIT Academy of Engineering, Alandi (D.), Pune'}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Student: <span className="text-white font-semibold">Aman Atmaram Mahadik</span> • PRN: 202502100006 • Roll No: 68 (Batch B3)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-brand-400 tracking-tight">CodePilot AI</span>
              <p className="text-[10px] text-slate-500 font-mono">Document CPA-PRD-001</p>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="md:col-span-3 space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Executive Assessment</span>
            <p className="text-xs leading-relaxed text-slate-300">
              {review.executiveSummary}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-brand-400">{review.scores.overall}/100</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 mt-1">Overall Health</span>
          </div>
        </div>

        {/* Detailed Findings List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Findings Rubric & Remediations</h3>
          {review.findings.map((f, i) => (
            <div key={f.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {i + 1}. {f.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {f.severity}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">{f.description}</p>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 text-brand-300 font-mono text-[11px]">
                Principle: {f.principleExplanation}
              </div>
              {f.suggestedFix && (
                <div className="text-emerald-300 font-mono text-[11px]">
                  Fix: {f.suggestedFix}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Signoff Footer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Certified by CodePilot AI Multi-Agent Engine • ISO 27001 Ready</span>
          <span>Share Token: {review.shareToken}</span>
        </div>
      </div>
    </div>
  );
}
