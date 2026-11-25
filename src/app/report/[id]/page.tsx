'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Download,
  Check,
  Copy,
  School,
  AlertCircle,
  RotateCw,
  FileText,
  HelpCircle,
  ChevronLeft,
  Printer,
  Upload,
  Loader2,
  ShieldCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { getReviewById, getLatestReview, getStoredReviews, getStoredRepositories } from '@/lib/store';
import { Review } from '@/lib/types';
import ReportDocument from '@/components/ReportDocument';
import {
  buildPdfFilename,
  computeReportSha256,
  ReportConfig,
  validateReportConfig,
} from '@/lib/report-utils';

export default function InstitutionalReportPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = (params?.id as string) || 'latest';
  const { user, role } = useAuth();
  const isFaculty = role === 'faculty';

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  // Report configuration state (Part D)
  const [includeHeader, setIncludeHeader] = useState(true);
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [batch, setBatch] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');

  // Export, share, and verification states
  const [sha256Hash, setSha256Hash] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredReviews();
      const revList = Object.values(stored);
      setAllReviews(revList);

      const found = getReviewById(reviewId) || getLatestReview();
      if (found) {
        setReview(found);
        const repos = getStoredRepositories();
        const matchingRepo = repos.find(
          (r) => r.id === found.repositoryId || r.name === found.repositoryName
        );

        let initialConfig: ReportConfig = {
          includeInstitutionalHeader: found.institutionBranding?.enabled ?? true,
          institution:
            found.institutionBranding?.institutionName ||
            (user?.user_metadata?.institution as string) ||
            '',
          department:
            found.institutionBranding?.department ||
            (user?.user_metadata?.department as string) ||
            '',
          candidateName:
            (user?.user_metadata?.full_name as string) ||
            found.institutionBranding?.studentName ||
            '',
          rollNumber:
            found.institutionBranding?.rollNo ||
            (user?.user_metadata?.roll_no as string) ||
            '',
          batch:
            found.institutionBranding?.batch ||
            (user?.user_metadata?.batch as string) ||
            '',
          referenceId: found.id.toUpperCase(),
          repositoryUrl: matchingRepo?.url || '',
        };

        // Load saved configuration overrides for this report if present
        try {
          const savedCfg = localStorage.getItem(`codepilot_report_config_${found.id}`);
          if (savedCfg) {
            initialConfig = { ...initialConfig, ...JSON.parse(savedCfg) };
          }
        } catch {}

        setIncludeHeader(initialConfig.includeInstitutionalHeader);
        setInstitution(initialConfig.institution);
        setDepartment(initialConfig.department);
        setCandidateName(initialConfig.candidateName);
        setRollNumber(initialConfig.rollNumber);
        setBatch(initialConfig.batch);
        setReferenceId(initialConfig.referenceId);
        setCommitHash(initialConfig.commitHash || '');
        setRepositoryUrl(initialConfig.repositoryUrl || '');
        setLogoDataUrl(initialConfig.logoDataUrl || '');
      }
      setLoading(false);
    }
  }, [reviewId, user]);

  const currentConfig: ReportConfig = {
    includeInstitutionalHeader: includeHeader,
    institution,
    department,
    candidateName,
    rollNumber,
    batch,
    referenceId,
    logoDataUrl: logoDataUrl || undefined,
    commitHash: commitHash || undefined,
    repositoryUrl: repositoryUrl || undefined,
  };

  // Persist config changes and recalculate SHA-256 hash dynamically
  useEffect(() => {
    if (!review) return;
    let active = true;

    try {
      localStorage.setItem(`codepilot_report_config_${review.id}`, JSON.stringify(currentConfig));
    } catch {}

    computeReportSha256(review, currentConfig).then((digest) => {
      if (active) {
        setSha256Hash(digest);
        if (typeof window !== 'undefined' && !verifyUrl) {
          setVerifyUrl(`${window.location.origin}/report/${review.id}/verify`);
        }
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    review,
    includeHeader,
    institution,
    department,
    candidateName,
    rollNumber,
    batch,
    referenceId,
    commitHash,
    repositoryUrl,
    logoDataUrl,
  ]);

  const validationIssues = validateReportConfig(currentConfig);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Logo image must be under 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyShareLink = async () => {
    if (!review) return;
    setValidationAttempted(true);
    if (validationIssues.length > 0) return;

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(review.id)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review,
          config: currentConfig,
          expiresInHours: 168, // 7-day share link
        }),
      });
      const data = await res.json();
      const targetUrl = data.verifyUrl || `${window.location.origin}/report/${review.id}/verify`;
      setVerifyUrl(targetUrl);
      setRevoked(false);
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const fallback = `${window.location.origin}/report/${review.id}/verify`;
      await navigator.clipboard.writeText(fallback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRevokeShareLink = async () => {
    if (!review) return;
    try {
      await fetch(`/api/reports/${encodeURIComponent(review.id)}/verify`, { method: 'DELETE' });
      setRevoked(true);
    } catch {}
  };

  const handleExportPdf = async () => {
    if (!review) return;
    setValidationAttempted(true);
    if (validationIssues.length > 0) {
      return;
    }

    setIsExporting(true);
    setExportStatus('Rendering A4 Institutional PDF via headless Chromium...');

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(review.id)}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review,
          config: currentConfig,
        }),
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = buildPdfFilename(review.repositoryName, review.createdAt);
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportStatus(null);
        setIsExporting(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data.code === 'CHROMIUM_UNAVAILABLE' && data.fallbackPrintUrl) {
        // On serverless runtimes without Chromium binary, open the dedicated clean print view
        setExportStatus('Opening clean print-ready A4 template...');
        window.open(data.fallbackPrintUrl, '_blank', 'noopener,noreferrer');
      } else {
        setExportStatus(data.error || 'Could not generate PDF on server. Opening clean print template.');
        window.open(`/report/${encodeURIComponent(review.id)}/print?autoprint=1`, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(`/report/${encodeURIComponent(review.id)}/print?autoprint=1`, '_blank', 'noopener,noreferrer');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono">Loading institutional audit report...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Audit Report Available</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          No audit assessment exists yet for ID &quot;{reviewId}&quot;. Run an analysis on a repository to generate an official institutional report.
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

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12 min-w-0">
      {/* Top Header */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between pb-2 gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            {isFaculty ? (
              <>
                <School className="w-3.5 h-3.5 text-[#3fb950]" />
                <span className="text-[#3fb950] font-semibold">FACULTY PORTAL • AUDIT REPORTS</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="text-slate-400 truncate">{review.repositoryName.toUpperCase()} / AUDIT REPORT</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>Institutional Audit Report</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30">
              SHA-256 Sealed
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Print-ready A4 assessment &amp; cryptographic verification for {review.repositoryName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={isFaculty ? '/faculty' : '/dashboard'}
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

          <Link
            href={`/report/${review.id}/print`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#161f33] hover:bg-[#1e2a45] border border-[#22304d] text-xs font-medium text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </Link>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Responsive Report Switcher (Prevents horizontal page overflow) */}
      {allReviews.length > 1 && (
        <div className="no-print p-3.5 rounded-xl bg-[#0e1424] border border-[#1c2438] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="text-xs text-slate-400 flex items-center gap-2 min-w-0">
            <span className="shrink-0">Viewing Report:</span>
            <span className="text-white font-semibold truncate">{review.repositoryName}</span>
            <span className="font-mono text-[11px] text-slate-500 shrink-0">
              ({review.scores.overall}/100)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="report-selector" className="text-[11px] text-slate-400 shrink-0">
              Switch report:
            </label>
            <select
              id="report-selector"
              value={review.id}
              onChange={(e) => router.push(`/report/${e.target.value}`)}
              className="max-w-[260px] px-3 py-1.5 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {allReviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.repositoryName} ({r.scores.overall}/100 • {new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Export status banner */}
      {exportStatus && (
        <div className="no-print p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
          <span>{exportStatus}</span>
        </div>
      )}

      {/* Report Configuration Form (Part D) */}
      <div className="no-print rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Report Configuration &amp; Validation
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Complete all required fields below. Placeholder values are blocked from PDF export.
            </p>
          </div>
          {validationIssues.length === 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-mono text-[10px] font-bold">
              Ready to Export PDF
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-700/50 text-amber-300 font-mono text-[10px] font-bold">
              {validationIssues.length} Field(s) Required
            </span>
          )}
        </div>

        {/* Validation Checklist Banner when attempting export with missing fields */}
        {validationAttempted && validationIssues.length > 0 && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-200 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Export blocked — fill in the following required fields:</span>
            </div>
            <ul className="list-disc pl-5 text-[11px] space-y-0.5 text-red-200">
              {validationIssues.map((issue) => (
                <li key={issue.field}>
                  <strong>{issue.label}:</strong> {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Institutional Header Toggle + Logo Upload */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeHeader}
              onChange={(e) => setIncludeHeader(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-[#070a12] text-blue-600"
            />
            <span>Include institutional header &amp; logo on Cover Page</span>
          </label>

          {includeHeader && (
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161f33] hover:bg-[#1e2a45] border border-[#22304d] text-[11px] text-slate-200 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{logoDataUrl ? 'Change Institution Logo' : 'Upload Institution Logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setLogoDataUrl('')}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 text-xs">
          {includeHeader && (
            <>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Institution Name *</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. MIT Academy of Engineering"
                  className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Department *</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Author / Candidate Name *</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Enter real full name"
              className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Roll / PRN Number *</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 202502108006"
              className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Batch / Cohort</label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="e.g. B.Tech TY-A"
              className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Report Reference ID *</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. AUDIT-2026-042"
              className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1">Commit Hash (optional)</label>
            <input
              type="text"
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
              placeholder="e.g. a1b2c3d4"
              className="w-full px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Live Preview of Exact A4 Print Template */}
      <div className="space-y-2">
        <div className="no-print flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-300">Live Print-Ready Document Preview (A4 Portrait)</span>
          <span className="font-mono text-[11px]">SHA-256: {sha256Hash.slice(0, 16)}…</span>
        </div>

        <ReportDocument
          review={review}
          config={currentConfig}
          sha256Hash={sha256Hash}
          verifyUrl={verifyUrl || `https://codepilot.ai/report/${review.id}/verify`}
        />
      </div>

      {/* Shareable & Cryptographically Verified Link Card */}
      <div className="no-print rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Read-Only Shareable &amp; Verified Link
            </h3>
          </div>
          {verifyUrl && !revoked && (
            <button
              type="button"
              onClick={handleRevokeShareLink}
              className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Revoke Link</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400">
          Generate an HMAC-signed, read-only verification URL (valid 7 days) allowing faculty or evaluators to verify the SHA-256 report digest online.
        </p>

        {revoked && (
          <div className="text-xs text-red-400 font-mono">
            Previous share link revoked. Click &quot;Generate &amp; Copy Link&quot; to issue a new token.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={verifyUrl}
            className="flex-1 px-3 py-2 rounded-lg bg-[#070a12] border border-[#1c2438] text-xs font-mono text-slate-300 min-w-0"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#161f33] hover:bg-[#1f2c49] border border-[#22304d] text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Signed & Copied!' : 'Generate & Copy Link'}</span>
            </button>

            {verifyUrl && (
              <a
                href={verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0a0f1d] hover:bg-[#161f33] border border-[#1c2438] text-xs text-blue-400"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
