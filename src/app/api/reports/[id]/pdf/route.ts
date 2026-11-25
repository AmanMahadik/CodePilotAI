import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { buildReportHtml } from '@/lib/pdf-template';
import {
  buildPdfFilename,
  computeReportSha256,
  ReportConfig,
  validateReportConfig,
} from '@/lib/report-utils';
import {
  getReportSnapshot,
  saveReportSnapshot,
  signVerificationToken,
} from '@/lib/report-store-server';
import { Review } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function findChromiumExecutable(): string | undefined {
  const candidates = [
    process.env.CHROMIUM_EXECUTABLE_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean) as string[];

  return candidates.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
}

function escapeHtmlAttr(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderPdfBuffer(
  req: NextRequest,
  review: Review,
  config: ReportConfig
): Promise<NextResponse> {
  // Block export if required fields are empty or placeholder values
  const issues = validateReportConfig(config);
  if (issues.length > 0) {
    return NextResponse.json(
      {
        error: 'Cannot export PDF with missing or placeholder configuration fields.',
        missingFields: issues,
      },
      { status: 400 }
    );
  }

  const generatedAtUtc = new Date().toISOString();
  const sha256Hash = await computeReportSha256(review, config);

  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://codepilot.ai';
  const verifyToken = signVerificationToken({
    id: review.id,
    repo: review.repositoryName,
    branch: review.branch,
    score: review.scores.overall,
    findingsCount: review.findings?.length || 0,
    candidateName: config.candidateName.trim(),
    referenceId: config.referenceId.trim(),
    sha256: sha256Hash,
    generatedAt: generatedAtUtc,
  });

  const verifyUrl = `${origin}/report/${encodeURIComponent(review.id)}/verify?t=${encodeURIComponent(verifyToken)}`;

  saveReportSnapshot(review.id, {
    review,
    config,
    sha256Hash,
    generatedAtUtc,
  });

  const html = buildReportHtml({
    review,
    config,
    sha256Hash,
    verifyUrl,
    generatedAtUtc,
  });

  const executablePath = findChromiumExecutable();
  if (!executablePath) {
    return NextResponse.json(
      {
        error: 'Headless Chromium binary is unavailable in this serverless runtime.',
        code: 'CHROMIUM_UNAVAILABLE',
        fallbackPrintUrl: `/report/${encodeURIComponent(review.id)}/print?autoprint=1`,
        sha256Hash,
        verifyUrl,
      },
      { status: 501 }
    );
  }

  const puppeteer = await import('puppeteer-core');
  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const safeDate = generatedAtUtc.slice(0, 10);
    const headerTemplate = `
      <div style="width:100%; font-family:Inter,Arial,sans-serif; font-size:8pt; color:#6b7280; padding:0 18mm; display:flex; justify-content:space-between; border-bottom:0.5pt solid #e5e7eb; padding-bottom:4px;">
        <span><strong>CodePilot AI</strong> | Technical Code Audit Report</span>
        <span>${escapeHtmlAttr(review.repositoryName)}</span>
      </div>`;

    const footerTemplate = `
      <div style="width:100%; font-family:Inter,Arial,sans-serif; font-size:8pt; color:#6b7280; padding:0 18mm; display:flex; justify-content:space-between; border-top:0.5pt solid #e5e7eb; padding-top:4px;">
        <span>${escapeHtmlAttr(config.referenceId)} • ${safeDate}</span>
        <span>Confidential - for academic evaluation</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`;

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: '20mm',
        right: '18mm',
        bottom: '20mm',
        left: '18mm',
      },
    });

    const filename = buildPdfFilename(review.repositoryName, review.createdAt);
    const pdfBuffer = Buffer.from(pdfUint8);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Report-SHA256': sha256Hash,
        'Cache-Control': 'no-store',
      },
    });
  } finally {
    await browser.close();
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const snapshot = getReportSnapshot(id);
    if (!snapshot) {
      return NextResponse.json(
        {
          error: 'Report snapshot not found on server. Open the report preview first to initialize export.',
        },
        { status: 404 }
      );
    }

    if (snapshot.revoked) {
      return NextResponse.json({ error: 'This report link has been revoked by the owner.' }, { status: 403 });
    }

    return await renderPdfBuffer(req, snapshot.review, snapshot.config);
  } catch (err) {
    console.error('GET /api/reports/[id]/pdf error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF document' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { review, config } = body as { review?: Review; config?: ReportConfig };
    if (!review || !config) {
      return NextResponse.json({ error: 'Missing review or config payload' }, { status: 400 });
    }
    return await renderPdfBuffer(req, review, config);
  } catch (err) {
    console.error('POST /api/reports/[id]/pdf error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF document' }, { status: 500 });
  }
}
