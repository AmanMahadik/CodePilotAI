'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(role === 'faculty' ? '/faculty' : '/dashboard');
    } else {
      router.replace('/auth/login');
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Logo size={48} rounded="rounded-2xl" className="shadow-2xl shadow-blue-500/20 animate-pulse" />
      </div>
      <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-[#58a6ff]" />
        <span>Redirecting to CodePilot AI workspace...</span>
      </div>
    </div>
  );
}
