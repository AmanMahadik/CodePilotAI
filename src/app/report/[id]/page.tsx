'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Download, 
  Check, 
  Copy, 
  School, 
  ShieldCheck, 
  AlertCircle, 
  RotateCw, 
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { getReviewById, getLatestReview, getStoredReviews } from '@/lib/store';
import { Review } from '@/lib/types';

export default function InstitutionalReportPage() {
  const params = useParams();
  const reviewId = (params?.id as string) || 'default';
  const { user, role } = useAuth();
  const isFaculty = role === 'faculty';

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  const [includeHeader, setIncludeHeader] = useState(true);
  const [institution, setInstitution] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredReviews();
      const revList = Object.values(stored);
      setAllReviews(revList);

      const found = getReviewById(reviewId) || getLatestReview();
      if (found) {
        setReview(found);
        setReferenceId(found.id.toUpperCase());
        setInstitution(
          found.institutionBranding?.institutionName ||
          user?.user_metadata?.institution || 
          'Department of Computer Science & Engineering'
        );
        setCandidateName(
          found.institutionBranding?.studentName ||
          user?.user_metadata?.full_name || 
          'Aman Mahadik (DEV-001)'
        );
      }
      setLoading(false);
    }
  }, [reviewId, user]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono">Loading student audit report...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Report Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          No audit assessment exists for ID &quot;{reviewId}&quot;. Run an analysis on a repository to generate an official institutional report.
        </p>
        <Link
          href="/review/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          <span>Create review to generate report</span>
        </Link>
      </div>
    );
  }

  const criticalCount = review.findings?.filter((f) => f.severity === 'Critical').length || 0;
  const highCount = review.findings?.filter((f) => f.severity === 'High').length || 0;
  const mediumCount = review.findings?.filter((f) => f.severity === 'Medium').length || 0;
  const lowCount = review.findings?.filter((f) => f.severity === 'Low').length || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {isFaculty ? (
              <>
                <School className="w-3.5 h-3.5 text-[#3fb950]" />
                <span className="text-[#3fb950] font-semibold">FACULTY PORTAL • STUDENT AUDIT REPORTS</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="text-slate-400">{review.repositoryName.toUpperCase()} / AUDIT REPORT</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Institutional Audit Report</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30">
              Verified
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auditable engineering assessment and academic accreditation export for {review.repositoryName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={isFaculty ? "/faculty" : "/dashboard"}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#0e1424] hover:bg-[#151d33] border border-[#1c2438] text-xs font-medium text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{isFaculty ? 'Classroom Roster' : 'Overview'}</span>
          </Link>

          <Link
            href={`/interview/${review.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#161f33] hover:bg-[#1e2a45] border border-[#22304d] text-xs font-medium text-[#a371f7] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interview Viva</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Cohort Submission Navigation Bar if multiple reviews exist */}
      {allReviews.length > 1 && (
        <div className="p-3 rounded-xl bg-[#0e1424] border border-[#1c2438] flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Viewing Report:</span>
            <span className="text-white font-bold">{review.repositoryName}</span>
          </div>
          <div className="flex items-center gap-2">
            {allReviews.map((r) => (
              <Link
                key={r.id}
                href={`/report/${r.id}`}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  r.id === review.id
                    ? 'bg-[#1f6feb] text-white font-bold'
                    : 'bg-[#111728] text-slate-400 hover:text-white'
                }`}
              >
                {r.repositoryName}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Report Configuration Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Report configuration
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-mono text-[10px] font-bold">
            Ready to preview &amp; print
          </span>
        </div>
        <p className="text-[11px] text-slate-400 -mt-2">
          Customize your institutional report identity before saving or printing.
        </p>

        {/* Checkbox */}
        <label
          onClick={() => setIncludeHeader(!includeHeader)}
          className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none"
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              includeHeader
                ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                : 'border-slate-600 bg-transparent'
            }`}
          >
            {includeHeader && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span>Include institutional header</span>
        </label>

        {/* Identity Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Institution</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#0a0f1d] border border-[#172138] text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Candidate / Author</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#0a0f1d] border border-[#172138] text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1">Student / Reference ID</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#0a0f1d] border border-[#172138] text-white text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Report Document Sheet Preview */}
      <div className="rounded-xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl space-y-6 print:p-0 font-sans">
        {includeHeader && (
          <div className="text-center pb-6 border-b border-slate-300 space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-900">
              {institution || 'Department of Computer Science & Engineering'}
            </h2>
            <div className="text-[11px] font-mono text-slate-600 font-semibold uppercase tracking-wider">
              Author: {candidateName} • Roll / ID: {referenceId}
            </div>
            <h3 className="text-lg font-black text-slate-900 pt-2 tracking-tight">
              SOFTWARE ENGINEERING QUALITY &amp; SECURITY ASSESSMENT
            </h3>
            <div className="text-[10px] font-mono text-slate-500 tracking-wider">
              CODEPILOT AI • TECHNICAL CODE AUDIT REPORT (CPA-PRD-001)
            </div>
          </div>
        )}

        {/* Meta Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 border-b border-slate-200 pb-3">
          <span>PROJECT: {review.repositoryName.toUpperCase()} (branch: {review.branch})</span>
          <span>REPORT ID: {referenceId}</span>
        </div>

        {/* Executive Summary */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-900 uppercase font-mono">
            Executive Summary
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {review.executiveSummary ||
              `Multi-agent analysis completed across ${review.totalFilesAnalyzed} source files (${review.totalLinesOfCode} LOC) in ${review.repositoryName}. Code quality scored ${review.scores.quality}%, OWASP security evaluated at ${review.scores.security}%, and overall system health reached ${review.scores.overall}/100. ${criticalCount > 0 ? `Detected ${criticalCount} critical security finding(s) requiring remediation prior to production certification.` : 'No critical blocking security vulnerabilities were identified in the scanned codebase.'}`}
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">Overall health</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{review.scores.overall}/100</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">Open findings</div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {String(review.findings?.length || 0).padStart(2, '0')}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">Code quality</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{review.scores.quality}%</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">OWASP security</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{review.scores.security}%</div>
          </div>
        </div>

        {/* Findings Assessment Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-900 uppercase font-mono">
            Defect &amp; Vulnerability Audit
          </div>
          {!review.findings || review.findings.length === 0 ? (
            <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              Zero defects or security vulnerabilities detected in the analyzed repository files.
            </div>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 font-mono text-[10px] text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">CATEGORY / FINDING</th>
                  <th className="p-2.5">LOCATION</th>
                  <th className="p-2.5 text-right">SEVERITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {review.findings.map((finding) => (
                  <tr key={finding.id}>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">{finding.title}</div>
                      <div className="text-[10px] text-slate-500">{finding.owaspCategory || finding.category}</div>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-600">
                      {finding.file}:{finding.lineStart}
                    </td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded ${
                          finding.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-700 font-bold'
                            : finding.severity === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : finding.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Compliance and Verification Seal */}
        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex flex-col items-center justify-center text-[8px] font-black font-mono text-emerald-700 shrink-0">
            <span>AI</span>
            <span>REVIEW</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Automated multi-agent analysis certified</div>
            <div className="text-[10px] text-slate-500">
              Generated by CodePilot AI Multi-Agent Audit Engine for academic evaluation and progress records.
            </div>
          </div>
        </div>

        <div className="text-center pt-2 text-[9px] font-mono text-slate-400">
          Generated by CodePilot AI • {new Date().getFullYear()}
        </div>
      </div>

      {/* Shareable Report Link Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Shareable report link
        </h3>
        <p className="text-[11px] text-slate-400">
          Share this direct audit URL with professors, evaluators, or project reviewers.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={typeof window !== 'undefined' ? window.location.href : `https://codepilot.ai/report/${review.id}`}
            className="flex-1 px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs font-mono text-slate-300"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
