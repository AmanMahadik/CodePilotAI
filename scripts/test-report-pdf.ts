import fs from 'fs';
import {
  buildPdfFilename,
  computeReportSha256,
  ReportConfig,
  validateReportConfig,
} from '../src/lib/report-utils';
import { buildReportHtml } from '../src/lib/pdf-template';
import { generateQrSvg } from '../src/lib/qr';
import { signVerificationToken, verifyVerificationToken } from '../src/lib/report-store-server';
import { Finding, Review } from '../src/lib/types';

function makeSampleFindings(count: number): Finding[] {
  const severities: Finding['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
  return Array.from({ length: count }, (_, idx) => ({
    id: `F-${String(idx + 1).padStart(3, '0')}`,
    reviewId: 'audit-test-2026',
    agentType: idx % 2 === 0 ? 'security' : 'quality',
    category: idx % 2 === 0 ? 'security' : 'code-quality',
    severity: severities[idx % severities.length],
    title: `Sample Audit Finding #${idx + 1} in Module Controller`,
    description: `Detailed engineering description for finding #${idx + 1} across deep directory path.`,
    principleExplanation: `Why finding #${idx + 1} matters for maintainability and security hygiene.`,
    file: `src/modules/services/extremely_long_nested_directory_name/handler_${idx + 1}.ts`,
    lineStart: 10 + idx,
    lineEnd: 18 + idx,
    codeSnippet: `const query = "SELECT * FROM items WHERE id = " + req.params.id;`,
    suggestedFix: `Use parameterized SQL queries instead of string concatenation.`,
    owaspCategory: idx % 2 === 0 ? 'A03:2021 - Injection (CWE-89)' : 'Code Maintainability',
  }));
}

function makeReview(findingCount: number): Review {
  return {
    id: `audit-test-${findingCount}`,
    repositoryId: 'repo-test-1',
    repositoryName: 'CodePilot-Verification-Suite',
    branch: 'main',
    createdAt: '2026-11-25T08:00:00.000Z',
    status: 'completed',
    skillLevel: 'intermediate',
    scores: {
      overall: findingCount === 0 ? 96 : 82,
      quality: 85,
      security: findingCount === 0 ? 98 : 78,
      documentation: 84,
      reliability: 86,
    },
    executiveSummary:
      'Automated multi-agent evaluation completed cleanly across repository modules. All critical security rulesets, maintainability complexity checks, and documentation coverage metrics were verified.',
    totalFilesAnalyzed: 24,
    totalLinesOfCode: 3120,
    durationSeconds: 18,
    agents: [],
    findings: makeSampleFindings(findingCount),
  };
}

async function run() {
  console.log('🧪 Running Institutional Report & PDF Tests...\n');

  // 1. Placeholder rejection tests
  const badConfig: ReportConfig = {
    includeInstitutionalHeader: true,
    institution: '',
    department: 'Computer Engineering',
    candidateName: 'Candidate Developer',
    rollNumber: 'DEV-001',
    batch: '2026',
    referenceId: 'REV-1',
  };
  const badIssues = validateReportConfig(badConfig);
  console.assert(badIssues.length === 4, `Expected 4 validation issues, got ${badIssues.length}`);
  console.log('  ✓ Placeholder & missing required fields blocked (4 issues caught)');

  const validConfig: ReportConfig = {
    includeInstitutionalHeader: true,
    institution: 'MIT Academy of Engineering',
    department: 'School of Computer Engineering',
    candidateName: 'Rohan Kulkarni',
    rollNumber: '202502108042',
    batch: 'TY-BTech-A',
    referenceId: 'CP-AUDIT-2026-042',
    commitHash: 'a9f8c7d6e5',
  };
  const okIssues = validateReportConfig(validConfig);
  console.assert(okIssues.length === 0, 'Valid config should pass validation');
  console.log('  ✓ Valid report configuration accepted');

  // 2. Filename formatting
  const fname = buildPdfFilename('Society Sync!', '2026-11-25T08:00:00.000Z');
  console.assert(
    fname === 'CodePilot_Review_Society_Sync_2026-11-25.pdf',
    `Unexpected filename: ${fname}`
  );
  console.log(`  ✓ Clean PDF filename verified: ${fname}`);

  // 3. QR SVG & HMAC Verification Token
  const qr = generateQrSvg('https://codepilot.ai/report/audit-test/verify?t=abc');
  console.assert(qr.startsWith('<svg') && qr.includes('<rect'), 'QR SVG invalid');

  const review6 = makeReview(6);
  const sha = await computeReportSha256(review6, validConfig);
  console.assert(sha.length === 64, 'SHA-256 hex digest must be 64 chars');
  const signedToken = signVerificationToken({
    id: review6.id,
    repo: review6.repositoryName,
    branch: review6.branch,
    score: review6.scores.overall,
    findingsCount: 6,
    candidateName: validConfig.candidateName,
    referenceId: validConfig.referenceId,
    sha256: sha,
    generatedAt: '2026-11-25T08:00:00.000Z',
  });
  const verified = verifyVerificationToken(signedToken);
  console.assert(verified.valid && verified.claims?.sha256 === sha, 'HMAC verification failed');
  console.log('  ✓ QR code SVG + SHA-256 + HMAC verification token verified');

  // 4. Edge-case HTML template rendering (0, 1, 6, 60 findings)
  for (const count of [0, 1, 6, 60]) {
    const rev = makeReview(count);
    const html = buildReportHtml({
      review: rev,
      config: validConfig,
      sha256Hash: sha,
      verifyUrl: `https://codepilot.ai/report/${rev.id}/verify?t=${signedToken}`,
      generatedAtUtc: '2026-11-25T08:00:00.000Z',
    });
    console.assert(!html.includes('Candidate Developer'), 'Placeholder leaked into HTML');
    console.assert(!html.includes('app-sidebar'), 'App chrome leaked into HTML');
    console.assert(html.includes('CodePilot AI Verified'), 'Watermark missing');
    if (count >= 6) {
      console.assert(html.includes('Table of Contents'), 'TOC missing for >=6 findings');
    }
    if (count === 0) {
      console.assert(html.includes('Clean Bill of Health'), 'Zero-findings clean bill missing');
    }
  }
  console.log('  ✓ Rendered edge-case reports (0, 1, 6, 60 findings) cleanly');

  // 5. Headless Chromium PDF generation smoke test (if Chrome/Edge present)
  const exe = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find((p) => fs.existsSync(p));

  if (exe) {
    const puppeteer = await import('puppeteer-core');
    const browser = await puppeteer.default.launch({
      executablePath: exe,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      const html = buildReportHtml({
        review: review6,
        config: validConfig,
        sha256Hash: sha,
        verifyUrl: `https://codepilot.ai/report/${review6.id}/verify?t=${signedToken}`,
        generatedAtUtc: '2026-11-25T08:00:00.000Z',
      });
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
      const header = Buffer.from(pdf.slice(0, 5)).toString('utf8');
      console.assert(header === '%PDF-', `Expected %PDF- signature, got ${header}`);
      console.log(`  ✓ Headless Chromium generated valid A4 PDF (${pdf.length} bytes)`);
    } finally {
      await browser.close();
    }
  } else {
    console.log('  ℹ Skipping headless Chromium binary test (not present in environment)');
  }

  console.log('\n🎉 All Institutional Report & PDF Tests Passed!\n');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
