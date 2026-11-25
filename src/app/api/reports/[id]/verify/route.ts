import { NextRequest, NextResponse } from 'next/server';
import { computeReportSha256, ReportConfig } from '@/lib/report-utils';
import {
  getReportSnapshot,
  revokeReportSnapshot,
  saveReportSnapshot,
  signVerificationToken,
  verifyVerificationToken,
} from '@/lib/report-store-server';
import { Review } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const body = await req.json();
    const { review, config, expiresInHours } = body as {
      review: Review;
      config: ReportConfig;
      expiresInHours?: number;
    };

    if (!review || !config) {
      return NextResponse.json({ error: 'Missing review or config data' }, { status: 400 });
    }

    const generatedAtUtc = new Date().toISOString();
    const sha256Hash = await computeReportSha256(review, config);
    const exp = expiresInHours ? Date.now() + expiresInHours * 3600 * 1000 : null;

    saveReportSnapshot(id, {
      review,
      config,
      sha256Hash,
      generatedAtUtc,
      revoked: false,
      expiresAt: exp ? new Date(exp).toISOString() : null,
    });

    const token = signVerificationToken({
      id: review.id,
      repo: review.repositoryName,
      branch: review.branch,
      score: review.scores.overall,
      findingsCount: review.findings?.length || 0,
      candidateName: config.candidateName.trim(),
      referenceId: config.referenceId.trim(),
      sha256: sha256Hash,
      generatedAt: generatedAtUtc,
      exp,
    });

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || '';
    const verifyUrl = `${origin}/report/${encodeURIComponent(id)}/verify?t=${encodeURIComponent(token)}`;

    return NextResponse.json({
      sha256Hash,
      generatedAtUtc,
      verifyToken: token,
      verifyUrl,
    });
  } catch (err) {
    console.error('POST /api/reports/[id]/verify error:', err);
    return NextResponse.json({ error: 'Failed to generate verification link' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const token = req.nextUrl.searchParams.get('t');

  const snapshot = getReportSnapshot(id);
  if (snapshot?.revoked) {
    return NextResponse.json(
      { valid: false, revoked: true, error: 'This shareable report link has been revoked by its owner.' },
      { status: 403 }
    );
  }

  if (!token) {
    if (!snapshot) {
      return NextResponse.json({ valid: false, error: 'Missing verification token' }, { status: 400 });
    }
    return NextResponse.json({
      valid: true,
      hashMatches: true,
      claims: {
        id: snapshot.review.id,
        repo: snapshot.review.repositoryName,
        branch: snapshot.review.branch,
        score: snapshot.review.scores.overall,
        findingsCount: snapshot.review.findings?.length || 0,
        candidateName: snapshot.config.candidateName,
        referenceId: snapshot.config.referenceId,
        sha256: snapshot.sha256Hash,
        generatedAt: snapshot.generatedAtUtc,
      },
    });
  }

  const check = verifyVerificationToken(token);
  if (!check.valid || !check.claims) {
    return NextResponse.json(
      {
        valid: false,
        expired: check.expired,
        error: check.expired
          ? 'This report verification link has expired.'
          : 'Invalid or tampered verification signature.',
      },
      { status: 400 }
    );
  }

  const hashMatches = snapshot ? snapshot.sha256Hash === check.claims.sha256 : true;

  return NextResponse.json({
    valid: true,
    hashMatches,
    claims: check.claims,
  });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  revokeReportSnapshot(context.params.id);
  return NextResponse.json({ revoked: true });
}
