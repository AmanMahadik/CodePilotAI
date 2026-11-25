'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ReportDocument from '@/components/ReportDocument';
import { getReviewById } from '@/lib/store';
import { computeReportSha256, ReportConfig, validateReportConfig } from '@/lib/report-utils';
import { Review } from '@/lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';

function ReportPrintContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reviewId = (params?.id as string) || '';
  const autoPrint = searchParams.get('autoprint') === '1';

  const [review, setReview] = useState<Review | null>(null);
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [sha256Hash, setSha256Hash] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') return;
      const found = getReviewById(reviewId);
      if (!found) {
        setLoading(false);
        return;
      }

      let resolvedConfig: ReportConfig = {
        includeInstitutionalHeader: found.institutionBranding?.enabled ?? true,
        institution: found.institutionBranding?.institutionName || '',
        department: found.institutionBranding?.department || '',
        candidateName: found.institutionBranding?.studentName || '',
        rollNumber: found.institutionBranding?.rollNo || '',
        batch: found.institutionBranding?.batch || '',
        referenceId: found.id.toUpperCase(),
        repositoryUrl: '',
      };

      try {
        const saved = localStorage.getItem(`codepilot_report_config_${found.id}`);
        if (saved) {
          resolvedConfig = { ...resolvedConfig, ...JSON.parse(saved) };
        }
      } catch {}

      const hash = await computeReportSha256(found, resolvedConfig);
      setReview(found);
      setConfig(resolvedConfig);
      setSha256Hash(hash);
      setVerifyUrl(`${window.location.origin}/report/${found.id}/verify`);
      setLoading(false);

      if (autoPrint && validateReportConfig(resolvedConfig).length === 0) {
        setTimeout(() => {
          window.print();
        }, 400);
      }
    };
    load();
  }, [reviewId, autoPrint]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-700">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
        <span className="text-sm font-medium">Preparing A4 print document...</span>
      </div>
    );
  }

  if (!review || !config) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-slate-800">
        <AlertTriangle className="w-8 h-8 text-amber-600 mb-3" />
        <h1 className="text-lg font-bold">Report Not Found</h1>
        <p className="text-sm text-slate-600 mt-1">No audit report exists for ID &quot;{reviewId}&quot;.</p>
      </div>
    );
  }

  const issues = validateReportConfig(config);
  if (issues.length > 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-slate-800 max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
        <h1 className="text-lg font-bold text-center">Print Export Blocked: Missing Required Fields</h1>
        <p className="text-sm text-slate-600 mt-1 text-center">
          Return to the Report Configuration panel and complete the following fields before exporting:
        </p>
        <ul className="mt-4 space-y-1 text-sm text-red-700 list-disc pl-5">
          {issues.map((i) => (
            <li key={i.field}>
              <strong>{i.label}:</strong> {i.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-0 sm:p-6 print:p-0">
      <div className="max-w-[210mm] mx-auto print:max-w-full">
        <ReportDocument
          review={review}
          config={config}
          sha256Hash={sha256Hash}
          verifyUrl={verifyUrl}
        />
      </div>
    </div>
  );
}

export default function ReportPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <ReportPrintContent />
    </Suspense>
  );
}
