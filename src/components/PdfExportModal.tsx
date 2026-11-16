'use client';

import React, { useState, useRef } from 'react';
import { Review } from '@/lib/types';
import { 
  Download, 
  Share2, 
  Check, 
  Copy, 
  X, 
  School, 
  ShieldCheck, 
  FileText, 
  Loader2,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfExportModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfExportModal({ review, isOpen, onClose }: PdfExportModalProps) {
  const [includeBranding, setIncludeBranding] = useState(
    review.institutionBranding?.enabled ?? true
  );
  const [institutionName, setInstitutionName] = useState(
    review.institutionBranding?.institutionName || 'MIT Academy of Engineering, Alandi (D.), Pune'
  );
  const [studentName, setStudentName] = useState(
    review.institutionBranding?.studentName || 'Candidate Author'
  );
  const [prnRoll, setPrnRoll] = useState(
    `Reference ID: ${review.institutionBranding?.rollNo || 'DEV-2026-001'} | Review Cycle`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/report/${review.id}` 
    : `/report/${review.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#090d16',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CodePilotAI-Report-${review.repositoryName}-${review.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to window.print() if html2canvas hits DOM issues
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-dark-900 border border-slate-700 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Export Executive Report (FR-211) & Share Link (FR-212)
              </h3>
              <p className="text-xs text-slate-400">
                Generate an academic/industry certified PDF review and shareable web link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Branding Toggle (FR-213) */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="brandingToggle"
                checked={includeBranding}
                onChange={(e) => setIncludeBranding(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="brandingToggle" className="text-xs font-medium text-slate-200 cursor-pointer flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-brand-400" />
                Include College/Bootcamp Branding Header (FR-213)
              </label>
            </div>

            {/* Share Link button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-brand-400" />}
              {copiedLink ? 'Share Link Copied!' : 'Copy Shareable Link (FR-212)'}
            </button>
          </div>

          {/* Branding customization fields if enabled */}
          {includeBranding && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Institution Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Student / Author Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">PRN / Roll No / Cohort</label>
                <input
                  type="text"
                  value={prnRoll}
                  onChange={(e) => setPrnRoll(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Printable/Canvas Preview Surface */}
        <div 
          ref={reportRef} 
          className="p-8 rounded-xl bg-[#090d16] border border-slate-800 text-slate-200 space-y-6"
        >
          {/* Institutional Header if active */}
          {includeBranding && (
            <div className="pb-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-400 tracking-wider uppercase">Academic Submission</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">Assignment 1 (A.Y. 2025-2026)</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{institutionName}</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{prnRoll} — Student: {studentName}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-brand-400 tracking-tight">CodePilot AI</span>
                <p className="text-[10px] text-slate-500 font-mono">CPA-PRD-001 / CPA-SRS-001</p>
              </div>
            </div>
          )}

          {/* Report Meta Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Repository Under Review:</span>
              <h3 className="text-base font-bold text-white font-mono">{review.repositoryName}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Branch: {review.branch} | Analyzed {review.totalFilesAnalyzed} files ({review.totalLinesOfCode} LOC)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="text-2xl font-black text-brand-400">{review.scores.overall}/100</div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Overall Health</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div>Quality: <span className="text-white font-semibold">{review.scores.quality}%</span></div>
                <div>Security: <span className="text-white font-semibold">{review.scores.security}%</span></div>
                <div>Reliability: <span className="text-white font-semibold">{review.scores.reliability}%</span></div>
                <div>Docs: <span className="text-white font-semibold">{review.scores.documentation}%</span></div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Executive Summary</h4>
            <p className="text-xs leading-relaxed text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              {review.executiveSummary}
            </p>
          </div>

          {/* Severity Counts Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Findings Breakdown</h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                <span className="text-lg font-bold text-rose-400">
                  {review.findings.filter((f) => f.severity === 'Critical').length}
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Critical</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40">
                <span className="text-lg font-bold text-amber-400">
                  {review.findings.filter((f) => f.severity === 'High').length}
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">High</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-900/40">
                <span className="text-lg font-bold text-yellow-400">
                  {review.findings.filter((f) => f.severity === 'Medium').length}
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Medium</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40">
                <span className="text-lg font-bold text-blue-400">
                  {review.findings.filter((f) => f.severity === 'Low').length}
                </span>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Low</p>
              </div>
            </div>
          </div>

          {/* Key Findings List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Findings Sample</h4>
            {review.findings.map((f, i) => (
              <div key={f.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">
                    {i + 1}. {f.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{f.file}:{f.lineStart}</span>
                </div>
                <p className="text-slate-400 text-[11px] mb-1.5">{f.description}</p>
                <div className="text-[10px] text-brand-300 font-mono">
                  Principle: {f.principleExplanation}
                </div>
              </div>
            ))}
          </div>

          {/* Report Footer */}
          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Generated on {new Date(review.createdAt).toLocaleDateString()} by CodePilot AI Swarm</span>
            <span>Ref: {review.shareToken}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isGenerating ? 'Generating PDF...' : 'Download Formatted PDF (FR-211)'}
          </button>
        </div>
      </div>
    </div>
  );
}
