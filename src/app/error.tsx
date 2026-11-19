'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Logo from '@/components/Logo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Logo size={48} rounded="rounded-xl" className="mb-4" />
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#da3633]/15 border border-[#da3633]/30 text-[#ff7b72] text-xs font-mono mb-4">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Application Error Encountered</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        An unexpected error occurred in the workspace. You can retry the current action or return to the overview.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161f33] hover:bg-[#1e2a45] text-slate-200 border border-[#22304d] text-xs font-semibold transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
