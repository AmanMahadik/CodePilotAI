'use client';

import React, { useMemo } from 'react';
import { Review, Finding } from '@/lib/types';
import { generateQrSvg } from '@/lib/qr';
import { getGradeVerdict, ReportConfig, sortFindingsBySeverity } from '@/lib/report-utils';

interface ReportDocumentProps {
  review: Review;
  config: ReportConfig;
  sha256Hash: string;
  verifyUrl: string;
  generatedAtUtc?: string;
}

function getSeverityChip(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { color: '#B91C1C', backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', label: 'Critical' };
    case 'high':
      return { color: '#C2410C', backgroundColor: '#FFEDD5', borderColor: '#FDBA74', label: 'High' };
    case 'medium':
      return { color: '#B45309', backgroundColor: '#FEF3C7', borderColor: '#FCD34D', label: 'Medium' };
    case 'low':
      return { color: '#1D4ED8', backgroundColor: '#DBEAFE', borderColor: '#93C5FD', label: 'Low' };
    default:
      return { color: '#475569', backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', label: 'Info' };
  }
}

export default function ReportDocument({
  review,
  config,
  sha256Hash,
  verifyUrl,
  generatedAtUtc,
}: ReportDocumentProps) {
  const sortedFindings = useMemo(
    () => sortFindingsBySeverity(review.findings || []),
    [review.findings]
  );

  const criticalCount = sortedFindings.filter((f) => f.severity === 'Critical').length;
  const highCount = sortedFindings.filter((f) => f.severity === 'High').length;
  const mediumCount = sortedFindings.filter((f) => f.severity === 'Medium').length;
  const lowCount = sortedFindings.filter((f) => f.severity === 'Low').length;
  const infoCount = sortedFindings.filter((f) => f.severity === 'Informational').length;

  const { grade, verdict } = getGradeVerdict(review.scores.overall, criticalCount);
  const topRisks = sortedFindings.slice(0, 3);
  const needsToc = sortedFindings.length >= 6;

  const immediateActions = sortedFindings.filter(
    (f) => f.severity === 'Critical' || f.severity === 'High'
  );
  const shortTermActions = sortedFindings.filter((f) => f.severity === 'Medium');
  const longTermActions = sortedFindings.filter(
    (f) => f.severity === 'Low' || f.severity === 'Informational'
  );

  const qrSvgMarkup = useMemo(() => generateQrSvg(verifyUrl, 108), [verifyUrl]);

  const timestampUtc = generatedAtUtc || new Date(review.createdAt).toISOString();
  const reviewDateFormatted = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const executiveProse =
    review.executiveSummary && review.executiveSummary.length > 60
      ? review.executiveSummary
      : `CodePilot AI performed an automated multi-agent static and security evaluation of ${review.repositoryName} (${review.branch} branch) covering ${review.totalFilesAnalyzed} source files and ${review.totalLinesOfCode.toLocaleString()} lines of code. The repository achieved an overall engineering health score of ${review.scores.overall}/100 (Grade ${grade}), with code quality rated at ${review.scores.quality}% and OWASP security compliance at ${review.scores.security}%. The inspection identified ${sortedFindings.length} finding(s) across architecture, maintainability, and security rulesets (${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium, ${lowCount} Low). ${
          criticalCount + highCount > 0
            ? 'Immediate remediation of critical and high-severity findings is recommended prior to production release or academic sign-off.'
            : 'No critical blocking security defects were detected, confirming solid foundational software engineering practices.'
        }`;

  return (
    <div className="report-document-sheet relative rounded-xl bg-white text-[#111827] p-8 sm:p-12 shadow-2xl border border-slate-200 overflow-hidden">
      {/* Subtle Watermark (Visible on Print and Faint on Preview) */}
      <div
        aria-hidden="true"
        className="report-watermark-fixed hidden print:flex items-center justify-center pointer-events-none select-none"
      >
        <span
          style={{
            transform: 'rotate(-35deg)',
            fontSize: '46pt',
            fontWeight: 800,
            color: '#1D4ED8',
            opacity: 0.04,
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          CodePilot AI Verified
        </span>
      </div>

      {/* =================================================================== */}
      {/* 1. COVER PAGE                                                       */}
      {/* =================================================================== */}
      <section className="space-y-6 pb-8 border-b-2 border-slate-200 print:min-h-[245mm] print:flex print:flex-col print:justify-between print:border-b-0 print:pb-0">
        <div className="space-y-6">
          {config.includeInstitutionalHeader && (config.institution || config.department) && (
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
              {config.logoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logoDataUrl}
                  alt="Institution Logo"
                  className="h-14 max-w-[120px] object-contain"
                />
              )}
              <div>
                {config.institution && (
                  <h2 className="text-[13pt] font-bold text-[#111827] leading-snug">
                    {config.institution}
                  </h2>
                )}
                {config.department && (
                  <p className="text-[10.5pt] text-slate-600">{config.department}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <span className="inline-block px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-[#1D4ED8] text-[9pt] font-semibold">
              Technical Code Audit Report
            </span>
            <h1 className="text-[22pt] sm:text-[26pt] font-extrabold text-[#111827] leading-tight tracking-tight">
              Software Engineering Quality &amp; Security Assessment
            </h1>
            <p className="text-[11.5pt] text-slate-600 leading-relaxed">
              Automated multi-agent static analysis, OWASP Top 10 vulnerability inspection, and engineering quality assessment for{' '}
              <strong className="text-[#111827]">{review.repositoryName}</strong>.
            </p>
          </div>

          {/* Grade Hero Card */}
          <div className="report-avoid-break flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-md border border-slate-300 border-l-4 border-l-[#1D4ED8] bg-slate-50">
            <div className="sm:pr-6 sm:border-r border-slate-300 text-left sm:text-center min-w-[110px]">
              <div className="text-[24pt] font-extrabold text-[#1D4ED8] leading-none">
                {review.scores.overall}/100
              </div>
              <div className="text-[9.5pt] font-bold text-slate-700 mt-1">Grade {grade}</div>
            </div>
            <div>
              <div className="text-[9pt] font-bold text-[#1D4ED8] mb-0.5">Assessment Verdict</div>
              <div className="text-[10.5pt] font-semibold text-[#111827]">{verdict}</div>
            </div>
          </div>

          {/* Cover Metadata Grid */}
          <div className="report-avoid-break grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-md border border-slate-200 bg-white">
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">Project / Repository</div>
              <div className="text-[10.5pt] font-semibold text-[#111827] break-words">
                {review.repositoryName}
              </div>
            </div>
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">
                Branch{config.commitHash ? ' & Commit' : ''}
              </div>
              <div className="report-mono font-semibold text-[#111827] break-words">
                {review.branch}
                {config.commitHash ? ` @ ${config.commitHash.slice(0, 10)}` : ''}
              </div>
            </div>
            {config.candidateName && (
              <div>
                <div className="text-[8.5pt] font-semibold text-slate-500">Author / Candidate</div>
                <div className="text-[10.5pt] font-semibold text-[#111827] break-words">
                  {config.candidateName}
                </div>
              </div>
            )}
            {config.rollNumber && (
              <div>
                <div className="text-[8.5pt] font-semibold text-slate-500">Roll / PRN Number</div>
                <div className="report-mono font-semibold text-[#111827] break-words">
                  {config.rollNumber}
                </div>
              </div>
            )}
            {config.batch && (
              <div>
                <div className="text-[8.5pt] font-semibold text-slate-500">Cohort / Batch</div>
                <div className="text-[10.5pt] font-semibold text-[#111827]">{config.batch}</div>
              </div>
            )}
            {config.referenceId && (
              <div>
                <div className="text-[8.5pt] font-semibold text-slate-500">Report Reference ID</div>
                <div className="report-mono font-semibold text-[#111827] break-words">
                  {config.referenceId}
                </div>
              </div>
            )}
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">Audit Date (UTC)</div>
              <div className="text-[10.5pt] font-semibold text-[#111827]">{reviewDateFormatted}</div>
            </div>
            {config.repositoryUrl && (
              <div>
                <div className="text-[8.5pt] font-semibold text-slate-500">Source URL</div>
                <div className="report-mono text-[8.5pt] text-[#111827] break-all">
                  {config.repositoryUrl}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[8.5pt] text-slate-500">
          <span>
            <strong className="text-slate-700">Generated by CodePilot AI</strong> • Multi-Agent Audit Engine
          </span>
          <span className="report-mono text-[8pt]">SHA-256: {sha256Hash.slice(0, 16)}…</span>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. EXECUTIVE SUMMARY                                                */}
      {/* =================================================================== */}
      <section className="report-page-break pt-6 space-y-5">
        {needsToc && (
          <div className="report-avoid-break p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
            <h2 className="text-[12pt] font-bold text-[#111827]">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9.5pt]">
              <a href="#exec-summary" className="text-[#1D4ED8] hover:underline">1. Executive Summary</a>
              <a href="#methodology" className="text-[#1D4ED8] hover:underline">2. Scope &amp; Methodology</a>
              <a href="#findings-summary" className="text-[#1D4ED8] hover:underline">3. Findings Summary Table</a>
              <a href="#detailed-findings" className="text-[#1D4ED8] hover:underline">
                4. Detailed Findings ({sortedFindings.length})
              </a>
              <a href="#doc-quality" className="text-[#1D4ED8] hover:underline">5. Documentation &amp; Quality Notes</a>
              <a href="#recommendations" className="text-[#1D4ED8] hover:underline">6. Recommendations &amp; Action Plan</a>
              <a href="#verification" className="text-[#1D4ED8] hover:underline">7. Certification &amp; Verification</a>
            </div>
          </div>
        )}

        <div>
          <h1
            id="exec-summary"
            className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 mb-3 border-b-[1.5px] border-[#1D4ED8]"
          >
            1. Executive Summary
          </h1>
          <p className="text-[10.5pt] text-slate-800 leading-relaxed">{executiveProse}</p>
        </div>

        {/* Fixed 4-Column Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="report-avoid-break p-3.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[8.5pt] font-semibold text-slate-600">Overall Health</div>
            <div className="text-[20pt] font-extrabold text-[#1D4ED8] mt-1 leading-tight">
              {review.scores.overall}/100
            </div>
          </div>
          <div className="report-avoid-break p-3.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[8.5pt] font-semibold text-slate-600">Open Findings</div>
            <div className="text-[20pt] font-extrabold text-[#111827] mt-1 leading-tight">
              {String(sortedFindings.length).padStart(2, '0')}
            </div>
          </div>
          <div className="report-avoid-break p-3.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[8.5pt] font-semibold text-slate-600">Code Quality</div>
            <div className="text-[20pt] font-extrabold text-[#111827] mt-1 leading-tight">
              {review.scores.quality}%
            </div>
          </div>
          <div className="report-avoid-break p-3.5 rounded-md bg-slate-50 border border-slate-200">
            <div className="text-[8.5pt] font-semibold text-slate-600">OWASP Security</div>
            <div className="text-[20pt] font-extrabold text-[#111827] mt-1 leading-tight">
              {review.scores.security}%
            </div>
          </div>
        </div>

        {/* Severity Distribution Bar */}
        <div className="space-y-2">
          <h2 className="report-heading-guard text-[13pt] font-bold text-[#111827]">
            Severity Distribution
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { sev: 'Critical', count: criticalCount },
              { sev: 'High', count: highCount },
              { sev: 'Medium', count: mediumCount },
              { sev: 'Low', count: lowCount },
              { sev: 'Informational', count: infoCount },
            ].map((item) => {
              const st = getSeverityChip(item.sev);
              return (
                <span
                  key={item.sev}
                  style={{
                    color: st.color,
                    backgroundColor: st.backgroundColor,
                    borderColor: st.borderColor,
                  }}
                  className="inline-flex items-center px-2.5 py-1 rounded border text-[8.5pt] font-bold"
                >
                  {st.label}: {item.count}
                </span>
              );
            })}
          </div>
        </div>

        {/* Top 3 Risks */}
        <div className="space-y-2">
          <h2 className="report-heading-guard text-[13pt] font-bold text-[#111827]">
            Top Identified Risks
          </h2>
          {topRisks.length === 0 ? (
            <div className="report-avoid-break p-4 rounded-md bg-emerald-50 border border-emerald-200 text-[9.5pt] text-emerald-900">
              No security or reliability risks were flagged during automated scanning.
            </div>
          ) : (
            <div className="report-avoid-break p-4 rounded-md border border-slate-200 bg-white">
              <ol className="list-decimal pl-5 space-y-1.5 text-[10pt]">
                {topRisks.map((r) => {
                  const st = getSeverityChip(r.severity);
                  return (
                    <li key={r.id}>
                      <span style={{ color: st.color }} className="font-bold">
                        [{st.label}]
                      </span>{' '}
                      <strong className="text-[#111827]">{r.title}</strong>{' '}
                      <span className="report-mono text-slate-600">
                        ({r.file}:{r.lineStart})
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. SCOPE & METHODOLOGY                                              */}
      {/* =================================================================== */}
      <section className="pt-6 space-y-3">
        <h1
          id="methodology"
          className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 border-b-[1.5px] border-[#1D4ED8]"
        >
          2. Scope &amp; Methodology
        </h1>
        <div className="report-avoid-break p-4 rounded-md border border-slate-200 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10pt]">
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">Source Files Analyzed</div>
              <div className="font-semibold text-[#111827]">
                {review.totalFilesAnalyzed} authored files ({review.totalLinesOfCode.toLocaleString()} LOC)
              </div>
            </div>
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">Evaluation Calibration</div>
              <div className="font-semibold text-[#111827] capitalize">{review.skillLevel}</div>
            </div>
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">Multi-Agent Pipeline</div>
              <div className="font-semibold text-[#111827]">
                Repository AST, Code Quality, OWASP Security, Documentation Agents
              </div>
            </div>
            <div>
              <div className="text-[8.5pt] font-semibold text-slate-500">Standards Referenced</div>
              <div className="font-semibold text-[#111827]">
                OWASP Top 10:2021, CWE Common Weakness Enumeration
              </div>
            </div>
          </div>
          <p className="text-[9.5pt] text-slate-700">
            <strong>Scoring Formula:</strong> Overall Health = (0.35 × OWASP Security) + (0.30 × Code Quality) + (0.20 × Reliability) + (0.15 × Documentation), bounded [0–100].
          </p>
          <p className="text-[9pt] text-slate-500">
            <strong>Limitations &amp; Disclaimer:</strong> Automated static and AI-assisted reviews evaluate patterns within ingested source files and exclude ignored build artifacts. Dynamic runtime penetration testing and manual peer review remain recommended prior to critical production deployment.
          </p>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. FINDINGS SUMMARY TABLE                                           */}
      {/* =================================================================== */}
      <section className="pt-6 space-y-3">
        <h1
          id="findings-summary"
          className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 border-b-[1.5px] border-[#1D4ED8]"
        >
          3. Findings Summary Table
        </h1>
        {sortedFindings.length === 0 ? (
          <div className="report-avoid-break p-4 rounded-md bg-emerald-50 border border-emerald-200 text-[10pt] text-emerald-900">
            <strong>Clean Bill of Health:</strong> Zero defects, code smells, or OWASP security vulnerabilities were detected across {review.totalFilesAnalyzed} analyzed repository files.
          </div>
        ) : (
          <div className="w-full overflow-x-auto print:overflow-visible">
            <table className="report-table w-full border-collapse table-fixed text-[9pt]">
              <thead className="bg-slate-100 border-y border-slate-300">
                <tr>
                  <th className="p-2 text-left font-bold text-[#111827] w-[11%]">ID</th>
                  <th className="p-2 text-left font-bold text-[#111827] w-[27%]">Finding</th>
                  <th className="p-2 text-left font-bold text-[#111827] w-[20%]">Category / OWASP</th>
                  <th className="p-2 text-left font-bold text-[#111827] w-[22%]">File : Line</th>
                  <th className="p-2 text-left font-bold text-[#111827] w-[11%]">Severity</th>
                  <th className="p-2 text-left font-bold text-[#111827] w-[9%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedFindings.map((finding, idx) => {
                  const st = getSeverityChip(finding.severity);
                  const fid = finding.id || `F-${String(idx + 1).padStart(3, '0')}`;
                  return (
                    <tr key={fid} className="align-top">
                      <td className="p-2 report-mono text-[8pt] text-slate-700 break-words">
                        {fid}
                      </td>
                      <td className="p-2 font-semibold text-[#111827] break-words">
                        {finding.title}
                      </td>
                      <td className="p-2 text-[8.5pt] text-slate-700 break-words">
                        {finding.owaspCategory || finding.category}
                      </td>
                      <td className="p-2 report-mono text-[8pt] text-slate-700 break-all">
                        {finding.file}:{finding.lineStart}
                      </td>
                      <td className="p-2">
                        <span
                          style={{
                            color: st.color,
                            backgroundColor: st.backgroundColor,
                            borderColor: st.borderColor,
                          }}
                          className="inline-block px-1.5 py-0.5 rounded border text-[7.5pt] font-bold whitespace-nowrap"
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="p-2 text-[8.5pt] text-slate-700">Open</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* 5. DETAILED FINDINGS                                                */}
      {/* =================================================================== */}
      {sortedFindings.length > 0 && (
        <section className="pt-6 space-y-4">
          <h1
            id="detailed-findings"
            className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 border-b-[1.5px] border-[#1D4ED8]"
          >
            4. Detailed Findings
          </h1>
          <div className="space-y-4">
            {sortedFindings.map((f: Finding, idx: number) => {
              const st = getSeverityChip(f.severity);
              const fid = f.id || `F-${String(idx + 1).padStart(3, '0')}`;
              return (
                <div
                  key={fid}
                  className="report-avoid-break p-4 rounded-md border border-slate-300 bg-white space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <div className="report-mono text-[8pt] text-slate-500">
                        {fid} • {f.owaspCategory || f.category}
                      </div>
                      <h3 className="text-[11.5pt] font-bold text-[#111827]">{f.title}</h3>
                    </div>
                    <span
                      style={{
                        color: st.color,
                        backgroundColor: st.backgroundColor,
                        borderColor: st.borderColor,
                      }}
                      className="inline-block px-2 py-0.5 rounded border text-[8pt] font-bold shrink-0"
                    >
                      {st.label}
                    </span>
                  </div>

                  <div className="text-[9pt] text-slate-700">
                    <strong>Location:</strong>{' '}
                    <span className="report-mono">
                      {f.file}:{f.lineStart}
                      {f.lineEnd && f.lineEnd !== f.lineStart ? `-${f.lineEnd}` : ''}
                    </span>
                  </div>

                  {f.codeSnippet && (
                    <pre className="report-mono text-[8.5pt] p-3 rounded bg-slate-50 border border-slate-200 text-slate-900 whitespace-pre-wrap break-all overflow-x-auto">
                      {f.codeSnippet}
                    </pre>
                  )}

                  <p className="text-[9.5pt] text-slate-800">
                    <strong>Description:</strong> {f.description}
                  </p>
                  <p className="text-[9.5pt] text-slate-800">
                    <strong>Engineering Impact:</strong> {f.principleExplanation}
                  </p>
                  {f.suggestedFix && (
                    <p className="text-[9.5pt] text-slate-800">
                      <strong>Recommended Fix:</strong> {f.suggestedFix}
                    </p>
                  )}

                  {(f.diff?.original || f.diff?.modified) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="text-[8pt] font-bold text-[#B91C1C] mb-1">Before</div>
                        <pre className="report-mono text-[8pt] p-2.5 rounded bg-red-50 border border-red-200 text-slate-900 whitespace-pre-wrap break-all">
                          {f.diff?.original}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[8pt] font-bold text-emerald-700 mb-1">
                          After (Recommended)
                        </div>
                        <pre className="report-mono text-[8pt] p-2.5 rounded bg-emerald-50 border border-emerald-200 text-slate-900 whitespace-pre-wrap break-all">
                          {f.diff?.modified}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 6. DOCUMENTATION & CODE QUALITY NOTES                               */}
      {/* =================================================================== */}
      <section className="report-avoid-break pt-6 space-y-3">
        <h1
          id="doc-quality"
          className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 border-b-[1.5px] border-[#1D4ED8]"
        >
          5. Documentation &amp; Code Quality Notes
        </h1>
        <div className="p-4 rounded-md border border-slate-200 bg-white space-y-2 text-[9.5pt] text-slate-800">
          <p>
            <strong>Documentation Coverage:</strong> Rated at <strong>{review.scores.documentation}%</strong>.{' '}
            <strong>Maintainability &amp; Reliability:</strong> Rated at{' '}
            <strong>{review.scores.quality}%</strong> quality and{' '}
            <strong>{review.scores.reliability}%</strong> reliability across {review.totalFilesAnalyzed} analyzed files.
          </p>
          <p className="text-slate-700">
            {review.readmeDraft
              ? `Generated README specification covers repository setup and module responsibilities for ${review.repositoryName}. Ensure exported API handlers and utility contracts retain inline docstrings.`
              : `Ensure exported API routes, validation schemas, and core service modules maintain inline JSDoc/docstring coverage and clear root README setup documentation.`}
          </p>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 7. RECOMMENDATIONS & ACTION PLAN                                    */}
      {/* =================================================================== */}
      <section className="report-avoid-break pt-6 space-y-3">
        <h1
          id="recommendations"
          className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 border-b-[1.5px] border-[#1D4ED8]"
        >
          6. Recommendations &amp; Action Plan
        </h1>
        <div className="p-4 rounded-md border border-slate-200 bg-white space-y-3 text-[9.5pt]">
          <div>
            <div className="font-bold text-[#B91C1C]">Immediate Priority (Critical &amp; High)</div>
            <p className="text-slate-800 mt-0.5">
              {immediateActions.length > 0
                ? immediateActions.map((f) => `${f.title} (${f.file}:${f.lineStart})`).join('; ')
                : 'No immediate blocking vulnerabilities remain.'}
            </p>
          </div>
          <div>
            <div className="font-bold text-[#B45309]">Short-Term Refactoring (Medium)</div>
            <p className="text-slate-800 mt-0.5">
              {shortTermActions.length > 0
                ? shortTermActions.map((f) => `${f.title} (${f.file}:${f.lineStart})`).join('; ')
                : 'Address modularization and cyclomatic complexity checks during sprint reviews.'}
            </p>
          </div>
          <div>
            <div className="font-bold text-[#1D4ED8]">Long-Term Hardening (Low &amp; Documentation)</div>
            <p className="text-slate-800 mt-0.5">
              {longTermActions.length > 0
                ? longTermActions.map((f) => `${f.title} (${f.file}:${f.lineStart})`).join('; ')
                : 'Maintain automated CI static analysis gates, strict type checking, and unit test coverage.'}
            </p>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. VERIFICATION PAGE                                                */}
      {/* =================================================================== */}
      <section className="report-page-break pt-6 space-y-5">
        <h1
          id="verification"
          className="report-heading-guard text-[18pt] font-bold text-[#111827] pb-1.5 border-b-[1.5px] border-[#1D4ED8]"
        >
          7. Certification &amp; Verification
        </h1>
        <p className="text-[10pt] text-slate-800">
          This document certifies that the automated multi-agent analysis for{' '}
          <strong>{review.repositoryName}</strong> was executed by CodePilot AI and cryptographically sealed against tampering.
        </p>

        <div className="report-avoid-break p-5 rounded-md border-[1.5px] border-[#1D4ED8] bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="shrink-0 p-1.5 bg-white border border-slate-300 rounded"
            dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
          />
          <div className="flex-1 min-w-0 space-y-1 text-[9pt] text-slate-800">
            <div className="text-[11pt] font-bold text-[#1D4ED8]">
              Automated multi-agent analysis certified
            </div>
            <div>
              <strong>Report ID:</strong> <span className="report-mono">{config.referenceId}</span>
            </div>
            <div>
              <strong>Generated Timestamp (UTC):</strong>{' '}
              <span className="report-mono">{timestampUtc}</span>
            </div>
            <div>
              <strong>CodePilot Engine Version:</strong>{' '}
              <span className="report-mono">v1.0.0-production</span>
            </div>
            <div className="break-all">
              <strong>Payload SHA-256 Digest:</strong>{' '}
              <span className="report-mono">{sha256Hash}</span>
            </div>
            <div className="break-all pt-1">
              <strong>Online Verification URL:</strong>{' '}
              <a href={verifyUrl} className="report-mono text-[#1D4ED8] hover:underline">
                {verifyUrl}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <h2 className="report-heading-guard text-[13pt] font-bold text-[#111827]">
            Academic / Evaluator Sign-Off
          </h2>
          <p className="text-[9.5pt] text-slate-600">
            Authorized faculty evaluator or technical lead endorsement for institutional grading and compliance records.
          </p>
          <div className="report-avoid-break grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
            <div className="border-t border-slate-700 pt-1.5 text-[9pt] font-semibold text-slate-700">
              Evaluator / Guide Name
            </div>
            <div className="border-t border-slate-700 pt-1.5 text-[9pt] font-semibold text-slate-700">
              Authorized Signature
            </div>
            <div className="border-t border-slate-700 pt-1.5 text-[9pt] font-semibold text-slate-700">
              Date
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
