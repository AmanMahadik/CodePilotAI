import { Finding, Review } from './types';
import { generateQrSvg } from './qr';
import { getGradeVerdict, ReportConfig, sortFindingsBySeverity } from './report-utils';

function esc(str?: string | number | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSeverityStyle(severity: string): {
  color: string;
  bg: string;
  border: string;
  label: string;
} {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5', label: 'Critical' };
    case 'high':
      return { color: '#C2410C', bg: '#FFEDD5', border: '#FDBA74', label: 'High' };
    case 'medium':
      return { color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', label: 'Medium' };
    case 'low':
      return { color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD', label: 'Low' };
    default:
      return { color: '#475569', bg: '#F1F5F9', border: '#CBD5E1', label: 'Info' };
  }
}

export interface PdfRenderInput {
  review: Review;
  config: ReportConfig;
  sha256Hash: string;
  verifyUrl: string;
  generatedAtUtc: string;
}

export function buildReportHtml({
  review,
  config,
  sha256Hash,
  verifyUrl,
  generatedAtUtc,
}: PdfRenderInput): string {
  const sortedFindings = sortFindingsBySeverity(review.findings || []);
  const criticalCount = sortedFindings.filter((f) => f.severity === 'Critical').length;
  const highCount = sortedFindings.filter((f) => f.severity === 'High').length;
  const mediumCount = sortedFindings.filter((f) => f.severity === 'Medium').length;
  const lowCount = sortedFindings.filter((f) => f.severity === 'Low').length;
  const infoCount = sortedFindings.filter((f) => f.severity === 'Informational').length;

  const { grade, verdict } = getGradeVerdict(review.scores.overall, criticalCount);
  const qrSvg = generateQrSvg(verifyUrl, 108);
  const topRisks = sortedFindings.slice(0, 3);
  const needsToc = sortedFindings.length >= 6;

  const immediateActions = sortedFindings.filter(
    (f) => f.severity === 'Critical' || f.severity === 'High'
  );
  const shortTermActions = sortedFindings.filter((f) => f.severity === 'Medium');
  const longTermActions = sortedFindings.filter(
    (f) => f.severity === 'Low' || f.severity === 'Informational'
  );

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
            ? 'Immediate remediation of the critical and high-severity findings is recommended prior to production release or academic sign-off.'
            : 'No critical blocking security defects were detected, confirming solid foundational software engineering practices.'
        }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CodePilot AI Audit Report - ${esc(review.repositoryName)}</title>
  <meta name="author" content="${esc(config.candidateName)}" />
  <meta name="subject" content="Software Engineering Quality & Security Assessment for ${esc(review.repositoryName)}" />
  <meta name="keywords" content="CodePilot AI, Code Audit, OWASP Top 10, ${esc(review.repositoryName)}, ${esc(config.referenceId)}" />
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 18mm 20mm 18mm;
    }
    @page :first {
      margin: 18mm 18mm 18mm 18mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .mono {
      font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9pt;
    }

    /* Subtle Diagonal Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 46pt;
      font-weight: 800;
      color: #1D4ED8;
      opacity: 0.04;
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 0.08em;
    }

    .content-layer {
      position: relative;
      z-index: 1;
    }

    .page-break {
      break-before: page;
      page-break-before: always;
    }

    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    h1.section-title {
      font-size: 18pt;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #1D4ED8;
      break-after: avoid;
      page-break-after: avoid;
    }

    h2.sub-title {
      font-size: 13pt;
      font-weight: 700;
      color: #111827;
      margin: 18px 0 8px 0;
      break-after: avoid;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
      color: #1f2937;
    }

    /* Cover Page */
    .cover-page {
      min-height: 248mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 8px 0;
    }

    .cover-header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo {
      max-height: 54px;
      max-width: 120px;
      object-fit: contain;
    }

    .cover-inst {
      font-size: 13pt;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .cover-dept {
      font-size: 10.5pt;
      color: #4b5563;
      margin: 2px 0 0 0;
    }

    .cover-main {
      margin: 28px 0;
    }

    .cover-badge-tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1D4ED8;
      font-size: 9pt;
      font-weight: 600;
      margin-bottom: 14px;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
    }

    .cover-subtitle {
      font-size: 12pt;
      color: #4b5563;
      margin: 0 0 28px 0;
    }

    .grade-hero {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 18px 22px;
      border: 1px solid #d1d5db;
      border-left: 5px solid #1D4ED8;
      border-radius: 6px;
      background: #f9fafb;
      margin-bottom: 24px;
    }

    .grade-score-box {
      text-align: center;
      padding-right: 20px;
      border-right: 1px solid #e5e7eb;
      min-width: 105px;
    }

    .grade-score-num {
      font-size: 24pt;
      font-weight: 800;
      color: #1D4ED8;
      line-height: 1.1;
    }

    .grade-letter {
      font-size: 9pt;
      font-weight: 700;
      color: #374151;
      margin-top: 2px;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
      padding: 18px 20px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #ffffff;
    }

    .meta-item-label {
      font-size: 8.5pt;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .meta-item-val {
      font-size: 10.5pt;
      color: #111827;
      font-weight: 600;
      word-break: break-word;
    }

    .cover-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #6b7280;
    }

    /* 4-Column Score Grid */
    .score-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 16px 0;
    }

    .score-card {
      padding: 14px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #f9fafb;
      break-inside: avoid;
    }

    .score-card-label {
      font-size: 8.5pt;
      font-weight: 600;
      color: #4b5563;
      margin-bottom: 4px;
    }

    .score-card-value {
      font-size: 20pt;
      font-weight: 800;
      color: #111827;
      line-height: 1.15;
    }

    /* Severity Distribution */
    .sev-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0 18px 0;
    }

    .sev-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 700;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    /* Card Box */
    .card-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 14px;
      background: #ffffff;
    }

    /* Tables */
    table.summary-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 9pt;
      margin: 12px 0 18px 0;
    }

    table.summary-table thead {
      display: table-header-group;
      background: #f3f4f6;
    }

    table.summary-table th {
      text-align: left;
      padding: 8px 7px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #111827;
      border-top: 1px solid #d1d5db;
      border-bottom: 1.5px solid #9ca3af;
    }

    table.summary-table td {
      padding: 8px 7px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    table.summary-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Finding Detail Block */
    .finding-block {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 16px;
      background: #ffffff;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .finding-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .code-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      margin: 8px 0;
      white-space: pre-wrap;
      word-break: break-all;
      color: #0f172a;
      font-size: 8.5pt;
      line-height: 1.45;
    }

    .diff-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 8px;
    }

    /* Verification & Signature */
    .verification-box {
      border: 1.5px solid #1D4ED8;
      border-radius: 6px;
      padding: 20px;
      background: #f8fafc;
      display: flex;
      gap: 20px;
      align-items: center;
      margin: 16px 0 28px 0;
      break-inside: avoid;
    }

    .sig-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 48px;
      break-inside: avoid;
    }

    .sig-line {
      border-top: 1px solid #374151;
      padding-top: 6px;
      font-size: 9pt;
      color: #4b5563;
      font-weight: 600;
    }

    a {
      color: #1D4ED8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="watermark">CodePilot AI Verified</div>

  <div class="content-layer">
    <!-- ===================================================================== -->
    <!-- 1. COVER PAGE                                                         -->
    <!-- ===================================================================== -->
    <section class="cover-page">
      <div>
        ${
          config.includeInstitutionalHeader
            ? `<div class="cover-header">
                ${config.logoDataUrl ? `<img src="${esc(config.logoDataUrl)}" alt="Institution Logo" class="cover-logo" />` : ''}
                <div>
                  <p class="cover-inst">${esc(config.institution)}</p>
                  <p class="cover-dept">${esc(config.department)}</p>
                </div>
              </div>`
            : ''
        }

        <div class="cover-main">
          <div class="cover-badge-tag">Technical Code Audit Report</div>
          <h1 class="cover-title">Software Engineering Quality &amp; Security Assessment</h1>
          <p class="cover-subtitle">
            Automated multi-agent static analysis, OWASP Top 10 vulnerability inspection, and engineering quality assessment for <strong>${esc(review.repositoryName)}</strong>.
          </p>

          <div class="grade-hero avoid-break">
            <div class="grade-score-box">
              <div class="grade-score-num">${review.scores.overall}/100</div>
              <div class="grade-letter">Grade ${esc(grade)}</div>
            </div>
            <div>
              <div style="font-size: 9pt; font-weight: 700; color: #1D4ED8; margin-bottom: 3px;">Assessment Verdict</div>
              <div style="font-size: 10.5pt; font-weight: 600; color: #111827;">${esc(verdict)}</div>
            </div>
          </div>

          <div class="cover-meta-grid avoid-break">
            <div>
              <div class="meta-item-label">Project / Repository</div>
              <div class="meta-item-val">${esc(review.repositoryName)}</div>
            </div>
            <div>
              <div class="meta-item-label">Branch${config.commitHash ? ' &amp; Commit' : ''}</div>
              <div class="meta-item-val mono">${esc(review.branch)}${config.commitHash ? ` @ ${esc(config.commitHash.slice(0, 10))}` : ''}</div>
            </div>
            <div>
              <div class="meta-item-label">Author / Candidate</div>
              <div class="meta-item-val">${esc(config.candidateName)}</div>
            </div>
            <div>
              <div class="meta-item-label">Roll / PRN Number</div>
              <div class="meta-item-val mono">${esc(config.rollNumber)}</div>
            </div>
            ${
              config.batch
                ? `<div>
                    <div class="meta-item-label">Cohort / Batch</div>
                    <div class="meta-item-val">${esc(config.batch)}</div>
                  </div>`
                : ''
            }
            <div>
              <div class="meta-item-label">Report Reference ID</div>
              <div class="meta-item-val mono">${esc(config.referenceId)}</div>
            </div>
            <div>
              <div class="meta-item-label">Audit Date (UTC)</div>
              <div class="meta-item-val">${esc(reviewDateFormatted)}</div>
            </div>
            ${
              config.repositoryUrl
                ? `<div>
                    <div class="meta-item-label">Source URL</div>
                    <div class="meta-item-val mono" style="font-size: 8.5pt;">${esc(config.repositoryUrl)}</div>
                  </div>`
                : ''
            }
          </div>
        </div>
      </div>

      <div class="cover-footer">
        <span><strong>Generated by CodePilot AI</strong> • Multi-Agent Audit Engine</span>
        <span class="mono">SHA-256: ${esc(sha256Hash.slice(0, 16))}…</span>
      </div>
    </section>

    <!-- ===================================================================== -->
    <!-- 2. EXECUTIVE SUMMARY (PAGE 2)                                         -->
    <!-- ===================================================================== -->
    <section class="page-break">
      ${
        needsToc
          ? `<div class="card-box avoid-break" style="background: #f8fafc; margin-bottom: 20px;">
              <h2 class="sub-title" style="margin-top: 0;">Table of Contents</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 9.5pt;">
                <a href="#exec-summary">1. Executive Summary</a>
                <a href="#methodology">2. Scope &amp; Methodology</a>
                <a href="#findings-summary">3. Findings Summary Table</a>
                <a href="#detailed-findings">4. Detailed Findings (${sortedFindings.length})</a>
                <a href="#doc-quality">5. Documentation &amp; Quality Notes</a>
                <a href="#recommendations">6. Recommendations &amp; Action Plan</a>
                <a href="#verification">7. Certification &amp; Verification</a>
              </div>
            </div>`
          : ''
      }

      <h1 id="exec-summary" class="section-title">1. Executive Summary</h1>
      <p>${esc(executiveProse)}</p>

      <div class="score-grid">
        <div class="score-card">
          <div class="score-card-label">Overall Health</div>
          <div class="score-card-value" style="color: #1D4ED8;">${review.scores.overall}/100</div>
        </div>
        <div class="score-card">
          <div class="score-card-label">Open Findings</div>
          <div class="score-card-value">${String(sortedFindings.length).padStart(2, '0')}</div>
        </div>
        <div class="score-card">
          <div class="score-card-label">Code Quality</div>
          <div class="score-card-value">${review.scores.quality}%</div>
        </div>
        <div class="score-card">
          <div class="score-card-label">OWASP Security</div>
          <div class="score-card-value">${review.scores.security}%</div>
        </div>
      </div>

      <h2 class="sub-title">Severity Distribution</h2>
      <div class="sev-bar">
        <span class="sev-chip" style="color: #B91C1C; background: #FEE2E2; border-color: #FCA5A5;">Critical: ${criticalCount}</span>
        <span class="sev-chip" style="color: #C2410C; background: #FFEDD5; border-color: #FDBA74;">High: ${highCount}</span>
        <span class="sev-chip" style="color: #B45309; background: #FEF3C7; border-color: #FCD34D;">Medium: ${mediumCount}</span>
        <span class="sev-chip" style="color: #1D4ED8; background: #DBEAFE; border-color: #93C5FD;">Low: ${lowCount}</span>
        <span class="sev-chip" style="color: #475569; background: #F1F5F9; border-color: #CBD5E1;">Info: ${infoCount}</span>
      </div>

      <h2 class="sub-title">Top Identified Risks</h2>
      ${
        topRisks.length === 0
          ? `<div class="card-box avoid-break" style="background: #ECFDF5; border-color: #A7F3D0; color: #065F46;">
              No security or reliability risks were flagged during automated scanning.
            </div>`
          : `<div class="card-box avoid-break">
              <ol style="margin: 0; padding-left: 18px;">
                ${topRisks
                  .map((r) => {
                    const st = getSeverityStyle(r.severity);
                    return `<li style="margin-bottom: 6px;">
                      <strong style="color: ${st.color};">[${esc(st.label)}]</strong>
                      <strong>${esc(r.title)}</strong>
                      <span class="mono" style="color: #4b5563;">(${esc(r.file)}:${r.lineStart})</span>
                    </li>`;
                  })
                  .join('')}
              </ol>
            </div>`
      }
    </section>

    <!-- ===================================================================== -->
    <!-- 3. SCOPE & METHODOLOGY                                                -->
    <!-- ===================================================================== -->
    <section style="margin-top: 22px;">
      <h1 id="methodology" class="section-title">2. Scope &amp; Methodology</h1>
      <div class="card-box avoid-break">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-bottom: 12px;">
          <div>
            <div class="meta-item-label">Source Files Analyzed</div>
            <div class="meta-item-val">${review.totalFilesAnalyzed} authored files (${review.totalLinesOfCode.toLocaleString()} LOC)</div>
          </div>
          <div>
            <div class="meta-item-label">Evaluation Skill Calibration</div>
            <div class="meta-item-val" style="text-transform: capitalize;">${esc(review.skillLevel)}</div>
          </div>
          <div>
            <div class="meta-item-label">Multi-Agent Pipeline</div>
            <div class="meta-item-val">Repository AST, Code Quality, OWASP Security, Documentation Agents</div>
          </div>
          <div>
            <div class="meta-item-label">Standards Referenced</div>
            <div class="meta-item-val">OWASP Top 10:2021, CWE Common Weakness Enumeration</div>
          </div>
        </div>
        <p style="font-size: 9.5pt; color: #4b5563; margin-bottom: 6px;">
          <strong>Scoring Formula:</strong> Overall Health = (0.35 × OWASP Security) + (0.30 × Code Quality) + (0.20 × Reliability) + (0.15 × Documentation), bounded [0–100].
        </p>
        <p style="font-size: 9pt; color: #6b7280; margin-bottom: 0;">
          <strong>Disclaimer:</strong> Automated static and AI-assisted reviews evaluate patterns within ingested source files and exclude ignored build artifacts (e.g., node_modules, .git). Dynamic runtime penetration testing and manual architectural peer review remain recommended for mission-critical production releases.
        </p>
      </div>
    </section>

    <!-- ===================================================================== -->
    <!-- 4. FINDINGS SUMMARY TABLE                                             -->
    <!-- ===================================================================== -->
    <section style="margin-top: 22px;">
      <h1 id="findings-summary" class="section-title">3. Findings Summary Table</h1>
      ${
        sortedFindings.length === 0
          ? `<div class="card-box avoid-break" style="background: #ECFDF5; border-color: #A7F3D0; color: #065F46;">
              <strong>Clean Bill of Health:</strong> Zero defects, anti-patterns, or OWASP security vulnerabilities were detected across ${review.totalFilesAnalyzed} analyzed files.
            </div>`
          : `<table class="summary-table">
              <thead>
                <tr>
                  <th style="width: 11%;">ID</th>
                  <th style="width: 27%;">Finding</th>
                  <th style="width: 20%;">Category / OWASP</th>
                  <th style="width: 22%;">File : Line</th>
                  <th style="width: 11%;">Severity</th>
                  <th style="width: 9%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${sortedFindings
                  .map((f, idx) => {
                    const st = getSeverityStyle(f.severity);
                    const fid = f.id || `F-${String(idx + 1).padStart(3, '0')}`;
                    return `<tr>
                      <td class="mono" style="font-size: 8pt;">${esc(fid)}</td>
                      <td style="font-weight: 600; color: #111827;">${esc(f.title)}</td>
                      <td style="font-size: 8.5pt; color: #374151;">${esc(f.owaspCategory || f.category)}</td>
                      <td class="mono" style="font-size: 8pt; color: #374151;">${esc(f.file)}:${f.lineStart}</td>
                      <td>
                        <span class="sev-chip" style="color: ${st.color}; background: ${st.bg}; border-color: ${st.border}; font-size: 7.5pt; padding: 2px 6px;">
                          ${esc(st.label)}
                        </span>
                      </td>
                      <td style="font-size: 8.5pt; color: #374151;">Open</td>
                    </tr>`;
                  })
                  .join('')}
              </tbody>
            </table>`
      }
    </section>

    <!-- ===================================================================== -->
    <!-- 5. DETAILED FINDINGS                                                  -->
    <!-- ===================================================================== -->
    ${
      sortedFindings.length > 0
        ? `<section style="margin-top: 22px;">
            <h1 id="detailed-findings" class="section-title">4. Detailed Findings</h1>
            ${sortedFindings
              .map((f: Finding, idx: number) => {
                const st = getSeverityStyle(f.severity);
                const fid = f.id || `F-${String(idx + 1).padStart(3, '0')}`;
                return `<div class="finding-block">
                  <div class="finding-header">
                    <div>
                      <div class="mono" style="font-size: 8pt; color: #6b7280; margin-bottom: 2px;">
                        ${esc(fid)} • ${esc(f.owaspCategory || f.category)}
                      </div>
                      <h3 class="finding-title">${esc(f.title)}</h3>
                    </div>
                    <span class="sev-chip" style="color: ${st.color}; background: ${st.bg}; border-color: ${st.border};">
                      ${esc(st.label)}
                    </span>
                  </div>

                  <div style="font-size: 9pt; color: #374151; margin-bottom: 8px;">
                    <strong>Location:</strong> <span class="mono">${esc(f.file)}:${f.lineStart}${f.lineEnd && f.lineEnd !== f.lineStart ? `-${f.lineEnd}` : ''}</span>
                  </div>

                  ${
                    f.codeSnippet
                      ? `<pre class="code-box mono">${esc(f.codeSnippet)}</pre>`
                      : ''
                  }

                  <p style="font-size: 9.5pt;"><strong>Description:</strong> ${esc(f.description)}</p>
                  <p style="font-size: 9.5pt;"><strong>Engineering Impact:</strong> ${esc(f.principleExplanation)}</p>
                  ${
                    f.suggestedFix
                      ? `<p style="font-size: 9.5pt; margin-bottom: 4px;"><strong>Recommended Fix:</strong> ${esc(f.suggestedFix)}</p>`
                      : ''
                  }
                  ${
                    f.diff?.original || f.diff?.modified
                      ? `<div class="diff-grid">
                          <div>
                            <div style="font-size: 8pt; font-weight: 700; color: #B91C1C; margin-bottom: 2px;">Before</div>
                            <pre class="code-box mono" style="background: #FEF2F2; border-color: #FECACA; margin: 0;">${esc(f.diff?.original || '')}</pre>
                          </div>
                          <div>
                            <div style="font-size: 8pt; font-weight: 700; color: #047857; margin-bottom: 2px;">After (Recommended)</div>
                            <pre class="code-box mono" style="background: #ECFDF5; border-color: #A7F3D0; margin: 0;">${esc(f.diff?.modified || '')}</pre>
                          </div>
                        </div>`
                      : ''
                  }
                </div>`;
              })
              .join('')}
          </section>`
        : ''
    }

    <!-- ===================================================================== -->
    <!-- 6. DOCUMENTATION & CODE QUALITY NOTES                                 -->
    <!-- ===================================================================== -->
    <section style="margin-top: 22px;" class="avoid-break">
      <h1 id="doc-quality" class="section-title">5. Documentation &amp; Code Quality Notes</h1>
      <div class="card-box">
        <p style="font-size: 9.5pt;">
          <strong>Documentation Coverage:</strong> Rated at <strong>${review.scores.documentation}%</strong>.
          <strong>Maintainability &amp; Reliability:</strong> Rated at <strong>${review.scores.quality}%</strong> quality and <strong>${review.scores.reliability}%</strong> reliability across ${review.totalFilesAnalyzed} analyzed files.
        </p>
        <p style="font-size: 9.5pt; margin-bottom: 0; color: #374151;">
          ${
            review.readmeDraft
              ? `Generated README specification summary covers architecture setup and module responsibilities for ${esc(review.repositoryName)}. Ensure all exported public functions and API endpoints retain JSDoc / docstring contracts and explicit input schemas.`
              : `Ensure exported API routes, validation schemas, and service interfaces maintain inline docstrings and clear setup instructions in the root README.`
          }
        </p>
      </div>
    </section>

    <!-- ===================================================================== -->
    <!-- 7. RECOMMENDATIONS & ACTION PLAN                                      -->
    <!-- ===================================================================== -->
    <section style="margin-top: 22px;" class="avoid-break">
      <h1 id="recommendations" class="section-title">6. Recommendations &amp; Action Plan</h1>
      <div class="card-box">
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10pt; font-weight: 700; color: #B91C1C;">Immediate Priority (Critical &amp; High)</div>
          <p style="font-size: 9.5pt; margin: 2px 0 0 0;">
            ${
              immediateActions.length > 0
                ? immediateActions.map((f) => `${esc(f.title)} (${esc(f.file)}:${f.lineStart})`).join('; ')
                : 'No immediate blocking vulnerabilities remain.'
            }
          </p>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10pt; font-weight: 700; color: #B45309;">Short-Term Refactoring (Medium)</div>
          <p style="font-size: 9.5pt; margin: 2px 0 0 0;">
            ${
              shortTermActions.length > 0
                ? shortTermActions.map((f) => `${esc(f.title)} (${esc(f.file)}:${f.lineStart})`).join('; ')
                : 'Address modularization and cyclomatic complexity checks during sprint reviews.'
            }
          </p>
        </div>
        <div>
          <div style="font-size: 10pt; font-weight: 700; color: #1D4ED8;">Long-Term Hardening (Low &amp; Documentation)</div>
          <p style="font-size: 9.5pt; margin: 2px 0 0 0;">
            ${
              longTermActions.length > 0
                ? longTermActions.map((f) => `${esc(f.title)} (${esc(f.file)}:${f.lineStart})`).join('; ')
                : 'Maintain automated CI static analysis gates, strict TypeScript checking, and complete test coverage.'
            }
          </p>
        </div>
      </div>
    </section>

    <!-- ===================================================================== -->
    <!-- 8. VERIFICATION PAGE                                                  -->
    <!-- ===================================================================== -->
    <section class="page-break">
      <h1 id="verification" class="section-title">7. Certification &amp; Verification</h1>
      <p>
        This document certifies that the automated multi-agent analysis for <strong>${esc(review.repositoryName)}</strong> was executed by CodePilot AI and cryptographically sealed against tampering.
      </p>

      <div class="verification-box">
        <div style="flex-shrink: 0; border: 1px solid #d1d5db; padding: 6px; background: #ffffff; border-radius: 4px;">
          ${qrSvg}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 11pt; font-weight: 700; color: #1D4ED8; margin-bottom: 6px;">
            Automated multi-agent analysis certified
          </div>
          <div style="font-size: 9pt; color: #1f2937; line-height: 1.6;">
            <div><strong>Report ID:</strong> <span class="mono">${esc(config.referenceId)}</span></div>
            <div><strong>Generated Timestamp (UTC):</strong> <span class="mono">${esc(generatedAtUtc)}</span></div>
            <div><strong>CodePilot Engine Version:</strong> <span class="mono">v1.0.0-production</span></div>
            <div style="word-break: break-all;"><strong>Payload SHA-256 Digest:</strong> <span class="mono">${esc(sha256Hash)}</span></div>
            <div style="word-break: break-all; margin-top: 4px;">
              <strong>Online Verification URL:</strong> <a href="${esc(verifyUrl)}" class="mono">${esc(verifyUrl)}</a>
            </div>
          </div>
        </div>
      </div>

      <h2 class="sub-title">Academic / Evaluator Sign-Off</h2>
      <p style="font-size: 9.5pt; color: #4b5563;">
        Authorized faculty evaluator or technical lead endorsement for institutional grading and compliance records.
      </p>

      <div class="sig-grid">
        <div class="sig-line">Evaluator / Guide Name</div>
        <div class="sig-line">Authorized Signature</div>
        <div class="sig-line">Date</div>
      </div>
    </section>
  </div>
</body>
</html>`;
}
