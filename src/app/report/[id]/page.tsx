'use client';

import React, { useState } from 'react';
import { Download, Check, Copy, School, ShieldCheck } from 'lucide-react';

export default function InstitutionalReportPage() {
  const [includeHeader, setIncludeHeader] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://codepilot.demo/reports/CPAI-2026-028?token=demo');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            SOCIETY_SYNC / REPORTING
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auditable engineering assessment and academic export.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export report</span>
        </button>
      </div>

      {/* Report Configuration Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Report configuration
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] font-mono text-[10px] font-bold">
            Ready to preview
          </span>
        </div>
        <p className="text-[11px] text-slate-400 -mt-2">
          Customize your institutional report identity.
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

        {/* Identity Box */}
        <div className="p-3.5 rounded-lg bg-[#0a0f1d] border border-[#172138] space-y-1 font-mono text-xs">
          <div className="text-[10px] text-slate-500 uppercase">Report identity</div>
          <div className="font-bold text-white">MIT Academy of Engineering, Pune</div>
          <div className="text-slate-400 text-[11px]">
            Aman Atmaram Mahadik • PRN: 202502100006
          </div>
          <div className="text-slate-400 text-[11px]">
            Roll No: 68 • Batch B3
          </div>
        </div>
      </div>

      {/* Main Report Document Sheet Preview */}
      <div className="rounded-xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl space-y-6 print:p-0 font-sans">
        {includeHeader && (
          <div className="text-center pb-6 border-b border-slate-300 space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-900">
              MIT Academy of Engineering, Pune
            </h2>
            <div className="text-[11px] font-mono text-slate-600 font-semibold uppercase tracking-wider">
              Computer Engineering • Software Engineering
            </div>
            <h3 className="text-lg font-black text-slate-900 pt-2 tracking-tight">
              SOFTWARE ENGINEERING QUALITY &amp; SECURITY ASSESSMENT
            </h3>
            <div className="text-[10px] font-mono text-slate-500 tracking-wider">
              CODEPILOT AI • TECHNICAL ANALYSIS REPORT
            </div>
          </div>
        )}

        {/* Meta Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 border-b border-slate-200 pb-3">
          <span>PROJECT: SOCIETY_SYNC</span>
          <span>REPORT ID: CPAI-2026-028</span>
        </div>

        {/* Executive Summary */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-900 uppercase font-mono">
            Executive Summary
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Multi-agent analysis completed across 124 source files in Society_Sync. The system demonstrated strong module decoupling and comprehensive documentation, but flagged 2 high-risk OWASP security vulnerabilities in authentication and resident access control handlers that require immediate remediation before production deployment.
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">Overall health score</div>
            <div className="text-3xl font-black text-slate-900 mt-1">92/100</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-[10px] uppercase font-mono text-slate-500">Open findings</div>
            <div className="text-3xl font-black text-slate-900 mt-1">07</div>
          </div>
        </div>

        {/* OWASP Top 10 Assessment Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-900 uppercase font-mono">
            OWASP Top 10 Assessment
          </div>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 font-mono text-[10px] text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5">CATEGORY</th>
                <th className="p-2.5">ASSESSMENT</th>
                <th className="p-2.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr>
                <td className="p-2.5 font-medium">A01 - Broken Access Control</td>
                <td className="p-2.5">Needs remediation</td>
                <td className="p-2.5 text-right font-bold text-rose-600">High</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">A03 - Injection</td>
                <td className="p-2.5">Vulnerability detected</td>
                <td className="p-2.5 text-right font-bold text-rose-700">Critical</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">A05 - Security Misconfiguration</td>
                <td className="p-2.5">Review recommended</td>
                <td className="p-2.5 text-right font-bold text-amber-600">Medium</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">A07 - Authentication Failures</td>
                <td className="p-2.5">Further validation</td>
                <td className="p-2.5 text-right font-bold text-amber-600">Medium</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Compliance and Verification Seal */}
        <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-600 flex flex-col items-center justify-center text-[8px] font-black font-mono text-emerald-700 shrink-0">
            <span>AI</span>
            <span>REVIEW</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Automated analysis completed</div>
            <div className="text-[10px] text-slate-500">
              This is a prototype assessment, not an independent certification or security audit.
            </div>
          </div>
        </div>

        <div className="text-center pt-2 text-[9px] font-mono text-slate-400">
          Generated by CodePilot AI • Academic demonstration • 2026
        </div>
      </div>

      {/* Shareable Report Link Card */}
      <div className="rounded-xl bg-[#0e1424] border border-[#1c2438] p-5 space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
          Shareable report link
        </h3>
        <p className="text-[11px] text-slate-400">
          Production implementation will issue a signed public token with expiry and access controls.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value="https://codepilot.demo/reports/CPAI-2026-028?token=demo"
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
