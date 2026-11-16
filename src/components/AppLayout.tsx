'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  FolderGit2, 
  ArrowUpFromLine, 
  Search, 
  Terminal, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Settings, 
  Shield, 
  Command, 
  MoreHorizontal,
  Bot,
  School,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/supabase/auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isCurrent = (path: string) => {
    if (path === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  // Helper to extract clean initials from user object
  const getInitials = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      const parts = fullName.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return fullName.slice(0, 2).toUpperCase();
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return 'CP';
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e6edf3] flex flex-col font-sans antialiased">
      {/* Top Header Bar */}
      <header className="h-13 bg-[#0c101b] border-b border-[#1c2438] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Official CodePilot Project Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Logo size={30} className="shadow-md group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-white text-sm tracking-tight">CodePilot</span>
              <span className="text-slate-400 font-normal">AI</span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-slate-400 font-medium">Engineering Workspace</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Security finding counter badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161f33] border border-[#22304d] text-xs font-mono text-slate-300">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>3</span>
          </div>

          {/* Conditional Auth in Header */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-[#161f33] hover:bg-[#1e2a45] border border-[#22304d] transition-colors"
              >
                {user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${role === 'faculty' ? 'bg-[#238636]' : 'bg-[#1f6feb]'}`}>
                    {getInitials()}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0c101b] border border-[#1c2438] shadow-2xl p-2 z-50 text-xs font-mono">
                  <div className="px-3 py-2 border-b border-[#1c2438] mb-1">
                    <div className="font-semibold text-white truncate">{displayName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      role === 'faculty' 
                        ? 'bg-[#238636]/20 text-[#3fb950] border-[#238636]/40' 
                        : 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/40'
                    }`}>
                      {role === 'faculty' ? 'Faculty Member' : 'Student Developer'}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-300 hover:bg-[#161f33] hover:text-white transition-colors"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut();
                      router.push('/auth/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[#ff7b72] hover:bg-[#da3633]/15 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-3.5 py-1 rounded-md bg-[#238636] hover:bg-[#2ea043] text-xs font-semibold text-white shadow-sm transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Main Workspace with Landscape Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#0c101b] border-r border-[#1c2438] flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-[#1c2438]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              <span>Workspace</span>
              <Command className="w-3 h-3 text-slate-500" />
            </div>

            {/* Current Project Card (Dynamic) */}
            <div className="p-2.5 rounded-lg bg-[#111728] border border-[#1e293b]">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Current Project</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">
                {user ? `${displayName}'s workspace` : 'Engineering Workspace'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {user ? `${role === 'faculty' ? 'Faculty Portal' : 'Student Workspace'} • Active` : 'Guest Session • Sign in to sync'}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
            {/* Section 1: ENGINEERING */}
            <div>
              <div className="px-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Engineering
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/dashboard')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                    <span>Overview</span>
                  </div>
                </Link>

                <Link
                  href="/repositories"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/repositories')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Repositories</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#1c273f] text-slate-300">
                    4
                  </span>
                </Link>

                <Link
                  href="/review/new"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/review/new')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add repository</span>
                  </div>
                </Link>

                <Link
                  href="/review/rev-1"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/review/rev-1')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Code review</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#da3633] text-white font-bold">
                    7
                  </span>
                </Link>

                <Link
                  href="/chat/repo-1"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/chat')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terminal AI</span>
                  </div>
                </Link>

                <Link
                  href="/documentation"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/documentation')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Documentation</span>
                  </div>
                </Link>
              </nav>
            </div>

            {/* Section 2: REPORTS & LEARNING */}
            <div>
              <div className="px-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Reports &amp; Learning
              </div>
              <nav className="space-y-0.5">
                <Link
                  href="/report/rev-1"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/report')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reports</span>
                  </div>
                </Link>

                <Link
                  href="/faculty"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/faculty')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <School className="w-3.5 h-3.5 text-[#3fb950]" />
                    <span>Faculty Portal</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30">
                    Staff
                  </span>
                </Link>

                <Link
                  href="/interview/repo-1"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isCurrent('/interview')
                      ? 'bg-[#18233c] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#131a2c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Interview simulator</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#8957e5]/20 text-[#a371f7] border border-[#8957e5]/30">
                    Beta
                  </span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Sidebar Footer User Pill (Dynamic) */}
          <div className="p-3 border-t border-[#1c2438] space-y-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${role === 'faculty' ? 'bg-[#238636]' : 'bg-[#1f6feb]'}`}>
                      {getInitials()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-white leading-tight truncate">
                      {displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {role === 'faculty' ? 'Faculty Member' : 'Student Developer'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-between p-2 rounded-lg bg-[#111728] hover:bg-[#161f33] border border-[#1e293b] text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Not signed in</span>
                </div>
                <span className="text-[10px] font-mono text-[#58a6ff]">Sign in →</span>
              </Link>
            )}

            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Authentication &amp; account</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area in Landscape */}
        <main className="flex-1 overflow-y-auto bg-[#090d16] flex flex-col justify-between">
          <div className="p-6 lg:p-8 flex-1">
            {children}
          </div>

          {/* Academic Prototype Footer */}
          <footer className="px-8 py-4 border-t border-[#1c2438] flex items-center justify-between text-[11px] text-slate-500 font-mono shrink-0">
            <span>© 2026 CodePilot AI • Engineering Platform</span>
            <span>Version v1.0.0-production</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
