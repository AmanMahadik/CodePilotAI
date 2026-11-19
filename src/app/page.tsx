'use client';

import React from 'react';
import { useAuth } from '@/lib/supabase/auth-context';
import AuthAccountPage from './auth/login/page';
import OverviewDashboardPage from './dashboard/page';
import FacultyPortalPage from './faculty/page';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Logo size={48} rounded="rounded-2xl" className="shadow-2xl shadow-blue-500/20 animate-pulse" />
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#58a6ff]" />
          <span>Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  // If user is already authenticated or demo mode is active:
  if (user) {
    // If faculty, route directly to the Faculty Evaluation Portal
    if (role === 'faculty') {
      return <FacultyPortalPage />;
    }
    // Otherwise route to the Student Engineering Workspace Dashboard
    return <OverviewDashboardPage />;
  }

  // Unauthenticated visitors land directly on the dedicated Login & Access Module
  return <AuthAccountPage />;
}
